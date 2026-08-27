import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Loading } from '@/components/common/Loading';
import { Sale } from '@/types/sale';
import { SaleCard } from './SaleCard';

type Props = {
  sales: Sale[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isRefetching: boolean;
  isFetchingNextPage: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  onRetry: () => void;
  onOpenSale: (sale: Sale) => void;
};

export function SaleList(props: Props) {
  if (props.isLoading) return <Loading label="Cargando historial…" />;
  if (props.isError) return <ErrorState title="No pudimos cargar el historial" message={props.errorMessage ?? 'Intentá nuevamente.'} onRetry={props.onRetry} />;

  return (
    <FlatList
      data={props.sales}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <SaleCard sale={item} onPress={props.onOpenSale} />}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 32, flexGrow: 1 }}
      ListEmptyComponent={
        <EmptyState title="Todavía no hay ventas" description="Cuando confirmes una venta desde el carrito va a aparecer acá." />
      }
      refreshing={props.isRefetching}
      onRefresh={props.onRefresh}
      onEndReached={props.onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        props.isFetchingNextPage ? (
          <View className="py-4">
            <ActivityIndicator color="#078664" />
            <Text className="mt-2 text-center text-sm text-[#5D6A66]">Cargando más ventas…</Text>
          </View>
        ) : null
      }
    />
  );
}
