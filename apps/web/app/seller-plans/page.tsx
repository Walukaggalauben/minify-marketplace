'use client';
import {useEffect,useState} from 'react';
import Header from '../components/Header';
import Link from 'next/link';
import {api,money} from '../lib';
const plans=[
{name:'Basic',id:'BASIC',price:50000,tag:'For new sellers',reach:'Up to 2x more visibility',items:['Search & category promotion','Auto-renew every 48 hours','Pro Reach access']},
{name:'Premium',id:'PREMIUM',price:150000,tag:'For growing sellers',reach:'Up to 5x more visibility',items:['Search & category promotion','Auto-renew every 24 hours','5 Top placements','Pro Reach access']},
{name:'VIP',id:'VIP',price:250000,tag:'For serious sellers',reach:'Up to 7x more visibility',items:['Search & category promotion','Auto-renew every 12 hours','10 VIP Top placements','Pro Reach access']},
{name:'VIP Gold',id:'VIP_GOLD',price:450000,tag:'Best for businesses',reach:'Up to 10x more visibility',items:['Auto-renew every 6 hours','15 VIP Gold placements','New-message alerts','Business website link','Email & social promotion','Pro Reach access']},
{name:'Diamond',id:'DIAMOND',price:950000,tag:'High-volume sellers',reach:'Up to 500x campaign reach',items:['Up to 500 Diamond placements','All VIP Gold benefits','Priority business support','Pro Reach access']},
];
export default function SellerPlans(){
 const [sub,setSub]=useState<any>(null),[network,setNetwork]=useState('MTN'),[busy,setBusy]=useState(''),[msg,setMsg]=useState('');
 useEffect(()=>{if(localStorage.getItem('minify_user'))api('/subscriptions/me').then(setSub).catch(()=>{})},[]);
 async function choose(plan:string){setBusy(plan);setMsg('');try{const r=await api('/subscriptions/initiate',{method:'POST',body:JSON.stringify({plan,network})});setMsg(r?.message||(r?.ok?'Approve the Mobile Money request on your phone.':'Payment could not be started.'));}catch(e:any){setMsg(e?.message||'Payment could not be started.')}finally{setBusy('')}}
 return <><Header/><main className="container section"><div className="page-head"><div><span className="eyebrow">SELLER GROWTH</span><h1>MINIFY MARKET Seller Packages</h1><p className="muted">Launch with 6 months free, then choose the package that matches your selling volume.</p></div></div>
 <div className="panel notice"><b>Launch advantage:</b> seller access is free for the first 6 months. After the trial, packages keep your seller account active.</div>
 {sub?.paidRequired&&<div className="panel section-small"><div className="surface-head"><div><span className="eyebrow">ACTIVATE ACCESS</span><h2>Choose Mobile Money</h2></div></div><div className="form-grid"><label>Network<select value={network} onChange={e=>setNetwork(e.target.value)}><option>MTN</option><option>AIRTEL</option></select></label><div className="muted" style={{alignSelf:'end'}}>Payments are initiated securely through Flutterwave.</div></div>{msg&&<div className="notice">{msg}</div>}</div>}
 <div className="plans-grid">{plans.map((p,i)=><article className={'plan-card '+(i===3?'featured-plan':'')} key={p.id}>{i===3&&<span className="plan-ribbon">MOST POPULAR</span>}<span className="eyebrow">{p.tag}</span><h2>{p.name}</h2><div className="plan-price">{money(p.price)}<small>/ month</small></div><strong>{p.reach}</strong><ul>{p.items.map(x=><li key={x}>{x}</li>)}</ul><button className="btn outline" disabled={!!busy||!sub?.paidRequired} onClick={()=>choose(p.id)}>{busy===p.id?'Starting payment…':sub?.paidRequired?'Choose package':'Included after trial'}</button></article>)}</div>
 <div className="panel section-small"><h2>Promotion add-ons</h2><p className="muted">Packages and advert-level promotions are separate. Sellers can boost individual active adverts from Pro Sales.</p><Link href="/pro-sales" className="btn outline">Open Pro Sales</Link></div>
 <Link href="/dashboard" className="btn primary">Back to seller dashboard</Link></main></>;
}
