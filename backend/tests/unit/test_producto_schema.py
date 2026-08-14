from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.models.producto import UnidadMedida
from app.schemas.producto import ProductoCreate


def payload(**overrides):
    data = {
        "nombre": "Lavandina",
        "precio_compra": "1000.00",
        "margen_ganancia": "25.00",
        "precio_venta": "1250.00",
        "stock": "5.500",
        "stock_minimo": "1.000",
        "unidad": UnidadMedida.LITRO,
    }
    data.update(overrides)
    return data


def test_decimal_values_are_preserved_without_float() -> None:
    producto = ProductoCreate(**payload())
    assert producto.precio_venta == Decimal("1250.00")
    assert producto.stock == Decimal("5.500")


def test_unit_products_reject_fractional_stock() -> None:
    with pytest.raises(ValidationError):
        ProductoCreate(**payload(unidad=UnidadMedida.UNIDAD, stock="1.500"))
