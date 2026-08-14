import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function SaleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-[#F7FAF9] px-6">
      <Stack.Screen options={{ headerShown: true, title: 'Venta realizada' }} />
      <Text className="text-2xl font-bold text-brand-700">Venta confirmada</Text>
      <Text className="mt-3 text-center text-base text-[#5D6A66]">Comprobante de venta: {id}</Text>
    </View>
  );
}
