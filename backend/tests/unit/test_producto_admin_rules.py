from decimal import Decimal
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError

from app.core.exceptions import AppError
from app.main import app
from app.models.producto import ModoPrecioVenta, Producto, UnidadMedida
from app.schemas.producto import ProductoCreate, ProductoStockUpdate, ProductoUpdate
from app.services.producto_service import ProductoService


class FakeSession:
    def __init__(self, integrity_error: IntegrityError | None = None) -> None:
        self._integrity_error = integrity_error
        self.rolled_back = False

    def add(self, _: object) -> None:
        pass

    def commit(self) -> None:
        if self._integrity_error:
            raise self._integrity_error

    def rollback(self) -> None:
        self.rolled_back = True

    def refresh(self, _: object) -> None:
        pass


def producto(
    *,
    activo: bool = True,
    modo: ModoPrecioVenta = ModoPrecioVenta.CALCULADO,
    unidad: UnidadMedida = UnidadMedida.LITRO,
    barcode: str | None = None,
) -> Producto:
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
        unidad=unidad,
        activo=activo,
    )


def create_payload(**overrides) -> ProductoCreate:
    values = {
        "nombre": "Lavandina",
        "precio_compra": "100.00",
        "margen_ganancia": "25.00",
        "precio_venta": "999.00",
        "stock": "1.000",
        "stock_minimo": "0.000",
        "unidad": "LITRO",
    }
    values.update(overrides)
    return ProductoCreate(**values)


# --- Q1: PATCH /stock toma FOR UPDATE ---


def test_update_stock_locks_the_row(monkeypatch) -> None:
    item = producto()
    service = ProductoService()
    calls: list[str] = []

    def get_by_id_for_update(_db, _producto_id):
        calls.append("for_update")
        return item

    monkeypatch.setattr(service.repository, "get_by_id_for_update", get_by_id_for_update)

    result = service.update_stock(FakeSession(), item.id, ProductoStockUpdate(stock=Decimal("7.000")))

    assert calls == ["for_update"]
    assert result.stock == Decimal("7.000")


def test_update_stock_rejects_fractional_stock_for_unit_products(monkeypatch) -> None:
    item = producto(unidad=UnidadMedida.UNIDAD)
    service = ProductoService()
    monkeypatch.setattr(service.repository, "get_by_id_for_update", lambda _db, _id: item)

    with pytest.raises(AppError) as error:
        service.update_stock(FakeSession(), item.id, ProductoStockUpdate(stock=Decimal("1.500")))

    assert error.value.code == "INVALID_QUANTITY"


def test_update_stock_missing_product_raises_not_found(monkeypatch) -> None:
    service = ProductoService()
    monkeypatch.setattr(service.repository, "get_by_id_for_update", lambda _db, _id: None)

    with pytest.raises(AppError) as error:
        service.update_stock(FakeSession(), uuid4(), ProductoStockUpdate(stock=Decimal("1.000")))

    assert error.value.code == "PRODUCT_NOT_FOUND"


# --- Q2: reactivación ---


def test_reactivate_activates_inactive_product(monkeypatch) -> None:
    item = producto(activo=False)
    service = ProductoService()
    monkeypatch.setattr(service, "get", lambda _db, _id: item)

    result = service.reactivate(FakeSession(), item.id)

    assert result.activo is True


def test_reactivate_is_idempotent_for_active_products(monkeypatch) -> None:
    item = producto(activo=True)
    service = ProductoService()
    monkeypatch.setattr(service, "get", lambda _db, _id: item)
    monkeypatch.setattr(service, "_save", lambda _db, _producto: pytest.fail("no debe escribir si ya está activo"))

    result = service.reactivate(FakeSession(), item.id)

    assert result.activo is True


def test_reactivate_barcode_conflict_raises_specific_error(monkeypatch) -> None:
    item = producto(activo=False, barcode="7791234567890")
    service = ProductoService()
    monkeypatch.setattr(service, "get", lambda _db, _id: item)
    integrity = IntegrityError("INSERT", {}, Exception("duplicate key ... ux_productos_codigo_barra_activo"))

    with pytest.raises(AppError) as error:
        service.reactivate(FakeSession(integrity), item.id)

    assert error.value.code == "BARCODE_ALREADY_EXISTS"


# --- Q4: POST/PUT recalculan el precio en modo CALCULADO ---


def test_create_recalculates_price_when_mode_is_calculated() -> None:
    result = ProductoService().create(FakeSession(), create_payload())

    assert result.precio_venta == Decimal("125.00")  # 100.00 * (1 + 25/100), ignora el 999.00 enviado


def test_create_keeps_manual_price() -> None:
    result = ProductoService().create(FakeSession(), create_payload(modo_precio_venta="MANUAL", precio_venta="150.00"))

    assert result.precio_venta == Decimal("150.00")


def test_update_recalculates_price_when_mode_is_calculated(monkeypatch) -> None:
    item = producto()
    service = ProductoService()
    monkeypatch.setattr(service, "get", lambda _db, _id: item)
    data = ProductoUpdate(
        nombre="Detergente",
        precio_compra="200.00",
        margen_ganancia="10.00",
        precio_venta="999.00",
        stock="888.000",
        stock_minimo="2.000",
        unidad="LITRO",
    )

    result = service.update(FakeSession(), item.id, data)

    assert result.precio_venta == Decimal("220.00")  # 200.00 * (1 + 10/100)


# --- Q5: PUT ignora stock (y activo), stock_minimo editable ---


def test_update_ignores_stock_but_allows_stock_minimo(monkeypatch) -> None:
    item = producto()
    service = ProductoService()
    monkeypatch.setattr(service, "get", lambda _db, _id: item)
    data = ProductoUpdate(
        nombre="Detergente",
        precio_compra="100.00",
        margen_ganancia="25.00",
        precio_venta="125.00",
        stock="888.000",
        stock_minimo="2.000",
        unidad="LITRO",
    )

    result = service.update(FakeSession(), item.id, data)

    assert result.stock == Decimal("5.000")  # el stock del PUT se ignora
    assert result.stock_minimo == Decimal("2.000")


# --- Q3: formato uniforme de 422 ---


def test_validation_errors_use_uniform_format() -> None:
    client = TestClient(app)
    response = client.post("/api/v1/productos", json={"nombre": ""})

    assert response.status_code == 422
    body = response.json()
    assert body["code"] == "VALIDATION_ERROR"
    assert isinstance(body["detail"], str) and body["detail"]
    assert isinstance(body["fields"], list) and body["fields"]
    assert all("field" in field and "message" in field for field in body["fields"])
