"""Integration tests intentionally require PostgreSQL; they must never use SQLite."""
import os
from concurrent.futures import ThreadPoolExecutor
from decimal import Decimal
from threading import Barrier, Event, Thread
from uuid import uuid4

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.core.database import Base
from app.core.exceptions import AppError
from app.models import DetalleVenta, Producto, UnidadMedida, Venta
from app.schemas.venta import VentaCreate, VentaItemCreate
from app.services.venta_service import VentaService

TEST_DATABASE_URL = os.getenv('TEST_DATABASE_URL')
pytestmark = pytest.mark.postgresql
@pytest.fixture()
def session_factory():
    # Function-scoped on purpose: each test needs a pristine schema. A
    # module-scoped factory leaked the venta committed by the concurrency test
    # into this module's whole-table emptiness asserts, failing them with a
    # row the rejected sale never created.
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


def create_product(factory, stock: str = '1.000') -> Producto:
    product = Producto(
        id=uuid4(), codigo_barra=None, nombre='Producto concurrente', precio_compra=Decimal('10.00'),
        margen_ganancia=Decimal('20.00'), precio_venta=Decimal('12.00'), stock=Decimal(stock),
        stock_minimo=Decimal('0.000'), unidad=UnidadMedida.LITRO, activo=True,
    )
    with factory() as db:
        db.add(product)
        db.commit()
    return product


def test_for_update_blocks_second_transaction(session_factory):
    product = create_product(session_factory)
    first = session_factory()
    first.execute(select(Producto).where(Producto.id == product.id).with_for_update()).scalar_one()

    second_started = Event()
    second_acquired_lock = Event()

    def second_transaction():
        with session_factory() as db:
            second_started.set()
            db.execute(select(Producto).where(Producto.id == product.id).with_for_update()).scalar_one()
            second_acquired_lock.set()

    thread = Thread(target=second_transaction)
    thread.start()
    assert second_started.wait(1)
    assert not second_acquired_lock.wait(0.25), 'PostgreSQL did not block the second row lock'
    first.commit()
    assert second_acquired_lock.wait(2)
    thread.join(timeout=2)


def test_two_concurrent_sales_cannot_oversell(session_factory):
    product = create_product(session_factory, stock='1.000')
    barrier = Barrier(2)

    def confirm_sale():
        with session_factory() as db:
            payload = VentaCreate(id=uuid4(), items=[VentaItemCreate(producto_id=product.id, cantidad='1.000')])
            barrier.wait(timeout=2)
            try:
                return ('success', VentaService().create(db, payload).id)
            except AppError as error:
                return ('error', error.code)

    with ThreadPoolExecutor(max_workers=2) as executor:
        outcomes = list(executor.map(lambda _: confirm_sale(), range(2)))

    assert sorted(kind for kind, _ in outcomes) == ['error', 'success']
    assert next(value for kind, value in outcomes if kind == 'error') == 'INSUFFICIENT_STOCK'
    with session_factory() as db:
        final_product = db.get(Producto, product.id)
        sales = list(db.scalars(select(Venta)))
        assert final_product.stock == Decimal('0.000')
        assert len(sales) == 1

@pytest.mark.postgresql
def test_merged_duplicate_lines_are_validated_against_combined_stock(session_factory):
    product = create_product(session_factory, stock='1.000')
    payload = VentaCreate(
        id=uuid4(),
        items=[
            VentaItemCreate(producto_id=product.id, cantidad='0.750'),
            VentaItemCreate(producto_id=product.id, cantidad='0.750'),
        ],
    )

    with session_factory() as db:
        with pytest.raises(AppError) as error:
            VentaService().create(db, payload)
        assert error.value.code == 'INSUFFICIENT_STOCK'

    with session_factory() as db:
        final_product = db.get(Producto, product.id)
        assert final_product.stock == Decimal('1.000')
        assert db.get(Venta, payload.id) is None
        assert list(db.scalars(select(Venta))) == []
        assert list(db.scalars(select(DetalleVenta))) == []


def test_rejected_single_line_sale_leaves_no_rows(session_factory):
    # General regression guard (no line merging involved): a sale whose single
    # line exceeds stock must not persist the venta, its detalles, nor any
    # stock change.
    product = create_product(session_factory, stock='1.000')
    payload = VentaCreate(id=uuid4(), items=[VentaItemCreate(producto_id=product.id, cantidad='2.000')])

    with session_factory() as db:
        with pytest.raises(AppError) as error:
            VentaService().create(db, payload)
        assert error.value.code == 'INSUFFICIENT_STOCK'

    with session_factory() as db:
        final_product = db.get(Producto, product.id)
        assert final_product.stock == Decimal('1.000')
        assert db.get(Venta, payload.id) is None
        assert list(db.scalars(select(Venta))) == []
        assert list(db.scalars(select(DetalleVenta))) == []
