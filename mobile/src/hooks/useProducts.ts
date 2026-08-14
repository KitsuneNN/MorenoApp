import { useInfiniteQuery } from '@tanstack/react-query';

import { toAppApiError } from '@/api/errors';
import { getProducts } from '@/api/productos.api';
import { queryKeys } from '@/constants/queryKeys';

const PAGE_SIZE = 20;

export function useProducts(search: string, lowStock: boolean) {
  return useInfiniteQuery({
    queryKey: queryKeys.products(search, lowStock),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      try {
        return await getProducts({ page: pageParam, pageSize: PAGE_SIZE, search, lowStock });
      } catch (error) {
        throw toAppApiError(error);
      }
    },
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined),
  });
}
