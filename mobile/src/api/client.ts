import { create } from 'axios';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  console.warn('EXPO_PUBLIC_API_URL no está definida. Configurá mobile/.env antes de consumir la API.');
}

export const apiClient = create({
  baseURL,
  timeout: 10_000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});
