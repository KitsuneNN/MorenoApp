"""create ventas and detalles venta

Revision ID: 20260814_0002
Revises: 20260814_0001
Create Date: 2026-08-14
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '20260814_0002'
down_revision: Union[str, Sequence[str], None] = '20260814_0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'ventas',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('request_fingerprint', sa.String(length=64), nullable=False),
        sa.Column('total', sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'detalles_venta',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('venta_id', sa.Uuid(), nullable=False),
        sa.Column('producto_id', sa.Uuid(), nullable=False),
        sa.Column('producto_nombre', sa.String(length=160), nullable=False),
        sa.Column('unidad', sa.String(length=20), nullable=False),
        sa.Column('cantidad', sa.Numeric(precision=14, scale=3), nullable=False),
        sa.Column('precio_unitario', sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column('subtotal', sa.Numeric(precision=14, scale=2), nullable=False),
        sa.ForeignKeyConstraint(['producto_id'], ['productos.id']),
        sa.ForeignKeyConstraint(['venta_id'], ['ventas.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_detalles_venta_venta_id', 'detalles_venta', ['venta_id'])
    op.create_index('ix_detalles_venta_producto_id', 'detalles_venta', ['producto_id'])


def downgrade() -> None:
    op.drop_index('ix_detalles_venta_producto_id', table_name='detalles_venta')
    op.drop_index('ix_detalles_venta_venta_id', table_name='detalles_venta')
    op.drop_table('detalles_venta')
    op.drop_table('ventas')
