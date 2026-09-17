import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const icon = (label: string) => ({ color, focused }: { color: string; focused: boolean }) => (
  <Text style={{ color, fontSize: focused ? 21 : 19 }}>{label}</Text>
);

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#0B8F55', tabBarInactiveTintColor: '#718096', tabBarStyle: { height: 64, paddingTop: 6, paddingBottom: 8, borderTopColor: '#E5E7EB', backgroundColor: '#FFFFFF' }, tabBarLabelStyle: { fontSize: 11, fontWeight: '700' } }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('¦') }} />
      <Tabs.Screen name="search" options={{ title: 'Search', tabBarIcon: icon('?') }} />
      <Tabs.Screen name="sell" options={{ title: 'Sell', tabBarIcon: icon('+') }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: icon('?') }} />
    </Tabs>
  );
}
