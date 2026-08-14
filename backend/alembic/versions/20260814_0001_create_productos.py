"""create productos

Revision ID: 20260814_0001
Revises:
Create Date: 2026-08-14
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260814_0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

unidad_medida = sa.Enum("UNIDAD", "GRAMO", "KILOGRAMO", "MILILITRO", "LITRO", name="unidad_medida")
modo_precio_venta = sa.Enum("CALCULADO", "MANUAL", name="modo_precio_venta")


def upgrade() -> None:
    unidad_medida.create(op.get_bind(), checkfirst=True)
    modo_precio_venta.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "productos",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("codigo_barra", sa.String(length=100), nullable=True),
        sa.Column("nombre", sa.String(length=160), nullable=False),
        sa.Column("imagen_url", sa.Text(), nullable=True),
        sa.Column("imagen_public_id", sa.String(length=255), nullable=True),
        sa.Column("precio_compra", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("margen_ganancia", sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column("precio_venta", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("modo_precio_venta", modo_precio_venta, nullable=False, server_default="CALCULADO"),
        sa.Column("stock", sa.Numeric(precision=14, scale=3), nullable=False, server_default="0"),
        sa.Column("stock_minimo", sa.Numeric(precision=14, scale=3), nullable=False, server_default="0"),
        sa.Column("unidad", unidad_medida, nullable=False),
        sa.Column("activo", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("unidad != 'UNIDAD' OR stock = trunc(stock)", name="ck_productos_unidad_stock_entero"),
        sa.CheckConstraint("unidad != 'UNIDAD' OR stock_minimo = trunc(stock_minimo)", name="ck_productos_unidad_stock_minimo_entero"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_productos_activo_nombre", "productos", ["activo", "nombre"], unique=False)
    op.create_index(
        "ux_productos_codigo_barra_activo",
        "productos",
        ["codigo_barra"],
        unique=True,
        postgresql_where=sa.text("activo = true"),
    )


def downgrade() -> None:
    op.drop_index("ux_productos_codigo_barra_activo", table_name="productos")
    op.drop_index("ix_productos_activo_nombre", table_name="productos")
    op.drop_table("productos")
    modo_precio_venta.drop(op.get_bind(), checkfirst=True)
    unidad_medida.drop(op.get_bind(), checkfirst=True)
