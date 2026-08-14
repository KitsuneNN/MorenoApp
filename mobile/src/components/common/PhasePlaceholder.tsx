import { ReactNode } from 'react';
import { View, Text } from 'react-native';

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PhasePlaceholder({ eyebrow, title, description, children }: Props) {
  return (
    <View className="flex-1 bg-[#F7FAF9] px-5 pt-7">
      <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-600">{eyebrow}</Text>
      <Text className="text-3xl font-bold text-[#17211F]">{title}</Text>
      <Text className="mt-3 text-base leading-6 text-[#5D6A66]">{description}</Text>
      {children}
    </View>
  );
}
