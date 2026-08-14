from decimal import Decimal
from uuid import uuid4

from app.models.producto import ModoPrecioVenta, Producto, UnidadMedida
from app.schemas.producto import ProductoPrecioUpdate
from app.services.producto_service import ProductoService


class FakeSession:
    def add(self, _: object) -> None:
        pass

    def commit(self) -> None:
        pass

    def refresh(self, _: object) -> None:
        pass


def producto(*, barcode: str | None = None, modo: ModoPrecioVenta = ModoPrecioVenta.CALCULADO) -> Producto:
    return Producto(
        id=uuid4(),
        codigo_barra=barcode,
        nombre="Detergente",
        precio_compra=Decimal("100.00"),
        margen_ganancia=Decimal("25.00"),
        precio_venta=Decimal("125.00"),
        modo_precio_venta=modo,
        stock=Decimal("5.000"),
        stock_minimo=Decimal("1.000"),
        unidad=UnidadMedida.LITRO,
        activo=True,
    )


def test_recalculates_sale_price_with_decimal_when_mode_is_calculated(monkeypatch) -> None:
    item = producto()
    service = ProductoService()
    monkeypatch.setattr(service, "get", lambda _db, _id: item)

    result = service.update_price(
        FakeSession(),
        item.id,
        ProductoPrecioUpdate(precio_compra=Decimal("99.99"), margen_ganancia=Decimal("33.33")),
    )

    assert result.precio_venta == Decimal("133.32")
    assert result.modo_precio_venta == ModoPrecioVenta.CALCULADO


def test_manual_sale_price_is_not_recalculated_when_cost_changes(monkeypatch) -> None:
    item = producto(modo=ModoPrecioVenta.MANUAL)
    item.precio_venta = Decimal("140.00")
    service = ProductoService()
    monkeypatch.setattr(service, "get", lambda _db, _id: item)

    result = service.update_price(FakeSession(), item.id, ProductoPrecioUpdate(precio_compra=Decimal("200.00")))

    assert result.precio_venta == Decimal("140.00")
    assert result.modo_precio_venta == ModoPrecioVenta.MANUAL
