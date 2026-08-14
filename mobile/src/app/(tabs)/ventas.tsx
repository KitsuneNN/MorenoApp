import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ProductList } from '@/components/products/ProductList';
import { ProductSearch } from '@/components/products/ProductSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useProducts } from '@/hooks/useProducts';

export default function VentasScreen() {
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const debouncedSearch = useDebounce(search.trim());
  const productsQuery = useProducts(debouncedSearch, lowStock);
  const products = useMemo(() => productsQuery.data?.pages.flatMap((page) => page.items) ?? [], [productsQuery.data]);
  const errorMessage = productsQuery.error instanceof Error ? productsQuery.error.message : undefined;

  return (
    <View className="flex-1 bg-[#F7FAF9] px-5">
      <View className="pt-4">
        <ProductSearch value={search} onChangeText={setSearch} />
        <View className="mt-3 flex-row gap-2">
          <FilterButton label="Todos" selected={!lowStock} onPress={() => setLowStock(false)} />
          <FilterButton label="Poco stock" selected={lowStock} onPress={() => setLowStock(true)} />
        </View>
      </View>
      <ProductList
        products={products}
        isLoading={productsQuery.isLoading}
        isError={productsQuery.isError}
        errorMessage={errorMessage}
        isRefetching={productsQuery.isRefetching}
        isFetchingNextPage={productsQuery.isFetchingNextPage}
        hasNextPage={Boolean(productsQuery.hasNextPage)}
        onRefresh={() => void productsQuery.refetch()}
        onRetry={() => void productsQuery.refetch()}
        onEndReached={() => {
          if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) void productsQuery.fetchNextPage();
        }}
      />
    </View>
  );
}

function FilterButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-4 py-2 ${selected ? 'bg-brand-600' : 'border border-[#DCE5E1] bg-white'}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text className={`text-sm font-semibold ${selected ? 'text-white' : 'text-[#5D6A66]'}`}>{label}</Text>
    </Pressable>
  );
}
