import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, mediaUrl, type Ad } from '@/lib/api';
import { useSession } from '@/lib/session';
const GREEN='#0B8F55';
export default function AdCard({ad,initialSaved=false,onSavedChange}:{ad:Ad;initialSaved?:boolean;onSavedChange?:(saved:boolean)=>void}){
 const{user}=useSession();const[saved,setSaved]=useState(initialSaved);const[busy,setBusy]=useState(false);
 const toggle=async()=>{if(busy)return;if(!user){router.push({pathname:'/login',params:{next:`/ad/${ad.id}`}});return}setBusy(true);try{if(saved){await api(`/favorites/${user.id}/${ad.id}`,{method:'DELETE'});setSaved(false);onSavedChange?.(false)}else{await api('/favorites',{method:'POST',body:JSON.stringify({userId:user.id,adId:ad.id})});setSaved(true);onSavedChange?.(true)}}catch{}finally{setBusy(false)}};
 return <Pressable onPress={()=>router.push(`/ad/${ad.id}`)} style={styles.card}>
  <View style={styles.imageWrap}>{ad.images?.[0]?.url?<Image source={{uri:mediaUrl(ad.images[0].url)}} style={styles.image}/>:<View style={[styles.image,styles.noImage]}><Text style={styles.noImageText}>MINIFY MARKET</Text></View>}<Pressable onPress={toggle} style={styles.save} accessibilityLabel={saved?'Remove from saved':'Save advert'}><Ionicons name={saved?'heart':'heart-outline'} size={20} color={saved?GREEN:'#52615B'}/></Pressable></View>
  <View style={styles.body}><Text numberOfLines={2} style={styles.title}>{ad.title}</Text><Text style={styles.price}>UGX {Number(ad.price).toLocaleString()}</Text><Text numberOfLines={1} style={styles.meta}>{ad.city||'Uganda'} • {ad.category?.name||'Marketplace'}</Text></View>
 </Pressable>;
}
const styles=StyleSheet.create({card:{backgroundColor:'#FFF',borderRadius:15,overflow:'hidden',borderWidth:1,borderColor:'#E1E8E4',flex:1,shadowColor:'#16382F',shadowOpacity:.04,shadowRadius:7,shadowOffset:{width:0,height:2},elevation:1},imageWrap:{height:150,position:'relative',backgroundColor:'#EEF2F0'},image:{width:'100%',height:'100%',backgroundColor:'#EEF2F0'},noImage:{alignItems:'center',justifyContent:'center'},noImageText:{fontWeight:'900',color:GREEN,fontSize:11},save:{position:'absolute',right:8,top:8,width:34,height:34,borderRadius:17,backgroundColor:'#FFFE',alignItems:'center',justifyContent:'center'},body:{padding:10},title:{fontWeight:'800',fontSize:14,color:'#17202A',minHeight:36,lineHeight:18},price:{color:GREEN,fontWeight:'900',fontSize:15,marginTop:6},meta:{fontSize:11,color:'#74808B',marginTop:5}});
