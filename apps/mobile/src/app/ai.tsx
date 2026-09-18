import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';
import { api, mediaUrl, type Ad } from '@/lib/api';

const GREEN = '#0B8F55';
const prompts = [
  'Find an iPhone under UGX 2.5m in Kampala',
  'Help me create an advert',
  'Compare prices for this item',
  'How do I buy safely?',
];

type Message = { from: 'ai' | 'user'; text: string };
type SearchResult = { items: Ad[]; total: number };

export default function MarketAI() {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    from: 'ai',
    text: 'Hello! I am MINIFY MARKET AI. I can help you find adverts, create listings, compare prices and shop more safely.',
  }]);
  const [results, setResults] = useState<Ad[]>([]);
  const [draft, setDraft] = useState('');

  const add = (from: 'ai' | 'user', text: string) => setMessages(x => [...x, { from, text }]);
  const searchListings = async (text: string) => {
    const lower = text.toLowerCase();
    const maxMatch = text.replace(/,/g, '').match(/(?:under|below|less than)\s*(?:ugx\s*)?([\d.]+)\s*(m|k)?/i);
    let maxPrice: number | undefined;
    if (maxMatch) {
      const n = Number(maxMatch[1]);
      maxPrice = maxMatch[2]?.toLowerCase() === 'm' ? n * 1000000 : maxMatch[2]?.toLowerCase() === 'k' ? n * 1000 : n;
    }
    const cityMatch = text.match(/in\s+([A-Za-z ]+?)(?:\s*$|\s+under\b|\s+below\b)/i);
    const city = cityMatch?.[1]?.trim();
    const cleaned = text
      .replace(/(?:find|show|search|looking for|listings? for)/gi, '')
      .replace(/(?:under|below|less than).*$/i, '')
      .replace(/\bin\s+[A-Za-z ]+$/i, '')
      .trim();
    const data = await api<SearchResult>(`/ads?limit=6&sort=createdAt&order=desc&q=${encodeURIComponent(cleaned || text)}${maxPrice ? `&maxPrice=${maxPrice}` : ''}${city ? `&city=${encodeURIComponent(city)}` : ''}`);
    setResults(data.items || []);
    add('ai', data.items?.length
      ? `I found ${data.items.length} matching advert${data.items.length === 1 ? '' : 's'}${data.total > data.items.length ? ` from ${data.total} results` : ''}. Tap a listing to view it.`
      : 'I could not find matching active adverts. Try a wider budget, a different location, or fewer keywords.');
  };

  const createDraft = (text: string) => {
    const item = text.toLowerCase().includes('advert') ? 'your item' : text;
    const title = item.replace(/help me create (an )?advert/gi, '').trim() || 'Your item';
    setDraft(`Title: ${title}\nPrice: Add your asking price\nCondition: Used / Brand new\nLocation: Kampala\n\nDescription: Describe the condition, key features, what is included, and your exact meeting or delivery location.`);
    add('ai', 'I prepared a starter advert draft below. Replace the placeholders, then use Sell to publish it.');
  };
  const send = async (value = input) => {
    const text = value.trim();
    if (!text || busy) return;
    setInput('');
    const prior = messages;
    add('user', text);
    setBusy(true);
    try {
      const data = await api<{reply:string;items:Ad[]}>(`/ai/chat`, { method:'POST', body:JSON.stringify({ message:text, history:prior.slice(-10).map(m=>({role:m.from==='ai'?'assistant':'user',content:m.text})) }) });
      add('ai', data.reply || 'Tell me a little more and I’ll help.');
      setResults(data.items || []);
      if (/(sell|advert|listing|post)/i.test(text)) setDraft('');
    } catch {
      add('ai', 'I could not reach the marketplace assistant right now. Check your connection and try again.');
    } finally { setBusy(false); }
  };

  return (
    <View style={s.screen}>
      <View style={s.top}>
        <Pressable onPress={() => router.back()} style={s.back}><Ionicons name="arrow-back" size={23} color="#17202A" /></Pressable>
        <View style={s.bot}><Ionicons name="sparkles" size={20} color="#FFF" /></View>
        <View style={{ flex: 1 }}><Text style={s.title}>MINIFY MARKET AI</Text><Text style={s.sub}>Your marketplace assistant</Text></View>
      </View>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <View style={s.hero}><Text style={s.eyebrow}>SMART MARKETPLACE HELP</Text><Text style={s.heroTitle}>Find it. Sell it. Understand it.</Text><Text style={s.heroText}>Search live marketplace adverts, draft listings and get practical buying guidance.</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.prompts}>{prompts.map(x => <Pressable key={x} onPress={() => send(x)} style={s.prompt}><Ionicons name="sparkles-outline" size={16} color={GREEN} /><Text style={s.promptText}>{x}</Text></Pressable>)}</ScrollView>
        <View style={s.chat}>{messages.map((m, i) => <View key={i} style={[s.msg, m.from === 'user' ? s.user : s.ai]}><Ionicons name={m.from === 'user' ? 'person-circle-outline' : 'sparkles'} size={16} color={m.from === 'user' ? '#60716A' : GREEN} /><Text style={[s.msgText, m.from === 'user' && s.userText]}>{m.text}</Text></View>)}</View>
        {busy && <View style={s.loading}><ActivityIndicator color={GREEN} /><Text style={s.loadingText}>MINIFY MARKET AI is thinking…</Text></View>}
        {!!results.length && <View style={s.results}><View style={s.resultHead}><Text style={s.resultTitle}>Matching adverts</Text><Text style={s.resultCount}>{results.length} shown</Text></View>{results.map(ad => <Pressable key={ad.id} style={s.result} onPress={() => router.push(`/ad/${ad.id}`)}><View style={s.resultImage}>{ad.images?.[0]?.url ? <Image source={{ uri: mediaUrl(ad.images[0].url) }} style={s.image} /> : <Ionicons name="image-outline" size={25} color="#8A9790" />}</View><View style={{ flex: 1 }}><Text numberOfLines={2} style={s.resultName}>{ad.title}</Text><Text style={s.resultPrice}>UGX {Number(ad.price).toLocaleString()}</Text><Text style={s.resultMeta}>{ad.city || 'Uganda'} · {ad.condition === 'NEW' ? 'Brand new' : ad.condition === 'REFURBISHED' ? 'Refurbished' : 'Used'}</Text></View><Ionicons name="chevron-forward" size={19} color="#829088" /></Pressable>)}</View>}
        {!!draft && <View style={s.draft}><View style={s.resultHead}><Text style={s.resultTitle}>Advert starter</Text><Pressable onPress={() => router.push('/sell')}><Text style={s.useSell}>Use Sell</Text></Pressable></View><Text style={s.draftText}>{draft}</Text></View>}
      </ScrollView>
      <View style={s.composer}><TextInput value={input} onChangeText={setInput} onSubmitEditing={() => send()} editable={!busy} placeholder="Ask MINIFY MARKET AI…" placeholderTextColor="#8A9790" style={s.input} returnKeyType="send" /><Pressable onPress={() => send()} disabled={busy || !input.trim()} style={[s.send, (!input.trim() || busy) && s.sendDisabled]}><Ionicons name="send" size={19} color="#FFF" /></Pressable></View>
    </View>
  );
}

