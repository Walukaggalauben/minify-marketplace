import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { useSession } from '@/lib/session';
const GREEN='#0B8F55';
export default function Messages(){
 const {user}=useSession();const {conversation}=useLocalSearchParams<{conversation?:string}>();const[data,setData]=useState<any[]>([]);const[loading,setLoading]=useState(true);
 useEffect(()=>{if(user)api<any[]>('/chats/mine').then(setData).catch(()=>setData([])).finally(()=>setLoading(false));else setLoading(false)},[user]);
 if(!user)return <NeedLogin/>;
 return <View style={s.screen}><Text style={s.h1}>Messages</Text>{loading?<ActivityIndicator color={GREEN}/>:<FlatList data={data} keyExtractor={x=>x.id} contentContainerStyle={s.list} ListEmptyComponent={<Text style={s.empty}>No conversations yet.</Text>} renderItem={({item})=><Conversation item={item} autoOpen={item.id===conversation}/>} />}</View>;
}
function Conversation({item,autoOpen=false}:{item:any;autoOpen?:boolean}){
 const[open,setOpen]=useState(autoOpen);const[messages,setMessages]=useState<any[]>([]);const[text,setText]=useState('');
 const load=async()=>{try{const d=await api<any[]>(`/chats/conversation/${item.id}`);setMessages(d||[]);await api(`/chats/conversation/${item.id}/read`,{method:'POST'})}catch{setMessages([])}};
 useEffect(()=>{if(autoOpen)load()},[autoOpen]);
 const send=async()=>{if(!text.trim())return;try{await api('/chats/message',{method:'POST',body:JSON.stringify({conversationId:item.id,body:text.trim()})});setText('');load()}catch{} };
 return <View style={s.card}><Pressable onPress={()=>{setOpen(!open);if(!open)load()}}><Text style={s.title}>{item.ad?.title||'Conversation'}</Text><Text style={s.meta}>{item.messages?.[0]?.body||'Tap to open conversation'}</Text></Pressable>{open&&<><View style={s.messages}>{messages.map(m=><View key={m.id} style={s.message}><Text style={s.messageText}>{m.body}</Text></View>)}</View><View style={s.send}><TextInput value={text} onChangeText={setText} placeholder="Message seller" placeholderTextColor="#8A94A6" style={s.input}/><Pressable onPress={send} style={s.sendButton}><Text style={s.sendText}>Send</Text></Pressable></View></>}</View>;
}
function NeedLogin(){return <View style={s.center}><Text style={s.h1}>Sign in required</Text><Pressable onPress={()=>router.push('/login')} style={s.button}><Text style={s.buttonText}>Log in</Text></Pressable></View>}
const s=StyleSheet.create({screen:{flex:1,backgroundColor:'#F6F8F7',padding:18,paddingTop:30},h1:{fontSize:26,fontWeight:'900',color:'#17202A',marginBottom:14},list:{gap:10,paddingBottom:90},card:{backgroundColor:'#FFF',padding:16,borderRadius:14,borderWidth:1,borderColor:'#E2E8E5'},title:{fontWeight:'900',color:'#17202A'},meta:{color:'#74808B',marginTop:5},messages:{gap:7,marginTop:12},message:{backgroundColor:'#F0F5F2',padding:10,borderRadius:10},messageText:{color:'#34414C'},send:{flexDirection:'row',gap:7,marginTop:12},input:{flex:1,height:45,borderWidth:1,borderColor:'#DCE4E0',borderRadius:10,paddingHorizontal:10,color:'#17202A'},sendButton:{backgroundColor:GREEN,borderRadius:10,paddingHorizontal:13,justifyContent:'center'},sendText:{color:'#FFF',fontWeight:'900'},empty:{textAlign:'center',padding:35,color:'#74808B'},center:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#F6F8F7'},button:{backgroundColor:GREEN,padding:14,borderRadius:12},buttonText:{color:'#FFF',fontWeight:'900'}});
