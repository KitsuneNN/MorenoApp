from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from hashlib import sha256
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.producto import UnidadMedida
from app.schemas.common import Page

MONEY_QUANTUM = Decimal('0.01')
QUANTITY_QUANTUM = Decimal('0.001')


class VentaItemCreate(BaseModel):
    producto_id: UUID
    cantidad: Decimal = Field(gt=0, max_digits=14, decimal_places=3)

    @field_validator('cantidad', mode='after')
    @classmethod
    def normalize_quantity(cls, value: Decimal) -> Decimal:
        return value.quantize(QUANTITY_QUANTUM, rounding=ROUND_HALF_UP)


class VentaCreate(BaseModel):
    id: UUID
    items: list[VentaItemCreate] = Field(min_length=1, max_length=100)


class DetalleVentaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    producto_id: UUID
    producto_nombre: str
    unidad: UnidadMedida
    cantidad: Decimal
    precio_unitario: Decimal
    subtotal: Decimal


class VentaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    total: Decimal
    created_at: datetime
    detalles: list[DetalleVentaResponse]


VentaPage = Page[VentaResponse]


def fingerprint_items(items: list[VentaItemCreate]) -> str:
    # El orden del carrito no cambia la identidad semántica de una venta.
    canonical = '|'.join(f'{item.producto_id}:{item.cantidad.quantize(QUANTITY_QUANTUM)}' for item in sorted(items, key=lambda i: str(i.producto_id)))
    return sha256(canonical.encode('utf-8')).hexdigest()
