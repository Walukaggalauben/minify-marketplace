import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AdCard from '@/components/AdCard';
import { api, type Ad } from '@/lib/api';
const GREEN='#0B8F55';
export default function SearchScreen(){
 const params=useLocalSearchParams<{q?:string}>(); const [q,setQ]=useState(String(params.q||'')); const [ads,setAds]=useState<Ad[]>([]); const [loading,setLoading]=useState(false); const [refresh,setRefresh]=useState(false);
 const run=async()=>{setLoading(true);try{const suffix=q.trim()?`&q=${encodeURIComponent(q.trim())}`:'';const d=await api<{items:Ad[]}>(`/ads?limit=48&sort=createdAt&order=desc${suffix}`);setAds(d.items||[]);}catch{setAds([])}finally{setLoading(false);setRefresh(false)}};
 useEffect(()=>{run()},[]);
 return <View style={styles.screen}><View style={styles.header}><Text style={styles.title}>Search marketplace</Text><TextInput value={q} onChangeText={setQ} onSubmitEditing={run} placeholder="Search adverts" placeholderTextColor="#8A94A6" style={styles.input}/></View>{loading&&!ads.length?<ActivityIndicator color={GREEN} style={{margin:30}}/>:<FlatList data={ads} numColumns={2} keyExtractor={x=>x.id} columnWrapperStyle={styles.cols} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refresh} onRefresh={()=>{setRefresh(true);run()}} tintColor={GREEN}/>} ListHeaderComponent={<Text style={styles.count}>{ads.length} result{ads.length===1?'':'s'}</Text>} renderItem={({item})=><AdCard ad={item}/>} ListEmptyComponent={<Text style={styles.empty}>No matching adverts found.</Text>}/>}</View>
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#F6F8F7'},header:{padding:16,paddingTop:24,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#E5EAE7'},title:{fontSize:22,fontWeight:'900',color:'#17202A',marginBottom:12},input:{height:50,borderRadius:12,borderWidth:1,borderColor:'#DCE4E0',paddingHorizontal:14,fontSize:15,color:'#17202A'},content:{padding:12,paddingBottom:90},cols:{gap:10,marginBottom:10},count:{fontWeight:'800',color:'#5E6B76',marginBottom:12},empty:{textAlign:'center',paddingVertical:40,color:'#74808B'}});
