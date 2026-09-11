'use client';
import {useEffect,useState} from 'react';
import Header from '../components/Header';
import Link from 'next/link';
import {api} from '../lib';
const plans=[
{name:'Basic',price:50000,tag:'For new sellers',reach:'Up to 2x more visibility',items:['Search & category promotion','Auto-renew every 48 hours','Pro Reach access']},
{name:'Premium',price:150000,tag:'For growing sellers',reach:'Up to 5x more visibility',items:['Search & category promotion','Auto-renew every 24 hours','5 Top placements','Pro Reach access']},
{name:'VIP',price:250000,tag:'For serious sellers',reach:'Up to 7x more visibility',items:['Search & category promotion','Auto-renew every 12 hours','10 VIP Top placements','Pro Reach access']},
{name:'VIP Gold',price:450000,tag:'Best for businesses',reach:'Up to 10x more visibility',items:['Auto-renew every 6 hours','15 VIP Gold placements','New-message alerts','Business website link','Email & social promotion','Pro Reach access']},
{name:'Diamond',price:950000,tag:'High-volume sellers',reach:'Up to 500x campaign reach',items:['Up to 500 Diamond placements','All VIP Gold benefits','Priority business support','Pro Reach access']},
{name:'Enterprise',price:null,tag:'Large businesses',reach:'Custom high-volume reach',items:['Custom placement volume','All VIP benefits','Dedicated campaign setup','Priority business support']},
];
export default function SellerPlans(){
 const [sub,setSub]=useState<any>(null);
 useEffect(()=>{if(localStorage.getItem('minify_user'))api('/subscriptions/me').then(setSub).catch(()=>{})},[]);
 return <><Header/><main className="container section"><div className="page-head"><div><span className="eyebrow">SELLER GROWTH</span><h1>MINIFY MARKET Seller Packages</h1><p className="muted">Launch with 6 months free, then choose the package that matches your selling volume.</p></div></div>
 <div className="panel notice"><b>Launch advantage:</b> seller access is free for the first 6 months. Paid packages will unlock after the trial period with secure payment support.</div>
 <div className="plans-grid">{plans.map((p,i)=><article className={'plan-card '+(i===3?'featured-plan':'')} key={p.name}>{i===3&&<span className="plan-ribbon">MOST POPULAR</span>}<span className="eyebrow">{p.tag}</span><h2>{p.name}</h2><div className="plan-price">{p.price?<>UGX {p.price.toLocaleString()}<small>/ month</small></>:'Custom'}</div><strong>{p.reach}</strong><ul>{p.items.map(x=><li key={x}>{x}</li>)}</ul><button className="btn outline" disabled>{sub?.trialExpired?'Coming soon':'Included after trial'}</button></article>)}</div>
 <div className="panel section-small"><h2>Promotion add-ons</h2><p className="muted">Packages and advert-level promotions are separate. Sellers can boost individual active adverts when promotion billing is enabled.</p><div className="promo-mini"><div><b>Boost</b><span>Short-term higher placement</span><strong>From UGX 5,000</strong></div><div><b>Featured</b><span>Premium placement</span><strong>From UGX 15,000</strong></div><div><b>Pro Reach</b><span>Pay for actual buyer clicks</span><strong>UGX 150-300 / click</strong></div></div></div>
 <Link href="/dashboard" className="btn primary">Back to seller dashboard</Link></main></>;
}
