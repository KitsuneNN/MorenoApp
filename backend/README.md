# Backend

## Tests PostgreSQL de integración

Los tests marcados como `postgresql` requieren una base PostgreSQL descartable; no usan SQLite ni deben apuntar a producción:

```bash
TEST_DATABASE_URL='postgresql+psycopg://usuario:clave@localhost:5432/morenoapp_test' \
pytest -m postgresql
```

Cubren el bloqueo real `SELECT ... FOR UPDATE` y dos ventas concurrentes sobre stock limitado.
