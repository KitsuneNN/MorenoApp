import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { Product } from '@/types/product';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ProductCard } from './ProductCard';

type Props = {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isRefetching: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  onRetry: () => void;
};

export function ProductList(props: Props) {
  if (props.isLoading) return <Loading label="Cargando catálogo…" />;
  if (props.isError) return <ErrorState message={props.errorMessage ?? 'Intentá nuevamente.'} onRetry={props.onRetry} />;

  return (
    <FlatList
      data={props.products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ProductCard product={item} />}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 112, flexGrow: 1 }}
      ListEmptyComponent={<EmptyState title="No encontramos productos" description="Probá con otra búsqueda o revisá el filtro seleccionado." />}
      refreshing={props.isRefetching}
      onRefresh={props.onRefresh}
      onEndReached={props.onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        props.isFetchingNextPage ? (
          <View className="py-4"><ActivityIndicator color="#078664" /><Text className="mt-2 text-center text-sm text-[#5D6A66]">Cargando más productos…</Text></View>
        ) : null
      }
    />
  );
}
