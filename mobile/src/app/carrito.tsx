import { Stack } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';

import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyState } from '@/components/common/EmptyState';
import { useCartStore } from '@/stores/cart.store';

export default function CartScreen() {
  const items = useCartStore((state) => state.items);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getItemSubtotal = useCartStore((state) => state.getItemSubtotal);
  const total = useCartStore((state) => state.getTotal());

  return (
    <View className="flex-1 bg-[#F7FAF9] px-5">
      <Stack.Screen options={{ headerShown: true, title: 'Carrito', headerShadowVisible: false }} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24, flexGrow: 1 }}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            subtotal={getItemSubtotal(item.productId)}
            onIncrement={() => increment(item.productId)}
            onDecrement={() => decrement(item.productId)}
            onRemove={() => removeItem(item.productId)}
          />
        )}
        ListEmptyComponent={<EmptyState title="El carrito está vacío" description="Agregá productos desde la pantalla de ventas para comenzar una venta." />}
        ListFooterComponent={
          items.length ? (
            <View className="mt-2 gap-3">
              <CartSummary total={total} lines={items.length} />
              <Pressable className="items-center py-3" onPress={clearCart} accessibilityRole="button">
                <Text className="font-semibold text-[#A94C08]">Vaciar carrito</Text>
              </Pressable>
              <Pressable className="items-center rounded-2xl bg-brand-600 py-4" accessibilityRole="button">
                <Text className="text-base font-bold text-white">Confirmar venta</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </View>
  );
}
