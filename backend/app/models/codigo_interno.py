import uuid
from datetime import datetime

from sqlalchemy import BigInteger, CheckConstraint, DateTime, ForeignKey, Index, String, Uuid, text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

ESTADO_ASIGNADO = 'asignado'
ESTADO_LIBRE = 'libre'

CODIGO_INTERNO_PREFIX = 'PRD-'
CODIGO_INTERNO_DIGITS = 6


def format_codigo_interno(valor: int) -> str:
    """Formatea un número secuencial como código interno PRD-######."""
    return f'{CODIGO_INTERNO_PREFIX}{valor:0{CODIGO_INTERNO_DIGITS}d}'


class CodigoInterno(Base):
    """Estado actual de cada código interno PRD-###### emitido.

    La fila de `productos` conserva el VALOR (también el histórico de dados de
    baja); esta tabla es la verdad del ESTADO del número (asignado/libre) que
    alimenta el pool de reutilización. El dueño operativo de un código es el
    producto ACTIVO que lo tiene asignado.
    """

    __tablename__ = 'codigos_internos'
    __table_args__ = (
        CheckConstraint("estado IN ('asignado', 'libre')", name='ck_codigos_internos_estado'),
        # Acelera la toma del menor liberado (WHERE estado='libre' ORDER BY codigo).
        Index('ix_codigos_internos_libre_codigo', 'codigo', postgresql_where=text("estado = 'libre'")),
    )

    codigo: Mapped[str] = mapped_column(String(10), primary_key=True)
    estado: Mapped[str] = mapped_column(String(9), nullable=False)
    # Nullable sin unique: un código se reasigna (asignado → libre → asignado a
    # otro producto). Nunca debe existir un constraint que impida reutilizar.
    producto_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey('productos.id', ondelete='SET NULL'), nullable=True
    )
    liberado_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Contador(Base):
    """Contadores transaccionales.

    A diferencia de una SEQUENCE de PostgreSQL (no transaccional: quema
    números en rollback), el UPDATE de esta fila se revierte con la transacción:
    una creación fallida NO consume número.
    """

    __tablename__ = 'contadores'

    nombre: Mapped[str] = mapped_column(String(50), primary_key=True)
    valor: Mapped[int] = mapped_column(BigInteger, nullable=False)
