'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import {api,money} from '../lib';
import {Bell,Bookmark,Trash2,Search,ArrowRight} from 'lucide-react';

export default function SavedSearches(){
 const [items,setItems]=useState<any[]>([]),[loading,setLoading]=useState(true),[msg,setMsg]=useState('');
 async function load(){try{setItems(await api('/saved-searches'))}catch(e:any){setMsg('Please sign in to manage saved searches.')}finally{setLoading(false)}}
 useEffect(()=>{if(!localStorage.getItem('minify_token')){location.href='/login?next=/saved-searches';return}load()},[]);
 async function remove(id:string){if(!confirm('Delete this saved search?'))return;try{await api('/saved-searches/'+id,{method:'DELETE'});setItems(x=>x.filter(i=>i.id!==id))}catch(e:any){setMsg(e.message||'Could not delete saved search.')}}
 function href(x:any){const q=new URLSearchParams();if(x.query)q.set('q',x.query);if(x.categoryId)q.set('categoryId',x.categoryId);if(x.minPrice)q.set('minPrice',String(x.minPrice));if(x.maxPrice)q.set('maxPrice',String(x.maxPrice));if(x.city)q.set('city',x.city);return '/?'+q.toString()}
 return <><Header/><main className="container section saved-search-page">
  <div className="page-title"><div><span className="eyebrow">BUYER TOOLS</span><h1>Saved searches</h1><p className="muted">Keep favourite searches ready so you can return to matching adverts quickly.</p></div><Link href="/" className="btn primary"><Search size={16}/> Browse marketplace</Link></div>
  {msg&&<div className="notice">{msg}</div>}
  {loading?<div className="empty">Loading saved searches…</div>:!items.length?<div className="empty"><Bookmark size={34}/><h3>No saved searches yet</h3><p>Search the marketplace, then save a search to find the same products again.</p><Link href="/" className="btn primary">Start searching</Link></div>:<div className="saved-search-list">{items.map(x=><article className="saved-search-card" key={x.id}><div className="saved-search-icon"><Bell size={20}/></div><div className="saved-search-main"><b>{x.name}</b><span>{x.query?`Search: ${x.query}`:'All adverts'}{x.city?` · ${x.city}`:''}</span><small>{x.minPrice||x.maxPrice?`${x.minPrice?money(x.minPrice):'Any'} – ${x.maxPrice?money(x.maxPrice):'Any'}`:'Any price'} · Saved {new Date(x.createdAt).toLocaleDateString()}</small></div><div className="saved-search-actions"><Link className="btn outline" href={href(x)}>Open <ArrowRight size={15}/></Link><button className="btn danger" onClick={()=>remove(x.id)}><Trash2 size={15}/> Delete</button></div></article>)}</div>}
 </main></>}
