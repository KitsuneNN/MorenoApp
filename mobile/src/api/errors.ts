import { AxiosError } from 'axios';

import { ApiErrorBody } from '@/types/api';

export type AppApiError = Error & { code?: string; isNetworkError?: boolean };

export function toAppApiError(error: unknown): AppApiError {
  if (!error || typeof error !== 'object' || !('isAxiosError' in error)) {
    return Object.assign(new Error('Ocurrió un error inesperado.'), { code: 'UNKNOWN_ERROR' });
  }

  const axiosError = error as AxiosError<ApiErrorBody>;
  if (!axiosError.response) {
    return Object.assign(new Error('No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.'), {
      code: 'NETWORK_ERROR',
      isNetworkError: true,
    });
  }

  return Object.assign(new Error(axiosError.response.data?.detail ?? 'No se pudo completar la operación.'), {
    code: axiosError.response.data?.code ?? `HTTP_${axiosError.response.status}`,
  });
}