const s = StyleSheet.create({
  screen:{flex:1,backgroundColor:'#F6F8F7'}, top:{height:86,paddingHorizontal:16,flexDirection:'row',alignItems:'center',gap:11,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#E0E8E4'}, back:{width:30,height:40,alignItems:'center',justifyContent:'center'}, bot:{width:43,height:43,borderRadius:14,backgroundColor:GREEN,alignItems:'center',justifyContent:'center'}, title:{fontSize:15,fontWeight:'900',color:'#17202A'}, sub:{fontSize:11,color:'#77847E',marginTop:2},
  body:{padding:16,paddingBottom:28}, hero:{padding:22,borderRadius:22,backgroundColor:GREEN,marginBottom:16}, eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1.5,color:'#C9FFE4'}, heroTitle:{fontSize:27,fontWeight:'900',color:'#FFF',marginTop:7}, heroText:{fontSize:13,lineHeight:20,color:'#E3F8ED',marginTop:7},
  prompts:{gap:9,paddingBottom:14}, prompt:{width:190,minHeight:82,padding:13,borderRadius:16,backgroundColor:'#FFF',borderWidth:1,borderColor:'#DCE7E1',justifyContent:'space-between'}, promptText:{fontSize:12,fontWeight:'800',color:'#33423B',lineHeight:17},
  chat:{gap:11,paddingVertical:8}, msg:{maxWidth:'88%',flexDirection:'row',gap:8,padding:13,borderRadius:16,backgroundColor:'#FFF',borderWidth:1,borderColor:'#E1E9E5',alignSelf:'flex-start'}, ai:{borderBottomLeftRadius:5}, user:{alignSelf:'flex-end',backgroundColor:'#E8F6EF',borderColor:'#CFEBDD',borderBottomRightRadius:5}, msgText:{flex:1,fontSize:13,lineHeight:19,color:'#34433D'}, userText:{color:'#08785F',fontWeight:'700'},
  loading:{flexDirection:'row',alignItems:'center',gap:8,padding:12}, loadingText:{fontSize:12,color:'#73817B',fontWeight:'700'}, results:{marginTop:8,padding:12,borderRadius:18,backgroundColor:'#FFF',borderWidth:1,borderColor:'#DCE7E1'}, resultHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:9}, resultTitle:{fontSize:15,fontWeight:'900',color:'#17202A'}, resultCount:{fontSize:11,color:'#7A8781'}, result:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:10,borderTopWidth:1,borderTopColor:'#EEF2F0'}, resultImage:{width:62,height:62,borderRadius:12,backgroundColor:'#EEF2F0',alignItems:'center',justifyContent:'center',overflow:'hidden'}, image:{width:'100%',height:'100%'}, resultName:{fontSize:13,fontWeight:'800',color:'#24332D'}, resultPrice:{fontSize:14,fontWeight:'900',color:GREEN,marginTop:4}, resultMeta:{fontSize:10,color:'#7A8781',marginTop:3},
  draft:{marginTop:12,padding:14,borderRadius:18,backgroundColor:'#FFF',borderWidth:1,borderColor:'#DCE7E1'}, useSell:{fontSize:12,fontWeight:'900',color:GREEN}, draftText:{fontSize:12,lineHeight:19,color:'#4B5A54'}, composer:{padding:11,borderTopWidth:1,borderTopColor:'#DEE7E2',backgroundColor:'#FFF',flexDirection:'row',gap:8}, input:{flex:1,height:48,borderWidth:1,borderColor:'#D9E4DE',borderRadius:14,paddingHorizontal:14,color:'#17202A',fontSize:14}, send:{width:48,height:48,borderRadius:14,backgroundColor:GREEN,alignItems:'center',justifyContent:'center'}, sendDisabled:{opacity:.45}
});
