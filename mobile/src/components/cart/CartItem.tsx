import { Pressable, Text, View } from 'react-native';

import { CartItem as CartItemType } from '@/types/cart';
import { formatCurrency } from '@/utils/currency';
import { formatStock } from '@/utils/units';

export function CartItem({ item, subtotal, onIncrement, onDecrement, onRemove }: {
  item: CartItemType;
  subtotal: string;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  return (
    <View className="mb-3 rounded-2xl border border-[#DCE5E1] bg-white p-4">
      <View className="flex-row items-start justify-between">
        <View className="mr-4 flex-1">
          <Text className="text-base font-bold text-[#17211F]">{item.nombre}</Text>
          <Text className="mt-1 text-sm text-[#5D6A66]">{formatCurrency(item.precioUnitario)} por {item.unidad.toLowerCase()}</Text>
        </View>
        <Pressable onPress={onRemove} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Quitar ${item.nombre}`}>
          <Text className="text-sm font-semibold text-[#A94C08]">Quitar</Text>
        </Pressable>
      </View>
      <View className="mt-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable className="h-10 w-10 items-center justify-center rounded-xl bg-[#E9F7F1]" onPress={onDecrement} accessibilityRole="button">
            <Text className="text-xl text-brand-700">−</Text>
          </Pressable>
          <Text className="min-w-24 px-3 text-center text-sm font-bold text-[#17211F]">{formatStock(item.cantidad, item.unidad)}</Text>
          <Pressable className="h-10 w-10 items-center justify-center rounded-xl bg-brand-600" onPress={onIncrement} accessibilityRole="button">
            <Text className="text-xl text-white">+</Text>
          </Pressable>
        </View>
        <Text className="text-base font-bold text-[#17211F]">{formatCurrency(subtotal)}</Text>
      </View>
    </View>
  );
}
