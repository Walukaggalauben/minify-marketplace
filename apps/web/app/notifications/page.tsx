'use client';
import {useEffect,useState} from 'react';
import Header from '../components/Header';
import Link from 'next/link';
import {api} from '../lib';

export default function Notifications(){
 const [items,setItems]=useState<any[]>([]),[busy,setBusy]=useState(true),[marking,setMarking]=useState(false);
 useEffect(()=>{if(!localStorage.getItem('minify_user')){location.href='/login';return}load()},[]);
 async function load(){try{setItems(await api('/notifications'))}catch{}finally{setBusy(false)}}
 async function read(id:string,link?:string){await api('/notifications/'+id+'/read',{method:'PATCH'}).catch(()=>{});if(link)location.href=link;else load()}
 async function all(){setMarking(true);await api('/notifications/read-all',{method:'PATCH'}).catch(()=>{});await load();setMarking(false)}
 return <><Header/><main className="container section"><div className="page-head"><div><span className="eyebrow">ACCOUNT</span><h1>Notifications</h1><p className="muted">Updates about your adverts, orders and marketplace activity.</p></div><button className="btn outline" onClick={all} disabled={marking||!items.some(n=>!n.readAt)}>{marking?'Markingâ€¦':'Mark all read'}</button></div>
  {busy?<div className="panel">Loading notificationsâ€¦</div>:items.length===0?<div className="panel empty"><h3>You're all caught up</h3><p className="muted">New marketplace updates will appear here.</p><Link href="/" className="btn primary">Browse marketplace</Link></div>:<div className="notifications-list">{items.map(n=><button key={n.id} className={'notification '+(!n.readAt?'unread':'')} onClick={()=>read(n.id,n.link)}><div><b>{n.title}</b><p>{n.body}</p><small>{new Date(n.createdAt).toLocaleString()}</small></div>{!n.readAt&&<span className="notification-dot"/>}</button>)}</div>}
 </main></>;
}

