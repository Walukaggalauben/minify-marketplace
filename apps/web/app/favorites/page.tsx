'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import { api, money } from '../lib';

export default function FavoritesPage(){
 const [items,setItems]=useState<any[]>([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{const raw=localStorage.getItem('minify_user');if(!raw){location.href='/login?next=/favorites';return}const u=JSON.parse(raw);api('/favorites/'+u.id).then(setItems).catch(()=>{}).finally(()=>setLoading(false))},[]);
 async function remove(f:any){const u=JSON.parse(localStorage.getItem('minify_user')||'{}');await api('/favorites/'+u.id+'/'+f.adId,{method:'DELETE'});setItems(x=>x.filter(v=>v.id!==f.id));}
 return <><Header/><main className="container section"><div className="section-head"><div><span className="eyebrow">MY ACCOUNT</span><h1>Saved favourites</h1><p className="muted">Keep adverts you want to come back to.</p></div></div>
 {loading?<div className="empty">Loading your favourites…</div>:items.length?<div className="grid">{items.map((f:any)=><div className="listing" key={f.id}><Link href={'/ad/'+f.ad.id}><div className="listing-image"><img src={f.ad.images?.[0]?.url||'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=900&q=80'}/></div><div className="listing-body"><div className="price">{money(f.ad.price)}</div><b className="listing-title">{f.ad.title}</b><div className="muted">{f.ad.city||'Uganda'} · {f.ad.seller?.name||'Seller'}</div></div></Link><button className="btn outline" style={{margin:'0 15px 15px'}} onClick={()=>remove(f)}><Trash2 size={16}/> Remove</button></div>)}</div>:<div className="empty"><Heart size={34}/><h3>No saved adverts yet</h3><p>Tap the heart on an advert to save it here.</p><Link href="/" className="btn primary">Browse adverts</Link></div>}
 </main></>;
}