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


def test_amounts_and_stock_are_normalized_to_declared_precision() -> None:
    producto = ProductoCreate(
        **payload(
            precio_compra="10.5",
            margen_ganancia="25.2",
            precio_venta="13.1",
            stock="2.5",
            stock_minimo="0.1",
        )
    )
    assert producto.precio_compra == Decimal("10.50")
    assert producto.margen_ganancia == Decimal("25.20")
    assert producto.precio_venta == Decimal("13.10")
    assert producto.stock == Decimal("2.500")
    assert producto.stock_minimo == Decimal("0.100")
