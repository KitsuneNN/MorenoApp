import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { ErrorState } from '@/components/common/ErrorState';
import { Loading } from '@/components/common/Loading';
import { SaleDetailContent } from '@/components/sales/SaleDetailContent';
import { useSale } from '@/hooks/useSale';

export default function SaleDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const saleQuery = useSale(id);

  return (
    <View className="flex-1 bg-[#F7FAF9]">
      <Stack.Screen options={{ headerShown: true, title: 'Venta' }} />
      {saleQuery.isLoading ? (
        <Loading label="Cargando venta…" />
      ) : saleQuery.isError || !saleQuery.data ? (
        <ErrorState
          title="No pudimos cargar la venta"
          message={saleQuery.error instanceof Error ? saleQuery.error.message : 'Intentá nuevamente.'}
          onRetry={() => void saleQuery.refetch()}
        />
      ) : (
        <SaleDetailContent sale={saleQuery.data} />
      )}
    </View>
  );
}
