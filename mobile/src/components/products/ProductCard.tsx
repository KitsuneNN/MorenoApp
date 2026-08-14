import { Image, Pressable, Text, View } from 'react-native';

import { Product } from '@/types/product';
import { formatCurrency } from '@/utils/currency';
import { StockBadge } from './StockBadge';

export function ProductCard({ product, onPress }: { product: Product; onPress?: (product: Product) => void }) {
  return (
    <Pressable
      className="mb-3 flex-row rounded-2xl border border-[#DCE5E1] bg-white p-3 active:bg-[#F2FAF7]"
      onPress={() => onPress?.(product)}
      accessibilityRole="button"
      accessibilityLabel={`Agregar ${product.nombre}`}
    >
      {product.imagen_url ? (
        <Image source={{ uri: product.imagen_url }} className="h-16 w-16 rounded-xl bg-[#E9F7F1]" />
      ) : (
        <View className="h-16 w-16 items-center justify-center rounded-xl bg-[#E9F7F1]">
          <Text className="text-lg">▣</Text>
        </View>
      )}
      <View className="ml-3 flex-1 justify-between">
        <Text className="text-base font-bold text-[#17211F]" numberOfLines={1}>{product.nombre}</Text>
        <Text className="mt-1 text-base font-semibold text-brand-700">{formatCurrency(product.precio_venta)}</Text>
        <View className="mt-2"><StockBadge product={product} /></View>
      </View>
      <View className="ml-2 h-8 w-8 items-center justify-center self-center rounded-full bg-brand-600">
        <Text className="text-xl leading-6 text-white">+</Text>
      </View>
    </Pressable>
  );
}
