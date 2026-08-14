import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toAppApiError } from '@/api/errors';
import { createSale } from '@/api/ventas.api';
import { SaleCreate } from '@/types/sale';

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SaleCreate) => {
      try { return await createSale(payload); } catch (error) { throw toAppApiError(error); }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}
