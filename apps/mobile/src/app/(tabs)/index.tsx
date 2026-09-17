import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, mediaUrl, type Ad } from '@/lib/api';

const GREEN = '#0B8F55';

function money(value: number | string) { return `UGX ${Number(value).toLocaleString()}`; }

function AdCard({ ad }: { ad: Ad }) {
  const image = ad.images?.[0]?.url;
  return (
    <Pressable onPress={() => router.push(`/ad/${ad.id}`)} style={styles.card}>
      {image ? <Image source={{ uri: mediaUrl(image) }} style={styles.cardImage} /> : <View style={[styles.cardImage, styles.noImage]}><Text style={styles.noImageText}>MINIFY MARKET</Text></View>}
      <View style={styles.cardBody}>
        <Text numberOfLines={2} style={styles.cardTitle}>{ad.title}</Text>
        <Text style={styles.price}>{money(ad.price)}</Text>
        <Text numberOfLines={1} style={styles.meta}>{ad.city || 'Uganda'} � {ad.category?.name || 'Marketplace'}</Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { const data = await api<{ items: Ad[] }>('/ads?limit=24&sort=createdAt&order=desc'); setAds(data.items || []); }
    catch { setAds([]); } finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const search = () => { if (q.trim()) router.push({ pathname: '/search', params: { q: q.trim() } }); else router.push('/search'); };

  return (
    <View style={styles.screen}>
      <FlatList
        data={ads}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={GREEN} />}
        ListHeaderComponent={<>
          <View style={styles.top}><View style={styles.brand}><Image source={require('../../../assets/images/minify-market.png')} style={styles.logo} /><Text style={styles.brandName}>MINIFY MARKET</Text></View><Pressable onPress={() => router.push('/settings')} accessibilityLabel="Settings"><Ionicons name="settings-outline" size={30} color="#34434D" /></Pressable></View>
          <View style={styles.hero}><Text style={styles.heroTitle}>Buy & sell anything in Uganda</Text><Text style={styles.heroSub}>Phones, cars, property, jobs, services and more.</Text></View>
          <View style={styles.searchRow}><TextInput value={q} onChangeText={setQ} onSubmitEditing={search} placeholder="What are you looking for?" placeholderTextColor="#8A94A6" style={styles.searchInput} returnKeyType="search"/><Pressable onPress={search} style={styles.searchButton}><Text style={styles.searchButtonText}>Search</Text></Pressable></View>
          <View style={styles.quickRow}><Pressable style={styles.quick} onPress={() => router.push('/search')}><Text style={styles.quickText}>Browse all</Text></Pressable><Pressable style={styles.quick} onPress={() => router.push('/sell')}><Text style={styles.quickText}>Post advert</Text></Pressable></View>
          <Text style={styles.section}>Fresh adverts</Text>
          {loading && <ActivityIndicator color={GREEN} style={{ margin: 20 }} />}
          {!loading && ads.length === 0 && <Text style={styles.empty}>No active adverts yet. Check again soon.</Text>}
        </>}
        renderItem={({ item }) => <AdCard ad={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:'#F6F8F7'}, content:{paddingHorizontal:12,paddingBottom:90}, top:{height:76,flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'#FFF',paddingHorizontal:4},brand:{flexDirection:'row',alignItems:'center'},logo:{width:62,height:48,resizeMode:'contain'},brandName:{fontSize:20,fontWeight:'800',color:'#34434D',marginLeft:3},hero:{backgroundColor:GREEN,borderRadius:0,padding:22,marginHorizontal:-12,marginBottom:12},heroTitle:{color:'#FFF',fontSize:25,fontWeight:'900',lineHeight:31},heroSub:{color:'#E8FFF4',fontSize:14,marginTop:7,lineHeight:20},searchRow:{flexDirection:'row',gap:8,marginBottom:10},searchInput:{flex:1,backgroundColor:'#FFF',borderRadius:12,borderWidth:1,borderColor:'#DDE5E1',paddingHorizontal:14,height:50,fontSize:15,color:'#18212B'},searchButton:{backgroundColor:'#18212B',paddingHorizontal:15,borderRadius:12,justifyContent:'center'},searchButtonText:{color:'#FFF',fontWeight:'800'},quickRow:{flexDirection:'row',gap:8,marginBottom:20},quick:{backgroundColor:'#E8F6EF',paddingHorizontal:14,paddingVertical:10,borderRadius:999},quickText:{color:GREEN,fontWeight:'800'},section:{fontSize:20,fontWeight:'900',color:'#17202A',marginBottom:12},columns:{gap:10,marginBottom:10},card:{flex:1,maxWidth:'50%',backgroundColor:'#FFF',borderRadius:14,overflow:'hidden',borderWidth:1,borderColor:'#E8ECEA'},cardImage:{width:'100%',height:150,backgroundColor:'#EEF2F0'},noImage:{alignItems:'center',justifyContent:'center'},noImageText:{fontSize:12,fontWeight:'900',color:GREEN},cardBody:{padding:10},cardTitle:{fontSize:14,fontWeight:'700',color:'#18212B',minHeight:36},price:{fontSize:15,fontWeight:'900',color:GREEN,marginTop:7},meta:{fontSize:11,color:'#75808C',marginTop:5},empty:{paddingVertical:30,textAlign:'center',color:'#74808C'}
});
