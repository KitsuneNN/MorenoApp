import { ActivityIndicator, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

export function Loading({ label = 'Cargando…' }: { label?: string }) {
  return (
    <View className="items-center justify-center py-12">
      <ActivityIndicator color={colors.primary} size="large" />
      <Text className="mt-3 text-sm text-[#5D6A66]">{label}</Text>
    </View>
  );
}
