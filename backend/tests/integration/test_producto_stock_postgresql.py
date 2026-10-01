"""Integration tests intentionally require PostgreSQL; they must never use SQLite."""
import os
from decimal import Decimal
from threading import Event, Thread
from uuid import uuid4

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models import Producto, UnidadMedida
from app.schemas.producto import ProductoStockUpdate
from app.services.producto_service import ProductoService

TEST_DATABASE_URL = os.getenv('TEST_DATABASE_URL')
pytestmark = pytest.mark.postgresql


@pytest.fixture()
def session_factory():
    if not TEST_DATABASE_URL:
        pytest.skip('Requires PostgreSQL: set TEST_DATABASE_URL to run integration tests.')
    engine = create_engine(TEST_DATABASE_URL, pool_pre_ping=True)
    # These tests exercise PostgreSQL capabilities directly. A disposable test
    # database is required; never point TEST_DATABASE_URL to production.
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    yield factory
    Base.metadata.drop_all(engine)
    engine.dispose()


def create_product(factory) -> Producto:
    product = Producto(
        id=uuid4(), codigo_barra=None, nombre='Producto admin', precio_compra=Decimal('10.00'),
        margen_ganancia=Decimal('20.00'), precio_venta=Decimal('12.00'), stock=Decimal('5.000'),
        stock_minimo=Decimal('0.000'), unidad=UnidadMedida.LITRO, activo=True,
    )
    with factory() as db:
        db.add(product)
        db.commit()
    return product


def test_update_stock_waits_for_row_lock(session_factory):
    # Q1: PATCH /stock debe serializarse con las ventas mediante FOR UPDATE,
    # igual que el descuento de stock de VentaService (D4).
    product = create_product(session_factory)
    first = session_factory()
    first.execute(select(Producto).where(Producto.id == product.id).with_for_update())

    started = Event()
    finished = Event()

    def patch_stock():
        with session_factory() as db:
            started.set()
            ProductoService().update_stock(db, product.id, ProductoStockUpdate(stock=Decimal('9.000')))
            finished.set()

    thread = Thread(target=patch_stock)
    thread.start()
    assert started.wait(1)
    assert not finished.wait(0.25), 'update_stock did not wait for the row lock'
    first.commit()
    assert finished.wait(2)
    thread.join(timeout=2)

    with session_factory() as db:
        assert db.get(Producto, product.id).stock == Decimal('9.000')
