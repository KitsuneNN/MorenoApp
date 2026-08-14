import { TextInput, View } from 'react-native';

export function ProductSearch({ value, onChangeText }: { value: string; onChangeText: (text: string) => void }) {
  return (
    <View className="rounded-xl border border-[#DCE5E1] bg-white px-4 py-1">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar producto"
        placeholderTextColor="#71807A"
        className="h-12 text-base text-[#17211F]"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Buscar producto por nombre"
      />
    </View>
  );
}
