import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSession } from '@/lib/session';
import { languages, useLanguage, type Language } from '@/lib/i18n';

const GREEN='#0B8F55'; const ORANGE='#FFA43A'; const BLUE='#12A9E0'; const RED='#FF2635'; const TEXT='#34434D'; const MUTED='#6F91A2';
type Row={label:string;icon:any;color:string;value?:string;action:()=>void};

export default function Settings(){
 const {user,logout}=useSession(); const {language,t,setLanguage}=useLanguage();
 const current=languages.find(x=>x.code===language)?.native||'English';
 const chooseLanguage=()=>Alert.alert(t('selectLanguage'),undefined,languages.map(item=>({text:item.native,onPress:()=>setLanguage(item.code as Language)})));
 const rows:Row[]=[
  {label:'Personal info',icon:'person-outline',color:GREEN,action:()=>router.push('/account')},
  {label:'Business info',icon:'briefcase-outline',color:ORANGE,action:()=>router.push('/dashboard')},
  {label:'"Verified ID" badge',icon:'person-circle-outline',color:BLUE,value:'What is it?',action:()=>router.push('/info?section=verification')},
  {label:t('changeLanguage'),icon:'globe-outline',color:ORANGE,value:current,action:chooseLanguage},
  {label:'Change phone number',icon:'call-outline',color:GREEN,value:user?.phone||'',action:()=>Alert.alert('Change phone number','Phone number changes can be handled from your account support flow.')},
  {label:'Change e-mail',icon:'at-outline',color:ORANGE,value:user?.email||'',action:()=>Alert.alert('Change e-mail','Your login e-mail is currently managed by your account.')},
  {label:'Disable chats',icon:'chatbox-outline',color:GREEN,value:'Enabled',action:()=>Alert.alert('Chats','Chat settings are currently enabled.')},
  {label:'Disable feedback',icon:'chatbubble-ellipses-outline',color:ORANGE,value:'Enabled',action:()=>Alert.alert('Feedback','Feedback is currently enabled.')},
  {label:'Manage notifications',icon:'notifications-outline',color:RED,action:()=>router.push('/notifications')},
  {label:'About MINIFY MARKET',icon:'information-outline',color:TEXT,action:()=>Alert.alert('MINIFY MARKET','Uganda marketplace for products, services, jobs and more.')},
  {label:'Rate us',icon:'star-outline',color:TEXT,action:()=>Alert.alert('Rate MINIFY MARKET','App Store and Google Play ratings will be available with the public release.')},
  {label:'Change password',icon:'lock-closed-outline',color:'#A5BCC8',action:()=>Alert.alert('Change password','Use the account security screen to change your password.')},
 ];
 return <View style={styles.screen}><View style={styles.header}><Pressable onPress={()=>router.back()} style={styles.back}><Ionicons name="arrow-back" size={31} color={TEXT}/></Pressable><Text style={styles.title}>{t('settings')}</Text></View><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
  <View style={styles.identity}><Image source={require('../../assets/images/minify-market.png')} style={styles.identityLogo}/><View style={{flex:1}}><Text style={styles.identityName}>{user?.name||'MINIFY MARKET'}</Text><Text style={styles.identityEmail}>{user?.email||''}</Text></View></View>
  {rows.map(row=><SettingRow key={row.label} row={row}/>)}
  <SettingRow row={{label:'Delete my account permanently',icon:'trash-outline',color:'#A5BCC8',action:()=>Alert.alert('Delete account','This action is permanent. Contact support if you want to request account deletion.')}}/>
  <SettingRow row={{label:'Log out',icon:'log-out-outline',color:'#A5BCC8',action:()=>Alert.alert('Sign out','Do you want to log out?', [{text:'Cancel',style:'cancel'},{text:'Log out',style:'destructive',onPress:logout}])}}/>
 </ScrollView></View>;
}
function SettingRow({row}:{row:Row}){return <Pressable onPress={row.action} style={styles.row}><View style={[styles.icon,{backgroundColor:row.color}]}><Ionicons name={row.icon} size={27} color="#FFF"/></View><Text style={styles.label} numberOfLines={1}>{row.label}</Text>{row.value&&<Text style={styles.value} numberOfLines={1}>{row.value}</Text>}<Ionicons name="chevron-forward" size={25} color={MUTED}/></Pressable>}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#EAF3F8'},header:{height:88,backgroundColor:'#FFF',flexDirection:'row',alignItems:'center',paddingHorizontal:18,borderBottomWidth:1,borderBottomColor:'#D6E0E6'},back:{width:42},title:{fontSize:25,fontWeight:'700',color:TEXT,marginLeft:8},content:{paddingBottom:110},identity:{height:78,backgroundColor:'#FFF',flexDirection:'row',alignItems:'center',paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:'#D6E0E6'},identityLogo:{width:78,height:58,resizeMode:'contain',marginRight:10},identityName:{fontSize:17,fontWeight:'800',color:TEXT},identityEmail:{fontSize:12,color:MUTED,marginTop:3},row:{minHeight:92,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#D6E0E6',flexDirection:'row',alignItems:'center',paddingHorizontal:16},icon:{width:62,height:62,borderRadius:15,alignItems:'center',justifyContent:'center'},label:{flex:1,fontSize:17,color:TEXT,marginLeft:16,fontWeight:'600'},value:{maxWidth:'35%',fontSize:15,color:MUTED,marginRight:9}});
