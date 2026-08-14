import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { toAppApiError } from '@/api/errors';
import { getProductByBarcode } from '@/api/productos.api';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { useCartStore } from '@/stores/cart.store';

export default function ScannerScreen() {
  const router = useRouter();
  const addProduct = useCartStore((state) => state.addProduct);
  const [error, setError] = useState<string | null>(null);
  const [scanKey, setScanKey] = useState(0);

  const handleCodeScanned = async (barcode: string) => {
    setError(null);
    try {
      const product = await getProductByBarcode(barcode);
      const wasAdded = addProduct(product);
      if (!wasAdded) {
        setError('No pudimos agregar este producto al carrito.');
        setScanKey((value) => value + 1);
        return;
      }
      router.back();
    } catch (unknownError) {
      const apiError = toAppApiError(unknownError);
      setError(apiError.code === 'PRODUCT_NOT_FOUND' ? 'Producto no encontrado. Podés intentar nuevamente.' : apiError.message);
      // Se vuelve a montar la cámara para permitir escanear el mismo código otra vez.
      setScanKey((value) => value + 1);
    }
  };

  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <BarcodeScanner key={scanKey} onCodeScanned={handleCodeScanned}>
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-white">Escanear producto</Text>
          <Pressable className="rounded-xl border border-white/50 px-4 py-2" onPress={() => router.back()} accessibilityRole="button">
            <Text className="font-semibold text-white">Cancelar</Text>
          </Pressable>
        </View>
        {error ? (
          <View className="mb-4 rounded-xl bg-[#7F1D1D] p-3">
            <Text className="text-center text-sm font-semibold text-white">{error}</Text>
          </View>
        ) : null}
      </BarcodeScanner>
    </View>
  );
}
