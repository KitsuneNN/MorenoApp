import { Pressable, Text, View } from 'react-native';

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="items-center px-6 py-12">
      <Text className="text-center text-base font-semibold text-[#17211F]">No pudimos cargar los productos</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-[#5D6A66]">{message}</Text>
      <Pressable className="mt-5 rounded-xl bg-brand-600 px-5 py-3" onPress={onRetry} accessibilityRole="button">
        <Text className="font-bold text-white">Reintentar</Text>
      </Pressable>
    </View>
  );
}
