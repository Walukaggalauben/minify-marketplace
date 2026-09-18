'use client';
import Header from '../components/Header';
import {useState} from 'react';
import Link from 'next/link';
import {Bot,Search,Tag,ShieldCheck,Sparkles,Send,MessageCircle,ArrowRight} from 'lucide-react';
import {API,money,mediaUrl} from '../lib';

type Msg={from:'ai'|'user';text:string};
const suggestions=[
 {icon:Search,title:'Find an item',text:'Find me an iPhone 15 under UGX 2.5m in Kampala.'},
 {icon:Tag,title:'Check prices',text:'What prices are people listing for iPhone 15 Pro Max?'},
 {icon:Sparkles,title:'Create an advert',text:'Help me write a great advert for my phone.'},
 {icon:ShieldCheck,title:'Stay safe',text:'Give me safe buying and selling tips.'}
];

export default function MarketAI(){
 const[input,setInput]=useState(''); const[busy,setBusy]=useState(false); const[items,setItems]=useState<any[]>([]);
 const[messages,setMessages]=useState<Msg[]>([{from:'ai',text:'Hello! I’m MINIFY MARKET AI. I can help you find live adverts, understand prices, create listings and use MINIFY MARKET safely.'}]);
 async function send(value=input){
  const text=value.trim(); if(!text||busy)return; setInput(''); const prior=messages; setMessages(m=>[...m,{from:'user',text}]); setBusy(true);
  try{const r=await fetch(`${API}/ai/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history:prior.slice(-10).map(m=>({role:m.from==='ai'?'assistant':'user',content:m.text}))})});const d=await r.json();setMessages(m=>[...m,{from:'ai',text:d.reply||'Tell me a little more and I’ll help.'}]);setItems(d.items||[])}catch{setMessages(m=>[...m,{from:'ai',text:'I could not reach the marketplace assistant right now. Check your connection and try again.'}])}finally{setBusy(false)}
 }
 return <><Header/><main className="ai-page page-shell">
  <section className="ai-hero"><div className="ai-orb"><Bot size={42}/></div><div><span className="eyebrow ai-eyebrow">MINIFY MARKET AI</span><h1>Your marketplace assistant</h1><p>Find items faster, understand listings, create better adverts and get practical marketplace help.</p></div></section>
  <section className="ai-suggestions">{suggestions.map(({icon:Icon,title,text})=><button key={title} className="ai-suggestion" onClick={()=>send(text)}><span className="ai-suggestion-icon"><Icon size={20}/></span><span><b>{title}</b><small>{text}</small></span></button>)}</section>
  <section className="ai-chat surface"><div className="ai-chat-head"><div className="ai-avatar"><Bot size={21}/></div><div><b>MINIFY MARKET AI</b><span>{busy?'Thinking…':'Marketplace assistant'}</span></div><span className="ai-online">Online</span></div>
  <div className="ai-messages">{messages.map((m,i)=><div key={i} className={'ai-message '+m.from}><span>{m.from==='ai'?<Bot size={16}/>:<MessageCircle size={16}/>}</span><p>{m.text}</p></div>)}</div>
  {!!items.length&&<div className="ai-results"><h3>Live marketplace matches</h3>{items.map(a=><Link href={`/ad/${a.id}`} className="ai-result" key={a.id}><div>{a.images?.[0]?.url?<img src={mediaUrl(a.images[0].url)} alt=""/>:<div className="ai-result-placeholder">MM</div>}</div><span><b>{a.title}</b><strong>{money(a.price)}</strong><small>{a.city||'Uganda'} · {a.seller?.name||'Seller'}</small></span><ArrowRight size={17}/></Link>)}</div>}
  <form className="ai-composer" onSubmit={e=>{e.preventDefault();send()}}><input value={input} onChange={e=>setInput(e.target.value)} disabled={busy} placeholder="Ask MINIFY MARKET AI anything..."/><button aria-label="Send" type="submit" disabled={busy||!input.trim()}><Send size={19}/></button></form></section>
 </main></>;
}
