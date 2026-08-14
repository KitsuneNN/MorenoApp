from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.producto import Producto
from app.models.venta import Venta


class VentaRepository:
    def get_by_id(self, db: Session, venta_id: UUID) -> Venta | None:
        return db.scalar(select(Venta).options(selectinload(Venta.detalles)).where(Venta.id == venta_id))

    def lock_products_in_order(self, db: Session, product_ids: list[UUID]) -> list[Producto]:
        # El orden global por UUID evita que dos ventas tomen locks opuestos.
        return list(db.scalars(
            select(Producto)
            .where(Producto.id.in_(product_ids))
            .order_by(Producto.id)
            .with_for_update()
        ))

    def list(self, db: Session, page: int, page_size: int) -> tuple[list[Venta], int]:
        total = db.scalar(select(func.count()).select_from(Venta)) or 0
        rows = list(db.scalars(
            select(Venta).options(selectinload(Venta.detalles)).order_by(Venta.created_at.desc(), Venta.id.desc()).offset((page - 1) * page_size).limit(page_size)
        ))
        return rows, total
