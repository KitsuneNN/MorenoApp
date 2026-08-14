import { Text, View } from 'react-native';

import { Product } from '@/types/product';
import { formatStock } from '@/utils/units';

export function StockBadge({ product }: { product: Product }) {
  const lowStock = Number(product.stock) <= Number(product.stock_minimo);
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${lowStock ? 'bg-[#FFF0D8]' : 'bg-[#E9F7F1]'}`}>
      <Text className={`text-xs font-semibold ${lowStock ? 'text-[#A94C08]' : 'text-brand-700'}`}>
        Stock: {formatStock(product.stock, product.unidad)}
      </Text>
    </View>
  );
}
