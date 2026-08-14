import { Tabs } from 'expo-router';

import { colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.surface },
      }}
    >
      <Tabs.Screen name="ventas" options={{ title: 'Ventas', headerTitle: 'Ventas' }} />
      <Tabs.Screen name="historial" options={{ title: 'Historial', headerTitle: 'Historial' }} />
      <Tabs.Screen name="administracion" options={{ title: 'Administración', headerTitle: 'Administración' }} />
    </Tabs>
  );
}
