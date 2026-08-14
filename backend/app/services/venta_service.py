from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.models.producto import Producto, UnidadMedida
from app.models.venta import DetalleVenta, Venta
from app.repositories.venta_repository import VentaRepository
from app.schemas.venta import VentaCreate, VentaItemCreate, fingerprint_items

MONEY_QUANTUM = Decimal('0.01')


def money(value: Decimal) -> Decimal:
    return value.quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)


def merge_items(items: list[VentaItemCreate]) -> list[VentaItemCreate]:
    quantities: dict[UUID, Decimal] = defaultdict(lambda: Decimal('0'))
    for item in items:
        quantities[item.producto_id] += item.cantidad
    return [VentaItemCreate(producto_id=product_id, cantidad=quantity) for product_id, quantity in quantities.items()]


class VentaService:
    def __init__(self) -> None:
        self.repository = VentaRepository()

    def get(self, db: Session, venta_id: UUID) -> Venta:
        venta = self.repository.get_by_id(db, venta_id)
        if not venta:
            raise AppError('Venta no encontrada', 'SALE_NOT_FOUND', 404)
        return venta

    def list(self, db: Session, page: int, page_size: int):
        return self.repository.list(db, page, page_size)

    def create(self, db: Session, data: VentaCreate) -> Venta:
        items = merge_items(data.items)
        fingerprint = fingerprint_items(items)
        existing = self.repository.get_by_id(db, data.id)
        if existing:
            return self._existing_or_conflict(existing, fingerprint)

        try:
            # Locks solicitados siempre por producto_id ascendente.
            product_ids = sorted((item.producto_id for item in items), key=str)
            products = self.repository.lock_products_in_order(db, product_ids)

            # Otra request con el mismo UUID pudo terminar mientras esperábamos locks.
            existing = self.repository.get_by_id(db, data.id)
            if existing:
                return self._existing_or_conflict(existing, fingerprint)

            product_by_id = {product.id: product for product in products}
            if len(product_by_id) != len(product_ids):
                raise AppError('Uno o más productos no existen', 'PRODUCT_NOT_FOUND', 404)

            details: list[DetalleVenta] = []
            total = Decimal('0')
            for item in sorted(items, key=lambda value: str(value.producto_id)):
                product = product_by_id[item.producto_id]
                self._validate_sellable(product, item.cantidad)
                subtotal = money(product.precio_venta * item.cantidad)
                total += subtotal
                product.stock -= item.cantidad
                details.append(DetalleVenta(
                    producto_id=product.id,
                    producto_nombre=product.nombre,
                    unidad=product.unidad.value,
                    cantidad=item.cantidad,
                    precio_unitario=product.precio_venta,
                    subtotal=subtotal,
                ))

            venta = Venta(id=data.id, request_fingerprint=fingerprint, total=money(total), detalles=details)
            # Savepoint: un UUID simultáneo no deja inválida la transacción externa.
            try:
                with db.begin_nested():
                    db.add(venta)
                    db.flush()
            except IntegrityError:
                # El savepoint evita invalidar la sesión por el conflicto, pero
                # los descuentos de stock ocurrieron antes del insert. Se hace
                # rollback completo antes de devolver la venta de la request
                # concurrente para no descontar stock dos veces.
                db.rollback()
                existing = self.repository.get_by_id(db, data.id)
                if existing:
                    return self._existing_or_conflict(existing, fingerprint)
                raise

            db.commit()
            db.refresh(venta)
            return venta
        except AppError:
            db.rollback()
            raise
        except Exception:
            db.rollback()
            raise

    @staticmethod
    def _existing_or_conflict(existing: Venta, fingerprint: str) -> Venta:
        if existing.request_fingerprint != fingerprint:
            raise AppError('El identificador de venta ya fue usado con un carrito diferente', 'IDEMPOTENCY_CONFLICT', 409)
        return existing

    @staticmethod
    def _validate_sellable(product: Producto, quantity: Decimal) -> None:
        if not product.activo:
            raise AppError(f'{product.nombre} está inactivo', 'PRODUCT_INACTIVE', 409)
        if product.unidad == UnidadMedida.UNIDAD and quantity != quantity.to_integral_value():
            raise AppError(f'La cantidad de {product.nombre} debe ser entera', 'INVALID_QUANTITY')
        if product.stock < quantity:
            raise AppError(f'Stock insuficiente para {product.nombre}', 'INSUFFICIENT_STOCK', 409)
