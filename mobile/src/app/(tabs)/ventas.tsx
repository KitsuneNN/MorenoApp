import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { ProductList } from '@/components/products/ProductList';
import { ProductSearch } from '@/components/products/ProductSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cart.store';

export default function VentasScreen() {
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const debouncedSearch = useDebounce(search.trim());
  const productsQuery = useProducts(debouncedSearch, lowStock);
  const products = useMemo(() => productsQuery.data?.pages.flatMap((page) => page.items) ?? [], [productsQuery.data]);
  const errorMessage = productsQuery.error instanceof Error ? productsQuery.error.message : undefined;
  const addProduct = useCartStore((state) => state.addProduct);
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <View className="flex-1 bg-[#F7FAF9] px-5">
      <View className="pt-4">
        <View className="flex-row items-center gap-3">
          <View className="flex-1"><ProductSearch value={search} onChangeText={setSearch} /></View>
          <Link href="/carrito" asChild>
            <Pressable className="h-14 min-w-14 items-center justify-center rounded-xl bg-brand-600 px-2" accessibilityRole="button" accessibilityLabel="Abrir carrito">
              <Text className="text-xs font-bold text-white">Carrito</Text>
              <Text className="text-xs text-white">{itemCount}</Text>
            </Pressable>
          </Link>
        </View>
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
        onAddProduct={(product) => addProduct(product)}
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
