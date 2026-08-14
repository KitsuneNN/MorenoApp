# MorenoApp Mobile

Aplicación móvil Expo para ventas, stock y administración de un comercio de productos de limpieza.

## Fase actual

Fase 1: base Expo, navegación por pestañas, TypeScript, NativeWind y TanStack Query.

## Requisitos

- Node.js LTS
- Expo Go en un teléfono o un emulador Android/iOS

## Ejecutar

```bash
cp .env.example .env
npm install
npx expo start
```

Luego escaneá el QR con Expo Go o elegí un emulador. Para probar en un teléfono, la computadora y el teléfono deben estar en la misma red.

## Variables de entorno

`EXPO_PUBLIC_API_URL` se utilizará al conectar FastAPI en la Fase 3. No colocar secretos en variables `EXPO_PUBLIC_*`.

## Conectar con el backend (Fase 3)

Creá `mobile/.env` desde `.env.example` y elegí la URL según el dispositivo:

- Expo web en la misma computadora: `http://localhost:8000/api/v1`
- Android Emulator: `http://10.0.2.2:8000/api/v1`
- Teléfono físico: `http://IP_LOCAL_DE_TU_PC:8000/api/v1`

El teléfono debe poder alcanzar esa IP en la misma red. No usar `localhost` desde un teléfono físico: allí apunta al propio teléfono, no a la computadora.
