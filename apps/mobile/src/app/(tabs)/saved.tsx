import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { api, type Ad } from '@/lib/api';
import AdCard from '@/components/AdCard';
import { useSession } from '@/lib/session';
const GREEN='#0B8F55';
export default function SavedTab(){
 const{user,loading:sessionLoading}=useSession();const[ads,setAds]=useState<Ad[]>([]);const[loading,setLoading]=useState(true);
 const load=useCallback(async()=>{if(!user){setAds([]);setLoading(false);return}try{const data=await api<any[]>(`/favorites/${user.id}`);setAds((data||[]).map(x=>x.Ad).filter(Boolean))}catch{setAds([])}finally{setLoading(false)}},[user]);
 useEffect(()=>{if(!sessionLoading)load()},[sessionLoading,load]);
 if(sessionLoading)return <View style={styles.center}><ActivityIndicator color={GREEN}/></View>;
 if(!user)return <View style={styles.center}><Text style={styles.title}>Sign in to see saved adverts</Text><Pressable style={styles.button} onPress={()=>router.push({pathname:'/login',params:{next:'/(tabs)/saved'}})}><Text style={styles.buttonText}>Sign in</Text></Pressable></View>;
 return <View style={styles.screen}><View style={styles.head}><View><Text style={styles.kicker}>YOUR MARKETPLACE</Text><Text style={styles.title}>Saved adverts</Text></View><Pressable onPress={()=>router.push('/search')}><Text style={styles.browse}>Browse</Text></Pressable></View>{loading?<ActivityIndicator color={GREEN} style={{marginTop:24}}/>:ads.length?<FlatList data={ads} numColumns={2} keyExtractor={x=>x.id} columnWrapperStyle={styles.cols} contentContainerStyle={styles.list} renderItem={({item})=><AdCard ad={item} initialSaved onSavedChange={saved=>{if(!saved)setAds(current=>current.filter(x=>x.id!==item.id))}}/>}/>:<View style={styles.empty}><Text style={styles.emptyTitle}>Nothing saved yet</Text><Text style={styles.emptyText}>Tap the heart on an advert and it will appear here.</Text><Pressable style={styles.button} onPress={()=>router.push('/search')}><Text style={styles.buttonText}>Browse adverts</Text></Pressable></View>}</View>;
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#F6F8F7',padding:14,paddingTop:28},center:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#F6F8F7',padding:24},head:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',marginBottom:15},kicker:{fontSize:10,fontWeight:'900',letterSpacing:1.6,color:GREEN,marginBottom:3},title:{fontSize:25,fontWeight:'900',color:'#17202A'},browse:{fontSize:13,fontWeight:'900',color:GREEN,paddingBottom:2},cols:{gap:10,marginBottom:10},list:{paddingBottom:90},empty:{marginTop:45,alignItems:'center',padding:24},emptyTitle:{fontSize:20,fontWeight:'900',color:'#17202A'},emptyText:{color:'#74808B',textAlign:'center',lineHeight:20,marginVertical:9},button:{backgroundColor:GREEN,paddingHorizontal:20,paddingVertical:13,borderRadius:12,marginTop:10},buttonText:{color:'#FFF',fontWeight:'900'}});
