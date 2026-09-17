import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSession } from '@/lib/session';
const GREEN='#00A83B';
const rows:[string,any,()=>void][]=[
 ['Personal info','person-outline',()=>router.push('/account')],
 ['Business info','briefcase-outline',()=>router.push('/pro-sales')],
 ['Verified ID badge','shield-checkmark-outline',()=>router.push('/verification')],
 ['Change language','globe-outline',()=>Alert.alert('Language','English is currently selected.')],
 ['Manage notifications','notifications-outline',()=>router.push('/notifications')],
 ['About MINIFY MARKET','information-circle-outline',()=>Alert.alert('MINIFY MARKET','Uganda marketplace for buying and selling products, services, jobs and more.')],
 ['Rate us','star-outline',()=>Alert.alert('Rate MINIFY MARKET','Thank you. App Store / Google Play rating will be enabled with the public release.')],
 ['Change password','lock-closed-outline',()=>router.push('/account')],
];
export default function Settings(){const{logout}=useSession();return <View style={styles.screen}><View style={styles.header}><Pressable onPress={()=>router.back()}><Ionicons name="arrow-back" size={31} color="#34434D"/></Pressable><Text style={styles.title}>Settings</Text><View style={{width:31}}/></View><ScrollView contentContainerStyle={{paddingBottom:100}}>{rows.map(([label,icon,onPress])=><Pressable key={label} onPress={onPress} style={styles.row}><View style={styles.icon}><Ionicons name={icon} size={26} color="#FFF"/></View><Text style={styles.label}>{label}</Text><Ionicons name="chevron-forward" size={25} color="#6F91A2"/></Pressable>)}<Pressable style={styles.row} onPress={()=>Alert.alert('Sign out','Do you want to log out?', [{text:'Cancel',style:'cancel'},{text:'Log out',style:'destructive',onPress:logout}])}><View style={[styles.icon,{backgroundColor:'#A5BCC8'}]}><Ionicons name="log-out-outline" size={26} color="#FFF"/></View><Text style={styles.label}>Log out</Text><Ionicons name="chevron-forward" size={25} color="#6F91A2"/></Pressable></ScrollView></View>}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#EAF3F8'},header:{height:88,backgroundColor:'#FFF',flexDirection:'row',alignItems:'center',paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:'#D6E0E6'},title:{flex:1,fontSize:25,fontWeight:'700',color:'#34434D',marginLeft:18},row:{height:92,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#D6E0E6',flexDirection:'row',alignItems:'center',paddingHorizontal:16},icon:{width:62,height:62,borderRadius:15,backgroundColor:GREEN,alignItems:'center',justifyContent:'center'},label:{flex:1,fontSize:17,color:'#34434D',marginLeft:16,fontWeight:'600'}});
