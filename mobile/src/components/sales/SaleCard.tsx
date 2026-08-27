import { Pressable, Text, View } from 'react-native';

import { Sale } from '@/types/sale';
import { formatCurrency } from '@/utils/currency';
import { formatSaleDateTime } from '@/utils/datetime';
import { countSaleItems, describeSaleItems } from '@/utils/saleSummary';

export function SaleCard({ sale, onPress }: { sale: Sale; onPress: (sale: Sale) => void }) {
  return (
    <Pressable
      className="mb-3 rounded-2xl border border-[#DCE5E1] bg-white p-4 active:bg-[#F2FAF7]"
      onPress={() => onPress(sale)}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de la venta del ${formatSaleDateTime(sale.created_at)}`}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-[#5D6A66]">{formatSaleDateTime(sale.created_at)}</Text>
        <Text className="text-sm font-semibold text-[#5D6A66]">{countSaleItems(sale.detalles)}</Text>
      </View>
      <Text className="mt-2 text-base text-[#17211F]" numberOfLines={1}>
        {describeSaleItems(sale.detalles)}
      </Text>
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-brand-700">{formatCurrency(sale.total)}</Text>
        <Text className="text-xl leading-7 text-[#9AA8A2]">›</Text>
      </View>
    </Pressable>
  );
}
