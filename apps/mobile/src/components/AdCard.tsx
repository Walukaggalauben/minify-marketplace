import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { mediaUrl, type Ad } from '@/lib/api';
const GREEN = '#0B8F55';
export default function AdCard({ ad }: { ad: Ad }) {
  const image = ad.images?.[0]?.url;
  return <Pressable onPress={() => router.push(`/ad/${ad.id}`)} style={styles.card}>
    {image ? <Image source={{ uri: mediaUrl(image) }} style={styles.image} /> : <View style={[styles.image, styles.noImage]}><Text style={styles.noImageText}>MINIFY</Text></View>}
    <View style={styles.body}><Text numberOfLines={2} style={styles.title}>{ad.title}</Text><Text style={styles.price}>UGX {Number(ad.price).toLocaleString()}</Text><Text numberOfLines={1} style={styles.meta}>{ad.city || 'Uganda'} · {ad.category?.name || 'Marketplace'}</Text></View>
  </Pressable>;
}
const styles=StyleSheet.create({card:{backgroundColor:'#FFF',borderRadius:14,overflow:'hidden',borderWidth:1,borderColor:'#E5EAE7',flex:1},image:{width:'100%',height:145,backgroundColor:'#EEF2F0'},noImage:{alignItems:'center',justifyContent:'center'},noImageText:{fontWeight:'900',color:GREEN},body:{padding:10},title:{fontWeight:'700',fontSize:14,color:'#17202A',minHeight:36},price:{color:GREEN,fontWeight:'900',fontSize:15,marginTop:6},meta:{fontSize:11,color:'#74808B',marginTop:5}});
