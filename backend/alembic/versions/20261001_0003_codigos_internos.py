"""Codigos internos: origen_codigo, pool de liberados y contador transaccional.

Revision ID: 20261001_0003
Revises: 20260814_0002
Create Date: 2026-10-01

No destructiva: no modifica ningun codigo_barra existente. Los productos
historicos sin codigo quedan NULL/NULL; los con codigo se clasifican
EXISTENTE. Guarda: si existe cualquier codigo que invada el namespace
reservado PRD, la migracion aborta pidiendo decision manual.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import text

revision: str = '20261001_0003'
down_revision: Union[str, Sequence[str], None] = '20260814_0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Cualquier valor que empiece con PRD (cualquier casing) invade el namespace
# reservado: valido con formato interno, invalido como comercial, y jamas se
# clasifica silenciosamente durante la migracion.
PRD_CONFLICTS_QUERY = text("SELECT id, nombre, codigo_barra FROM productos WHERE codigo_barra ILIKE 'PRD%'")

# Semilla del contador: el maximo numero PRD ya emitido (0 si no hay ninguno).
MAX_PRD_QUERY = text(
    "SELECT COALESCE(MAX(NULLIF(regexp_replace(codigo_barra, '^PRD-0*([0-9]+)$', '\\1'), '')::bigint), 0) "
    "FROM productos WHERE codigo_barra ~ '^PRD-[0-9]{6}$'"
)


def find_prd_conflicts(conn) -> list:
    """Registros historicos cuyo codigo invade el namespace reservado PRD."""
    return conn.execute(PRD_CONFLICTS_QUERY).fetchall()


def ensure_no_prd_conflicts(conn) -> None:
    """Guarda de migracion: aborta si hay codigos PRD-* historicos.

    La migracion no inventa el significado historico de un PRD-*: se detiene,
    informa los registros afectados y espera decision manual del usuario.
    """
    conflicts = find_prd_conflicts(conn)
    if conflicts:
        listing = ', '.join(f'«{row.nombre}» ({row.codigo_barra}, id={row.id})' for row in conflicts)
        raise RuntimeError(
            'Migración abortada: existen productos con códigos que invaden el namespace '
            f'reservado PRD: {listing}. Resolvélos manualmente (requieren decisión del usuario) '
            'y volvé a ejecutar la migración.'
        )


def upgrade() -> None:
    conn = op.get_bind()
    ensure_no_prd_conflicts(conn)

    # 1) Discriminador de origen del codigo (NULL <=> sin codigo, historicos).
    op.add_column('productos', sa.Column('origen_codigo', sa.String(length=7), nullable=True))
    conn.execute(text("UPDATE productos SET origen_codigo = 'EXISTENTE' WHERE codigo_barra IS NOT NULL"))
    op.create_check_constraint(
        'ck_productos_origen_codigo_valido',
        'productos',
        "origen_codigo IS NULL OR origen_codigo IN ('INTERNO', 'EXISTENTE')",
    )
    op.create_check_constraint(
        'ck_productos_codigo_origen_paridad',
        'productos',
        '(codigo_barra IS NULL) = (origen_codigo IS NULL)',
    )

    # 2) Pool de codigos internos (estado del numero; reutilizable).
    op.create_table(
        'codigos_internos',
        sa.Column('codigo', sa.String(length=10), primary_key=True),
        sa.Column('estado', sa.String(length=9), nullable=False),
        sa.Column('producto_id', sa.Uuid(), sa.ForeignKey('productos.id', ondelete='SET NULL'), nullable=True),
        sa.Column('liberado_at', sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("estado IN ('asignado', 'libre')", name='ck_codigos_internos_estado'),
    )
    op.create_index(
        'ix_codigos_internos_libre_codigo',
        'codigos_internos',
        ['codigo'],
        postgresql_where=text("estado = 'libre'"),
    )

    # 3) Contador transaccional (reversible en rollback, a diferencia de sequences).
    op.create_table(
        'contadores',
        sa.Column('nombre', sa.String(length=50), primary_key=True),
        sa.Column('valor', sa.BigInteger(), nullable=False),
    )
    max_prd = conn.execute(MAX_PRD_QUERY).scalar_one()
    conn.execute(
        text("INSERT INTO contadores (nombre, valor) VALUES ('codigo_interno', :valor)"),
        {'valor': int(max_prd)},
    )


def downgrade() -> None:
    # Reversible: nunca se mutaron datos previos (solo se agrego infraestructura).
    op.drop_table('contadores')
    op.drop_index('ix_codigos_internos_libre_codigo', table_name='codigos_internos')
    op.drop_table('codigos_internos')
    op.drop_constraint('ck_productos_codigo_origen_paridad', 'productos', type_='check')
    op.drop_constraint('ck_productos_origen_codigo_valido', 'productos', type_='check')
    op.drop_column('productos', 'origen_codigo')
