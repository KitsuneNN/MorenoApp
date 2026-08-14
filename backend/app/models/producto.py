import enum
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Enum, Index, Numeric, String, Text, Uuid, func, text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class UnidadMedida(str, enum.Enum):
    UNIDAD = "UNIDAD"
    GRAMO = "GRAMO"
    KILOGRAMO = "KILOGRAMO"
    MILILITRO = "MILILITRO"
    LITRO = "LITRO"


class ModoPrecioVenta(str, enum.Enum):
    CALCULADO = "CALCULADO"
    MANUAL = "MANUAL"


class Producto(Base):
    __tablename__ = "productos"
    __table_args__ = (
        Index(
            "ux_productos_codigo_barra_activo",
            "codigo_barra",
            unique=True,
            postgresql_where=text("activo = true"),
        ),
        Index("ix_productos_activo_nombre", "activo", "nombre"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    codigo_barra: Mapped[str | None] = mapped_column(String(100), nullable=True)
    nombre: Mapped[str] = mapped_column(String(160), nullable=False)
    imagen_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    imagen_public_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    precio_compra: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    margen_ganancia: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    precio_venta: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    modo_precio_venta: Mapped[ModoPrecioVenta] = mapped_column(
        Enum(ModoPrecioVenta, name="modo_precio_venta"), nullable=False, default=ModoPrecioVenta.CALCULADO
    )
    stock: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False, default=Decimal("0"))
    stock_minimo: Mapped[Decimal] = mapped_column(Numeric(14, 3), nullable=False, default=Decimal("0"))
    unidad: Mapped[UnidadMedida] = mapped_column(Enum(UnidadMedida, name="unidad_medida"), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
