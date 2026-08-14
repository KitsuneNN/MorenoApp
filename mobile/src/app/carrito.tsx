import { Stack, useRouter } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { useRef, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyState } from '@/components/common/EmptyState';
import { useCreateSale } from '@/hooks/useCreateSale';
import { useCartStore } from '@/stores/cart.store';

export default function CartScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const saleAttempt = useRef<{ id: string; fingerprint: string } | null>(null);
  const createSale = useCreateSale();
  const items = useCartStore((state) => state.items);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getItemSubtotal = useCartStore((state) => state.getItemSubtotal);
  const total = useCartStore((state) => state.getTotal());

  const confirmSale = async () => {
    if (!items.length || createSale.isPending) return;
    setError(null);
    const saleItems = items.map((item) => ({ producto_id: item.productId, cantidad: item.cantidad }));
    const cartFingerprint = [...saleItems]
      .sort((left, right) => left.producto_id.localeCompare(right.producto_id))
      .map((item) => `${item.producto_id}:${item.cantidad}`)
      .join('|');
    // Ante un timeout, el mismo carrito conserva su UUID y el POST es idempotente.
    // Si el usuario modifica el carrito, se genera deliberadamente un UUID nuevo.
    if (!saleAttempt.current || saleAttempt.current.fingerprint !== cartFingerprint) {
      saleAttempt.current = { id: randomUUID(), fingerprint: cartFingerprint };
    }
    try {
      const sale = await createSale.mutateAsync({ id: saleAttempt.current.id, items: saleItems });
      saleAttempt.current = null;
      clearCart();
      router.replace({ pathname: '/venta/[id]', params: { id: sale.id } });
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'No se pudo confirmar la venta.');
    }
  };

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
              {error ? <View className="rounded-xl bg-[#FEE2E2] p-3"><Text className="text-center text-sm font-semibold text-[#991B1B]">{error}</Text></View> : null}
              <Pressable className="items-center py-3" onPress={clearCart} accessibilityRole="button">
                <Text className="font-semibold text-[#A94C08]">Vaciar carrito</Text>
              </Pressable>
              <Pressable className={`items-center rounded-2xl py-4 ${createSale.isPending ? 'bg-[#78BCAA]' : 'bg-brand-600'}`} onPress={() => void confirmSale()} disabled={createSale.isPending} accessibilityRole="button">
                <Text className="text-base font-bold text-white">{createSale.isPending ? 'Confirmando…' : 'Confirmar venta'}</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </View>
  );
}
