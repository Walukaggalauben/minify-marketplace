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
function GuestAccount() {
  return <View style={styles.guest}>
    <Image source={require('../../../assets/images/minify-market.png')} style={styles.guestLogo} />
    <Text style={styles.guestTitle}>Sign in</Text>
    <Text style={styles.guestText}>Sign in or create an account to buy, sell, save adverts and message sellers.</Text>
    <Pressable style={styles.primary} onPress={() => router.push('/login')}><Text style={styles.primaryText}>Sign in</Text></Pressable>
    <Pressable style={styles.outline} onPress={() => router.push('/register')}><Text style={styles.outlineText}>Create account</Text></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:'#EAF3F8'}, loading:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#FFF'},
  header:{height:88,backgroundColor:'#FFF',paddingHorizontal:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:'#D6E0E6'},
  brand:{flexDirection:'row',alignItems:'center'},logo:{width:62,height:54,resizeMode:'contain'},brandName:{fontSize:19,fontWeight:'800',color:TEXT,marginLeft:6},settingsButton:{width:44,height:44,alignItems:'center',justifyContent:'center'},
  content:{padding:16,paddingBottom:110},profile:{backgroundColor:'#FFF',borderRadius:4,padding:15,flexDirection:'row',alignItems:'center',borderBottomWidth:1,borderBottomColor:'#D6E0E6'},avatar:{width:60,height:60,borderRadius:30,backgroundColor:'#E8F7EF',alignItems:'center',justifyContent:'center',marginRight:12},profileCopy:{flex:1},name:{fontSize:19,fontWeight:'800',color:TEXT},muted:{fontSize:14,color:MUTED,marginTop:3},viewProfile:{fontSize:13,color:GREEN,fontWeight:'800',marginTop:5},sectionTitle:{fontSize:19,fontWeight:'900',color:TEXT,marginTop:18,marginBottom:9},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:10},card:{width:'48%',minHeight:82,backgroundColor:'#FFF',borderRadius:10,padding:15,justifyContent:'center',borderWidth:1,borderColor:'#E0E8ED'},cardText:{fontSize:16,color:TEXT,fontWeight:'600',marginTop:7},
  guest:{flex:1,padding:28,justifyContent:'center',backgroundColor:'#FFF'},guestLogo:{width:190,height:70,resizeMode:'contain',alignSelf:'center',marginBottom:24},guestTitle:{fontSize:29,fontWeight:'800',color:TEXT},guestText:{fontSize:15,color:MUTED,lineHeight:22,marginTop:8},primary:{height:54,backgroundColor:GREEN,borderRadius:8,alignItems:'center',justifyContent:'center',marginTop:20},primaryText:{color:'#FFF',fontWeight:'800',fontSize:17},outline:{height:54,borderRadius:8,borderWidth:1,borderColor:GREEN,alignItems:'center',justifyContent:'center',marginTop:10},outlineText:{color:GREEN,fontWeight:'800',fontSize:17}
});
