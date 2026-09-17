import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

const GREEN = '#0B8F55';
const DATA: Record<string, { title: string; body: string }> = {
  'pro-sales': { title: 'Pro Sales', body: 'Professional seller tools and sales features are available from your MINIFY MARKET seller account.' },
  premium: { title: 'Premium service', body: 'Premium seller services will appear here as they become available on MINIFY MARKET.' },
  balance: { title: 'My balance', body: 'Your marketplace balance and seller earnings will appear here.' },
  help: { title: 'Request help', body: 'For help with an advert, account, payment or seller issue, use the marketplace support options.' },
  verification: { title: 'Verified ID badge', body: 'A verified badge helps buyers recognize accounts that have completed the marketplace verification process.' },
};

export default function InfoScreen() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const item = DATA[String(section || '')] || { title: 'MINIFY MARKET', body: 'Marketplace information.' };
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={28} color="#34434D" /></Pressable>
        <Text style={styles.headerTitle}>{item.title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.icon}><Ionicons name="information-circle-outline" size={54} color={GREEN} /></View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
        <Pressable style={styles.button} onPress={() => router.push('/(tabs)/account')}><Text style={styles.buttonText}>Back to Profile</Text></Pressable>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F8F7' },
  header: { height: 78, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#D6E0E6' },
  back: { width: 44 },
  headerTitle: { fontSize: 21, fontWeight: '800', color: '#34434D' },
  content: { padding: 24, alignItems: 'center' },
  icon: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#E8F6EF', alignItems: 'center', justifyContent: 'center', marginTop: 35 },
  title: { fontSize: 28, fontWeight: '900', color: '#17202A', marginTop: 22, textAlign: 'center' },
  body: { color: '#6F91A2', fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 12, maxWidth: 480 },
  button: { height: 52, minWidth: 220, paddingHorizontal: 24, backgroundColor: GREEN, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 28 },
  buttonText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
