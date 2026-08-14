from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.producto import ModoPrecioVenta, UnidadMedida

MONEY_QUANTUM = Decimal("0.01")
STOCK_QUANTUM = Decimal("0.001")


def decimal_money(value: Decimal) -> Decimal:
    return value.quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)


def decimal_stock(value: Decimal) -> Decimal:
    return value.quantize(STOCK_QUANTUM, rounding=ROUND_HALF_UP)


class ProductoBase(BaseModel):
    codigo_barra: str | None = Field(default=None, max_length=100)
    nombre: str = Field(min_length=1, max_length=160)
    imagen_url: str | None = None
    imagen_public_id: str | None = Field(default=None, max_length=255)
    precio_compra: Decimal = Field(ge=0, max_digits=14, decimal_places=2)
    margen_ganancia: Decimal = Field(ge=0, max_digits=8, decimal_places=2)
    precio_venta: Decimal = Field(ge=0, max_digits=14, decimal_places=2)
    modo_precio_venta: ModoPrecioVenta = ModoPrecioVenta.CALCULADO
    stock: Decimal = Field(ge=0, max_digits=14, decimal_places=3)
    stock_minimo: Decimal = Field(ge=0, max_digits=14, decimal_places=3)
    unidad: UnidadMedida

    @field_validator("codigo_barra", mode="before")
    @classmethod
    def normalize_barcode(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

    @field_validator("nombre")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("El nombre no puede estar vacío")
        return value

    @field_validator("precio_compra", "margen_ganancia", "precio_venta", mode="after")
    @classmethod
    def normalize_money(cls, value: Decimal) -> Decimal:
        return decimal_money(value)

    @field_validator("stock", "stock_minimo", mode="after")
    @classmethod
    def normalize_stock(cls, value: Decimal) -> Decimal:
        return decimal_stock(value)

    @model_validator(mode="after")
    def validate_unit_quantity(self) -> "ProductoBase":
        if self.unidad == UnidadMedida.UNIDAD:
            for field_name in ("stock", "stock_minimo"):
                value = getattr(self, field_name)
                if value != value.to_integral_value():
                    raise ValueError(f"{field_name} debe ser entero cuando la unidad es UNIDAD")
        return self


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(ProductoBase):
    activo: bool | None = None


class ProductoStockUpdate(BaseModel):
    stock: Decimal = Field(ge=0, max_digits=14, decimal_places=3)

    @field_validator("stock", mode="after")
    @classmethod
    def normalize(cls, value: Decimal) -> Decimal:
        return decimal_stock(value)


class ProductoPrecioUpdate(BaseModel):
    precio_compra: Decimal | None = Field(default=None, ge=0, max_digits=14, decimal_places=2)
    margen_ganancia: Decimal | None = Field(default=None, ge=0, max_digits=8, decimal_places=2)
    precio_venta: Decimal | None = Field(default=None, ge=0, max_digits=14, decimal_places=2)
    modo_precio_venta: ModoPrecioVenta | None = None

    @field_validator("precio_compra", "margen_ganancia", "precio_venta", mode="after")
    @classmethod
    def normalize(cls, value: Decimal | None) -> Decimal | None:
        return decimal_money(value) if value is not None else value


class ProductoResponse(ProductoBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    activo: bool
    created_at: datetime
    updated_at: datetime
