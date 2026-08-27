import { ScrollView, Text, View } from 'react-native';

import { Sale } from '@/types/sale';
import { formatCurrency } from '@/utils/currency';
import { formatSaleDateTime } from '@/utils/datetime';
import { countSaleItems, describeSaleItems } from '@/utils/saleSummary';
import { formatStock } from '@/utils/units';

export function SaleDetailContent({ sale }: { sale: Sale }) {
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}>
      <View className="rounded-2xl border border-[#DCE5E1] bg-white p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-[#5D6A66]">{formatSaleDateTime(sale.created_at)}</Text>
          <Text className="text-sm font-semibold text-[#5D6A66]">{countSaleItems(sale.detalles)}</Text>
        </View>
        <Text className="mt-3 text-3xl font-bold text-brand-700">{formatCurrency(sale.total)}</Text>
        <Text className="mt-1 text-sm text-[#5D6A66]" numberOfLines={1}>
          {describeSaleItems(sale.detalles)}
        </Text>
      </View>

      <View className="mt-4 rounded-2xl border border-[#DCE5E1] bg-white p-4">
        <Text className="text-xs font-bold uppercase tracking-widest text-brand-600">Artículos</Text>
        {sale.detalles.map((detalle) => (
          <View key={detalle.id} className="mt-3 border-b border-[#EDF2F0] pb-3">
            <Text className="text-base font-bold text-[#17211F]" numberOfLines={1}>
              {detalle.producto_nombre}
            </Text>
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="text-sm text-[#5D6A66]">
                {formatStock(detalle.cantidad, detalle.unidad)} × {formatCurrency(detalle.precio_unitario)}
              </Text>
              <Text className="text-sm font-semibold text-[#17211F]">{formatCurrency(detalle.subtotal)}</Text>
            </View>
          </View>
        ))}
        <View className="mt-4 flex-row items-center justify-between border-t border-[#DCE5E1] pt-4">
          <Text className="text-base font-bold text-[#17211F]">Total</Text>
          <Text className="text-lg font-bold text-brand-700">{formatCurrency(sale.total)}</Text>
        </View>
      </View>

      <Text className="mt-4 text-center text-xs text-[#71807A]">Comprobante N.º {sale.id.slice(0, 8).toUpperCase()}</Text>
    </ScrollView>
  );
}
