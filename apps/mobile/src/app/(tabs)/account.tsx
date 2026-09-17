import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSession } from '@/lib/session';

const GREEN = '#00A83B';
const TEXT = '#34434D';
const MUTED = '#6F91A2';

type Item = { label: string; icon: any; path: string };
const items: Item[] = [
  { label: 'My ads', icon: 'list-outline', path: '/my-ads' },
  { label: 'My clients', icon: 'people-outline', path: '/dashboard' },
  { label: 'Feedback', icon: 'chatbubble-ellipses-outline', path: '/dashboard' },
  { label: 'Performance', icon: 'bar-chart-outline', path: '/dashboard' },
  { label: 'Pro Sales', icon: 'trending-up-outline', path: '/pro-sales' },
  { label: 'Premium service', icon: 'diamond-outline', path: '/seller-plans' },
  { label: 'My balance', icon: 'wallet-outline', path: '/balance' },
  { label: 'Request help', icon: 'person-outline', path: '/help' },
  { label: 'FAQ', icon: 'help-circle-outline', path: '/help' },
  { label: 'Notifications', icon: 'notifications-outline', path: '/notifications' },
  { label: 'Followers', icon: 'people-circle-outline', path: '/dashboard' },
  { label: 'Orders', icon: 'bag-handle-outline', path: '/orders' },
];

export default function AccountScreen() {
  const { user, loading } = useSession();
  if (loading) return <View style={styles.loading}><Text style={styles.muted}>Loading profile…</Text></View>;
  if (!user) return <GuestAccount />;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image source={require('../../../assets/images/minify-market.png')} style={styles.logo} />
          <Text style={styles.brandName}>MINIFY MARKET</Text>
        </View>
        <Pressable onPress={() => router.push('/settings')} accessibilityLabel="Settings" style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={30} color={TEXT} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.profile} onPress={() => router.push('/settings')}>
          <View style={styles.avatar}><Ionicons name="person" size={34} color={GREEN} /></View>
          <View style={styles.profileCopy}>
            <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
            <Text style={styles.muted} numberOfLines={1}>{user.email}</Text>
            <Text style={styles.viewProfile}>View profile & settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={25} color={MUTED} />
        </Pressable>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.grid}>{items.map(item => (
          <Pressable key={item.label} style={styles.card} onPress={() => router.push(item.path as any)}>
            <Ionicons name={item.icon} size={29} color={TEXT} />
            <Text style={styles.cardText}>{item.label}</Text>
          </Pressable>
        ))}</View>
      </ScrollView>
    </View>
  );
}
