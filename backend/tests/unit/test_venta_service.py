from decimal import Decimal
from uuid import uuid4

import pytest

from app.core.exceptions import AppError
from app.models.producto import Producto, UnidadMedida
from app.schemas.venta import VentaItemCreate, fingerprint_items
from app.services.venta_service import VentaService, merge_items, money


def test_merge_items_combines_same_product_with_decimal_quantities() -> None:
    product_id = uuid4()
    merged = merge_items([VentaItemCreate(producto_id=product_id, cantidad='0.500'), VentaItemCreate(producto_id=product_id, cantidad='1.250')])
    assert len(merged) == 1
    assert merged[0].cantidad == Decimal('1.750')


def test_fingerprint_is_independent_of_cart_item_order() -> None:
    first, second = uuid4(), uuid4()
    a = [VentaItemCreate(producto_id=first, cantidad='1'), VentaItemCreate(producto_id=second, cantidad='0.500')]
    b = list(reversed(a))
    assert fingerprint_items(a) == fingerprint_items(b)


def test_inactive_product_cannot_be_sold() -> None:
    product = Producto(id=uuid4(), nombre='Baja', precio_compra=Decimal('1'), margen_ganancia=Decimal('0'), precio_venta=Decimal('1'), stock=Decimal('10'), stock_minimo=Decimal('0'), unidad=UnidadMedida.UNIDAD, activo=False)
    with pytest.raises(AppError, match='inactivo'):
        VentaService._validate_sellable(product, Decimal('1'))


def test_money_rounds_sale_subtotals_with_decimal() -> None:
    assert money(Decimal('999.99') * Decimal('1.750')) == Decimal('1749.98')
