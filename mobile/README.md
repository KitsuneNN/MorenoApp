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
