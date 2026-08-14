import { View, Text } from 'react-native';

import { PhasePlaceholder } from '@/components/common/PhasePlaceholder';

export default function VentasScreen() {
  return (
    <PhasePlaceholder
      eyebrow="Punto de venta"
      title="Lista para vender"
      description="En la próxima fase verás aquí los productos reales del catálogo, la búsqueda y el acceso al carrito."
    >
      <View className="mt-8 rounded-2xl border border-[#DCE5E1] bg-white p-5">
        <Text className="text-base font-bold text-[#17211F]">Flujo principal</Text>
        <Text className="mt-2 text-sm leading-5 text-[#5D6A66]">Buscar o escanear → agregar al carrito → confirmar la venta.</Text>
      </View>
    </PhasePlaceholder>
  );
}
