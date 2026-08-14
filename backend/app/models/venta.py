import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Venta(Base):
    __tablename__ = 'ventas'

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True)
    request_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    total: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    detalles: Mapped[list['DetalleVenta']] = relationship(back_populates='venta', cascade='all, delete-orphan')


class DetalleVenta(Base):
    __tablename__ = 'detalles_venta'

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    venta_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey('ventas.id'), nullable=False, index=True)
    producto_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey('productos.id'), nullable=False, index=True)
    producto_nombre: Mapped[str] = mapped_column(String(160), nullable=False)
    unidad: Mapped[str] = mapped_column(String(20), nullable=False)
    cantidad: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False)
    precio_unitario: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)

    venta: Mapped[Venta] = relationship(back_populates='detalles')
