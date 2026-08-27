import { useQuery } from '@tanstack/react-query';

import { toAppApiError } from '@/api/errors';
import { getSale } from '@/api/ventas.api';
import { queryKeys } from '@/constants/queryKeys';

export function useSale(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.sale(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      try {
        return await getSale(id ?? '');
      } catch (error) {
        throw toAppApiError(error);
      }
    },
  });
}
