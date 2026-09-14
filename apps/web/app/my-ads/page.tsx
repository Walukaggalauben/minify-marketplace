'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import {api,mediaUrl,money} from '../lib';
import {Archive,CheckCircle,Clock,Eye,Heart,MessageCircle,Plus,RotateCcw,Tag} from 'lucide-react';

export default function MyAds(){
 const [ads,setAds]=useState<any[]>([]),[tab,setTab]=useState('ALL'),[loading,setLoading]=useState(true),[msg,setMsg]=useState('');
 async function load(){try{const x=await api('/ads/mine');setAds(Array.isArray(x)?x:[])}catch(e:any){setMsg(e?.message||'Could not load your adverts.')}finally{setLoading(false)}}
 useEffect(()=>{if(!localStorage.getItem('minify_token')){location.href='/login?next=/my-ads';return}load()},[]);
 const counts=useMemo(()=>({ALL:ads.length,ACTIVE:ads.filter(a=>a.status==='ACTIVE').length,PENDING:ads.filter(a=>a.status==='PENDING_REVIEW').length,CLOSED:ads.filter(a=>['SOLD','EXPIRED'].includes(a.status)).length,REJECTED:ads.filter(a=>a.status==='REJECTED').length}),[ads]);
 const visible=ads.filter(a=>tab==='ALL'||(tab==='CLOSED'?['SOLD','EXPIRED'].includes(a.status):tab==='PENDING'?a.status==='PENDING_REVIEW':a.status===tab));
 async function renew(id:string){setMsg('');try{await api('/ads/'+id+'/renew',{method:'POST'});setMsg('Advert sent back for moderation.');await load()}catch(e:any){setMsg(e?.message||'Could not renew advert.')}}
 async function sold(id:string){if(!confirm('Mark this advert as sold?'))return;try{await api('/ads/'+id+'/sold',{method:'POST'});await load()}catch(e:any){setMsg(e?.message||'Could not close advert.')}}
 return <><Header/><main className="page-shell">
  <div className="page-title"><span className="eyebrow">SELLER CENTRE</span><h1>My adverts</h1><p className="muted">Manage active, pending and closed adverts from one place.</p><div className="dashboard-actions"><Link href="/sell" className="btn primary"><Plus size={17}/> Post an advert</Link><Link href="/seller-plans" className="btn outline"><Tag size={17}/> Seller growth</Link></div></div>
  <div className="ad-management-tabs">{[['ALL','All'],['ACTIVE','Active'],['PENDING','Pending'],['CLOSED','Closed'],['REJECTED','Needs attention']].map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}<b>{counts[id as keyof typeof counts]}</b></button>)}</div>
  {msg&&<div className="notice">{msg}</div>}
  {loading?<div className="surface surface-pad empty">Loading your adverts…</div>:visible.length===0?<div className="surface surface-pad empty"><Archive size={36}/><h3>No adverts in this view</h3><p className="muted">Your marketplace listings will appear here.</p><Link href="/sell" className="btn primary">Create an advert</Link></div>:<div className="managed-ad-list">
   {visible.map(a=><article className="managed-ad" key={a.id}>
    <Link href={'/ad/'+a.id} className="managed-ad-main"><div className="managed-ad-image"><img src={mediaUrl(a.images?.[0]?.url||'/logo-market.png')} alt={a.title}/><span>{a.images?.length||0} photos</span></div>
    <div className="managed-ad-copy"><div className="managed-ad-top"><strong>{money(a.price)}</strong><span className={'status status-'+String(a.status).toLowerCase()}>{String(a.status).replace('_',' ')}</span></div><h2>{a.title}</h2><p>{a.city}{a.location?' · '+a.location:''}</p>
    <div className="managed-ad-stats"><span><Eye size={15}/> {a.views||0} views</span><span><Heart size={15}/> Saved</span><span><MessageCircle size={15}/> Messages</span><span><Clock size={15}/> {new Date(a.createdAt).toLocaleDateString()}</span></div>
    {a.status==='REJECTED'&&<div className="moderation-note"><b>Needs attention:</b> {a.moderationNote||'Review the advert details and submit again.'}</div>}</div></Link>
    <div className="managed-ad-actions">
     {a.status==='ACTIVE'&&<><Link href={'/sell/'+a.id} className="btn outline">Edit</Link><Link href={'/sell/'+a.id+'?promote=1'} className="btn outline">Promote</Link><button className="btn outline" onClick={()=>sold(a.id)}><CheckCircle size={15}/> Mark sold</button></>}
     {['EXPIRED','REJECTED'].includes(a.status)&&<><Link href={'/sell/'+a.id} className="btn outline">Edit</Link><button className="btn primary" onClick={()=>renew(a.id)}><RotateCcw size={15}/> Reactivate</button></>}
     {a.status==='PENDING_REVIEW'&&<span className="muted">Awaiting moderation</span>}{a.status==='SOLD'&&<span className="muted">Closed · Sold</span>}
    </div>
   </article>)}
  </div>}
 </main></>;
}
