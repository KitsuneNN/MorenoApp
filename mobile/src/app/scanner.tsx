import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { getProductByBarcode } from '@/api/productos.api';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { processScannedBarcode } from '@/services/scanner.service';
import { useCartStore } from '@/stores/cart.store';

export default function ScannerScreen() {
  const router = useRouter();
  const addProduct = useCartStore((state) => state.addProduct);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scanKey, setScanKey] = useState(0);

  const handleCodeScanned = async (barcode: string) => {
    setError(null);
    setSuccess(null);
    const result = await processScannedBarcode({ barcode, findProduct: getProductByBarcode, addProduct });

    if (result.status === 'added') {
      setSuccess(`${result.product.nombre} agregado al carrito`);
    } else {
      setError(result.message);
    }
    // Permite continuar con otro producto, incluso si se escanea el mismo
    // código otra vez, sin obligar a salir y volver a abrir la cámara.
    setScanKey((value) => value + 1);
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
        {success ? (
          <View className="mb-4 rounded-xl bg-brand-700 p-3" accessibilityLiveRegion="polite">
            <Text className="text-center text-sm font-semibold text-white">{success}</Text>
          </View>
        ) : null}
        {error ? (
          <View className="mb-4 rounded-xl bg-[#7F1D1D] p-3" accessibilityLiveRegion="assertive">
            <Text className="text-center text-sm font-semibold text-white">{error}</Text>
          </View>
        ) : null}
      </BarcodeScanner>
    </View>
  );
}
