import { Text, View } from 'react-native';

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View className="items-center px-6 py-12">
      <Text className="text-center text-base font-semibold text-[#17211F]">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-[#5D6A66]">{description}</Text>
    </View>
  );
}
