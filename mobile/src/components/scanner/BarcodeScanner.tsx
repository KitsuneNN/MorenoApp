import { CameraView, useCameraPermissions } from 'expo-camera';
import { ReactNode, useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

const SUPPORTED_BARCODE_TYPES = [
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
  'codabar',
] as const;

type Props = {
  onCodeScanned: (barcode: string) => Promise<void> | void;
  children?: ReactNode;
};

export function BarcodeScanner({ onCodeScanned, children }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);

  const handleBarcodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (isProcessing || data === lastBarcode) return;

      setIsProcessing(true);
      setLastBarcode(data);
      try {
        await onCodeScanned(data);
      } finally {
        // Si la pantalla sigue abierta después de un error, el usuario podrá reintentar.
        setIsProcessing(false);
      }
    },
    [isProcessing, lastBarcode, onCodeScanned],
  );

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-[#17211F]">
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F7FAF9] px-8">
        <Text className="text-center text-2xl font-bold text-[#17211F]">Necesitamos usar la cámara</Text>
        <Text className="mt-3 text-center text-base leading-6 text-[#5D6A66]">
          Permití el acceso a la cámara para leer códigos de barras de productos.
        </Text>
        <Pressable className="mt-6 rounded-2xl bg-brand-600 px-6 py-4" onPress={() => void requestPermission()} accessibilityRole="button">
          <Text className="font-bold text-white">Permitir cámara</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        className="flex-1"
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: [...SUPPORTED_BARCODE_TYPES] }}
        onBarcodeScanned={isProcessing ? undefined : handleBarcodeScanned}
      />
      <View className="absolute inset-x-0 bottom-0 bg-black/70 px-6 pb-10 pt-6">
        {children}
        <View className="items-center">
          {isProcessing ? (
            <><ActivityIndicator color="#FFFFFF" /><Text className="mt-3 text-sm font-semibold text-white">Buscando producto…</Text></>
          ) : (
            <Text className="text-center text-sm leading-5 text-white">Apuntá la cámara al código de barras del producto.</Text>
          )}
        </View>
      </View>
    </View>
  );
}
