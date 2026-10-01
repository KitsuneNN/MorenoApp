import importlib.util
import pathlib
from types import SimpleNamespace

import pytest
from sqlalchemy import CheckConstraint

from app.core.database import Base
from app.models import CodigoInterno, Contador
from app.models.codigo_interno import ESTADO_LIBRE, format_codigo_interno

MIGRATION_PATH = (
    pathlib.Path(__file__).resolve().parents[2] / 'alembic' / 'versions' / '20261001_0003_codigos_internos.py'
)


def load_migration():
    spec = importlib.util.spec_from_file_location('morenoapp_migracion_0003', MIGRATION_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class FakeResult:
    def __init__(self, rows):
        self._rows = rows

    def fetchall(self):
        return self._rows


class FakeConn:
    def __init__(self, rows=()):
        self._rows = rows

    def execute(self, _query, *_args, **_kwargs):
        return FakeResult(self._rows)


# --- Guarda de migración: namespace PRD ---


def test_migration_guard_aborts_when_prd_codes_exist() -> None:
    migration = load_migration()
    conn = FakeConn([SimpleNamespace(id='id-1', nombre='Detergente PRD', codigo_barra='PRD-123')])

    with pytest.raises(RuntimeError) as error:
        migration.ensure_no_prd_conflicts(conn)

    assert 'Detergente PRD' in str(error.value)
    assert 'PRD-123' in str(error.value)


def test_migration_guard_lists_every_conflicting_product() -> None:
    migration = load_migration()
    conn = FakeConn([
        SimpleNamespace(id='id-1', nombre='Uno', codigo_barra='prd-000001'),
        SimpleNamespace(id='id-2', nombre='Dos', codigo_barra='PRDTEST'),
    ])

    with pytest.raises(RuntimeError) as error:
        migration.ensure_no_prd_conflicts(conn)

    assert 'Uno' in str(error.value) and 'prd-000001' in str(error.value)
    assert 'Dos' in str(error.value) and 'PRDTEST' in str(error.value)


def test_migration_guard_passes_without_prd_codes() -> None:
    migration = load_migration()
    assert migration.ensure_no_prd_conflicts(FakeConn([])) is None


# --- Modelo: tablas nuevas en el metadata ---


def test_codigo_interno_and_contador_tables_in_metadata() -> None:
    assert 'codigos_internos' in Base.metadata.tables
    assert 'contadores' in Base.metadata.tables

    codigos = Base.metadata.tables['codigos_internos']
    assert list(codigos.primary_key.columns) == [codigos.columns['codigo']]
    assert {column.name for column in codigos.columns} >= {'codigo', 'estado', 'producto_id', 'liberado_at'}
    constraint_names = {c.name for c in codigos.constraints if isinstance(c, CheckConstraint)}
    assert 'ck_codigos_internos_estado' in constraint_names

    contadores = Base.metadata.tables['contadores']
    assert {column.name for column in contadores.columns} == {'nombre', 'valor'}


def test_producto_declares_origen_codigo_and_parity_constraints() -> None:
    productos = Base.metadata.tables['productos']
    assert 'origen_codigo' in productos.columns

    constraint_names = {c.name for c in productos.constraints if isinstance(c, CheckConstraint)}
    assert 'ck_productos_origen_codigo_valido' in constraint_names
    assert 'ck_productos_codigo_origen_paridad' in constraint_names


# --- Formato de código interno ---


def test_format_codigo_interno() -> None:
    assert format_codigo_interno(1) == 'PRD-000001'
    assert format_codigo_interno(123) == 'PRD-000123'
    assert format_codigo_interno(123456) == 'PRD-123456'


def test_estado_libre_constant() -> None:
    assert ESTADO_LIBRE == 'libre'
    assert CodigoInterno.__tablename__ == 'codigos_internos'
    assert Contador.__tablename__ == 'contadores'
