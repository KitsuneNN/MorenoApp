import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { SaleList } from '@/components/sales/SaleList';
import { useSales } from '@/hooks/useSales';

export default function HistorialScreen() {
  const router = useRouter();
  const salesQuery = useSales();
  const sales = useMemo(() => salesQuery.data?.pages.flatMap((page) => page.items) ?? [], [salesQuery.data]);
  const errorMessage = salesQuery.error instanceof Error ? salesQuery.error.message : undefined;

  return (
    <View className="flex-1 bg-[#F7FAF9] px-5">
      <SaleList
        sales={sales}
        isLoading={salesQuery.isLoading}
        isError={salesQuery.isError}
        errorMessage={errorMessage}
        isRefetching={salesQuery.isRefetching}
        isFetchingNextPage={salesQuery.isFetchingNextPage}
        onRefresh={() => void salesQuery.refetch()}
        onRetry={() => void salesQuery.refetch()}
        onEndReached={() => {
          if (salesQuery.hasNextPage && !salesQuery.isFetchingNextPage) void salesQuery.fetchNextPage();
        }}
        onOpenSale={(sale) => router.push({ pathname: '/venta/[id]', params: { id: sale.id } })}
      />
    </View>
  );
}
