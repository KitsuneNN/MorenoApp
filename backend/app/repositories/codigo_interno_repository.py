from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.models.codigo_interno import CodigoInterno, Contador, ESTADO_LIBRE
from app.models.producto import Producto  # noqa: F401 - reexportado para lectura de tipos

NOMBRE_CONTADOR_CODIGO_INTERNO = 'codigo_interno'


class CodigoInternoRepository:
    """Pool de códigos liberados + contador transaccional.

    Regla de negocio (Fase 9): el MENOR código liberado debe reutilizarse antes
    de emitir números nuevos. Por eso la toma usa `FOR UPDATE` simple (sin SKIP
    LOCKED): si el menor está bloqueado por otra transacción, se espera; nunca
    se salta a otro código ni al contador mientras exista uno libre en curso.
    """

    def get_by_codigo(self, db: Session, codigo: str) -> CodigoInterno | None:
        return db.get(CodigoInterno, codigo)

    def take_lowest_free_for_update(self, db: Session) -> CodigoInterno | None:
        """Toma (lockeando) el menor código liberado, o None si el pool está vacío."""
        return db.scalar(
            select(CodigoInterno)
            .where(CodigoInterno.estado == ESTADO_LIBRE)
            .order_by(CodigoInterno.codigo)
            .limit(1)
            .with_for_update()
        )

    def next_counter_value(self, db: Session) -> int:
        """Incrementa y devuelve el valor del contador dentro de la transacción actual.

        El UPDATE toma el row-lock de la única fila del contador: dos creaciones
        concurrentes obtienen valores distintos, y un ROLLBACK revierte el
        incremento (el número no se consume).
        """
        return db.execute(
            update(Contador)
            .where(Contador.nombre == NOMBRE_CONTADOR_CODIGO_INTERNO)
            .values(valor=Contador.valor + 1)
            .returning(Contador.valor)
        ).scalar_one()
