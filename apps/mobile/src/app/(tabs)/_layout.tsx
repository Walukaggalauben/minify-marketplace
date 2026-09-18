import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/lib/i18n';

const GREEN = '#0B8F55';
const INACTIVE = '#425563';

export default function TabLayout() {
  const {t}=useLanguage();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: GREEN,
      tabBarInactiveTintColor: INACTIVE,
      tabBarStyle: { height: 72, paddingTop: 7, paddingBottom: 8, borderTopWidth: 1, borderTopColor: '#D6E0E6', backgroundColor: '#FFF' },
      tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ title: t('home'), tabBarIcon: ({color,size}) => <Ionicons name="home-outline" size={size + 1} color={color} /> }} />
      <Tabs.Screen name="saved" options={{ title: t('saved'), tabBarIcon: ({color,size}) => <Ionicons name="bookmark-outline" size={size + 1} color={color} /> }} />
      <Tabs.Screen name="sell" options={{ title: t('sell'), tabBarIcon: ({color,size}) => <Ionicons name="pricetag-outline" size={size + 2} color={color} /> }} />
      <Tabs.Screen name="messages" options={{ title: t('messages'), tabBarIcon: ({color,size}) => <Ionicons name="chatbox-ellipses-outline" size={size + 1} color={color} /> }} />
      <Tabs.Screen name="account" options={{ title: t('profile'), tabBarIcon: ({color,size}) => <Ionicons name="person-outline" size={size + 1} color={color} /> }} />
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}
