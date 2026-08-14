from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.producto import Producto


class ProductoRepository:
    def get_by_id(self, db: Session, producto_id: UUID) -> Producto | None:
        return db.scalar(select(Producto).where(Producto.id == producto_id))

    def get_by_barcode(self, db: Session, codigo_barra: str) -> Producto | None:
        return db.scalar(select(Producto).where(Producto.codigo_barra == codigo_barra, Producto.activo.is_(True)))

    def list(self, db: Session, *, page: int, page_size: int, search: str | None, low_stock: bool, active: bool | None) -> tuple[list[Producto], int]:
        filters = []
        if active is not None:
            filters.append(Producto.activo.is_(active))
        if search:
            filters.append(Producto.nombre.ilike(f"%{search.strip()}%"))
        if low_stock:
            filters.append(Producto.stock <= Producto.stock_minimo)
        query = select(Producto).where(*filters).order_by(Producto.nombre, Producto.id)
        total = db.scalar(select(func.count()).select_from(Producto).where(*filters)) or 0
        products = list(db.scalars(query.offset((page - 1) * page_size).limit(page_size)))
        return products, total

    def create(self, db: Session, producto: Producto) -> Producto:
        db.add(producto)
        db.flush()
        db.refresh(producto)
        return producto
