import { Text, View } from 'react-native';

import { formatCurrency } from '@/utils/currency';

export function CartSummary({ total, lines }: { total: string; lines: number }) {
  return (
    <View className="rounded-2xl bg-[#17211F] p-5">
      <Text className="text-sm text-[#DCE5E1]">{lines} {lines === 1 ? 'producto' : 'productos'} en el carrito</Text>
      <View className="mt-2 flex-row items-end justify-between">
        <Text className="text-lg font-bold text-white">Total</Text>
        <Text className="text-2xl font-bold text-white">{formatCurrency(total)}</Text>
      </View>
    </View>
  );
}
