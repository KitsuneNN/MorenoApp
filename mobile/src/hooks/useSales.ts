import { useInfiniteQuery } from '@tanstack/react-query';

import { toAppApiError } from '@/api/errors';
import { getSales } from '@/api/ventas.api';
import { queryKeys } from '@/constants/queryKeys';

const PAGE_SIZE = 20;

export function useSales() {
  return useInfiniteQuery({
    queryKey: queryKeys.sales(),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      try {
        return await getSales({ page: pageParam, pageSize: PAGE_SIZE });
      } catch (error) {
        throw toAppApiError(error);
      }
    },
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined),
  });
}
