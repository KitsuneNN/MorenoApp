# MorenoApp

Aplicación móvil para ventas, stock y administración de un pequeño comercio de productos de limpieza.

## Estructura

- `mobile/`: aplicación React Native con Expo, TypeScript, Expo Router y NativeWind.
- `backend/`: API FastAPI y PostgreSQL (se incorporará en la Fase 2).
- `docs/`: decisiones y documentación de arquitectura.

## Estado

Se completó la Fase 1: navegación móvil base y configuración inicial del cliente.

## Backend (Fase 2)

El backend y PostgreSQL se ejecutan con Docker:

```bash
docker compose up --build
```

- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

Las migraciones Alembic se ejecutan automáticamente al iniciar el contenedor `backend`.
