from dataclasses import dataclass
from uuid import uuid4

import pytest

from app.core.exceptions import AppError
from app.models.producto import Producto
from app.schemas.producto import ProductoCreate
from app.services.producto_service import ProductoService


@dataclass
class FakeRepository:
    products: list[Producto]

    def create(self, _db, product: Producto) -> Producto:
        if product.id is None:
            product.id = uuid4()
        if product.activo is None:
            product.activo = True
        duplicate = next(
            (p for p in self.products if p.activo and p.codigo_barra == product.codigo_barra and product.codigo_barra is not None),
            None,
        )
        if duplicate:
            raise AppError("El código de barras ya pertenece a un producto activo", "BARCODE_ALREADY_EXISTS", 409)
        self.products.append(product)
        return product


def payload(barcode: str) -> ProductoCreate:
    return ProductoCreate(
        codigo_barra=barcode,
        nombre="Producto",
        precio_compra="10",
        margen_ganancia="20",
        precio_venta="12",
        stock="1",
        stock_minimo="0",
        unidad="UNIDAD",
    )


def test_barcode_can_be_reused_after_logical_deactivation(monkeypatch) -> None:
    service = ProductoService()
    fake_repository = FakeRepository([])
    service.repository = fake_repository  # type: ignore[assignment]
    monkeypatch.setattr(ProductoService, "_save", staticmethod(lambda _db, product: fake_repository.create(_db, product)))

    first = service.create(None, payload("7791234567890"))
    first.activo = False
    second = service.create(None, payload("7791234567890"))

    assert second.codigo_barra == first.codigo_barra
    assert second.id != first.id


def test_active_duplicate_barcode_is_rejected(monkeypatch) -> None:
    service = ProductoService()
    fake_repository = FakeRepository([])
    service.repository = fake_repository  # type: ignore[assignment]
    monkeypatch.setattr(ProductoService, "_save", staticmethod(lambda _db, product: fake_repository.create(_db, product)))

    service.create(None, payload("7791234567890"))
    with pytest.raises(AppError, match="código de barras"):
        service.create(None, payload("7791234567890"))
