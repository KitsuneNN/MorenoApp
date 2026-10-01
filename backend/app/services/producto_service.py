from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.models.producto import ModoPrecioVenta, Producto
from app.repositories.producto_repository import ProductoRepository
from app.schemas.producto import ProductoCreate, ProductoPrecioUpdate, ProductoStockUpdate, ProductoUpdate, decimal_money


class ProductoService:
    def __init__(self) -> None:
        self.repository = ProductoRepository()

    def list(self, db: Session, **filters: object):
        return self.repository.list(db, **filters)

    def get(self, db: Session, producto_id: UUID) -> Producto:
        producto = self.repository.get_by_id(db, producto_id)
        if not producto:
            raise AppError("Producto no encontrado", "PRODUCT_NOT_FOUND", 404)
        return producto

    def get_by_barcode(self, db: Session, codigo_barra: str) -> Producto:
        producto = self.repository.get_by_barcode(db, codigo_barra)
        if not producto:
            raise AppError("Producto no encontrado", "PRODUCT_NOT_FOUND", 404)
        return producto

    def create(self, db: Session, data: ProductoCreate) -> Producto:
        producto = Producto(**data.model_dump())
        self._recalculate_price_if_calculated(producto)
        return self._save(db, producto)

    def update(self, db: Session, producto_id: UUID, data: ProductoUpdate) -> Producto:
        producto = self.get(db, producto_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            # `activo` solo cambia por baja lógica/reactivación; `stock` solo por
            # PATCH /stock (con FOR UPDATE) para no pisar ventas concurrentes.
            if field not in ("activo", "stock"):
                setattr(producto, field, value)
        self._recalculate_price_if_calculated(producto)
        return self._save(db, producto)

    def update_stock(self, db: Session, producto_id: UUID, data: ProductoStockUpdate) -> Producto:
        producto = self.repository.get_by_id_for_update(db, producto_id)
        if not producto:
            raise AppError("Producto no encontrado", "PRODUCT_NOT_FOUND", 404)
        if producto.unidad.value == "UNIDAD" and data.stock != data.stock.to_integral_value():
            raise AppError("El stock debe ser entero para productos por unidad", "INVALID_QUANTITY")
        producto.stock = data.stock
        return self._save(db, producto)

    def update_price(self, db: Session, producto_id: UUID, data: ProductoPrecioUpdate) -> Producto:
        producto = self.get(db, producto_id)
        values = data.model_dump(exclude_unset=True)
        for field, value in values.items():
            setattr(producto, field, value)
        # Un precio escrito explícitamente es una decisión manual, salvo que el cliente
        # indique expresamente otro modo en el mismo request.
        if "precio_venta" in values and "modo_precio_venta" not in values:
            producto.modo_precio_venta = ModoPrecioVenta.MANUAL
        if producto.modo_precio_venta == ModoPrecioVenta.CALCULADO and ({"precio_compra", "margen_ganancia"} & values.keys()):
            producto.precio_venta = decimal_money(producto.precio_compra * (1 + producto.margen_ganancia / 100))
        return self._save(db, producto)

    def deactivate(self, db: Session, producto_id: UUID) -> None:
        producto = self.get(db, producto_id)
        producto.activo = False
        self._save(db, producto)

    def reactivate(self, db: Session, producto_id: UUID) -> Producto:
        producto = self.get(db, producto_id)
        if producto.activo:
            # Idempotente: reactivar un producto activo no genera error ni escritura.
            return producto
        producto.activo = True
        # Si otro producto activo ya usa el mismo código de barras, el índice
        # parcial (D2) dispara IntegrityError y _save lo mapea a
        # BARCODE_ALREADY_EXISTS.
        return self._save(db, producto)

    @staticmethod
    def _recalculate_price_if_calculated(producto: Producto) -> None:
        # En altas y ediciones el precio de venta en modo CALCULADO siempre se
        # deriva de compra y margen; el precio recibido se ignora. El schema
        # exige ambos campos, así que un 422 ocurre antes de llegar acá.
        if producto.modo_precio_venta == ModoPrecioVenta.CALCULADO:
            producto.precio_venta = decimal_money(producto.precio_compra * (1 + producto.margen_ganancia / 100))

    @staticmethod
    def _save(db: Session, producto: Producto) -> Producto:
        try:
            db.add(producto)
            db.commit()
            db.refresh(producto)
            return producto
        except IntegrityError as exc:
            db.rollback()
            if "ux_productos_codigo_barra_activo" in str(exc.orig):
                raise AppError("El código de barras ya pertenece a un producto activo", "BARCODE_ALREADY_EXISTS", 409) from exc
            raise
