import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const GREEN = '#00A83B';
const INACTIVE = '#425563';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: GREEN,
      tabBarInactiveTintColor: INACTIVE,
      tabBarStyle: { height: 72, paddingTop: 7, paddingBottom: 8, borderTopWidth: 1, borderTopColor: '#D6E0E6', backgroundColor: '#FFF' },
      tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({color,size}) => <Ionicons name="home-outline" size={size + 1} color={color} /> }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved', tabBarIcon: ({color,size}) => <Ionicons name="bookmark-outline" size={size + 1} color={color} /> }} />
      <Tabs.Screen name="sell" options={{ title: 'Sell', tabBarIcon: ({color,size}) => <Ionicons name="square-outline" size={size + 2} color={color} /> }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: ({color,size}) => <Ionicons name="chatbox-ellipses-outline" size={size + 1} color={color} /> }} />
      <Tabs.Screen name="account" options={{ title: 'Profile', tabBarIcon: ({color,size}) => <Ionicons name="person-outline" size={size + 1} color={color} /> }} />
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}
