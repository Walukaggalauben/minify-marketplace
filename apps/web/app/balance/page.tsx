'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import {api,money} from '../lib';
import {ArrowLeft,Banknote,CircleDollarSign,Wallet,ShieldCheck} from 'lucide-react';

export default function BalancePage(){
 const [data,setData]=useState<any>(null),[error,setError]=useState('');
 useEffect(()=>{if(!localStorage.getItem('minify_token')){location.href='/login?next=/balance';return}api('/users/me/balance').then(setData).catch((e:any)=>setError(e.message||'Could not load seller balance.'))},[]);
 return <><Header/><main className="page-shell"><div className="page-title"><Link href="/dashboard" className="back-link"><ArrowLeft size={17}/> Seller dashboard</Link><span className="eyebrow">SELLER FINANCE</span><h1>Balance & earnings</h1><p className="muted">Track completed marketplace sales and your configured payout status.</p></div>
 {error&&<div className="notice">{error}</div>}
 <section className="balance-hero"><div><span className="eyebrow">AVAILABLE SALES VALUE</span><strong>{money(data?.available||0)}</strong><p>Completed order value currently recorded for this seller account.</p></div><div className="balance-icon"><Wallet size={34}/></div></section>
 <div className="balance-grid"><div className="balance-card"><CircleDollarSign/><span>Completed sales</span><b>{money(data?.sales||0)}</b></div><div className="balance-card"><Banknote/><span>Completed orders</span><b>{data?.completedOrders??0}</b></div><div className="balance-card"><ShieldCheck/><span>Payout setup</span><b>{data?.payoutStatus==='ACTIVE'?'Configured':'Not configured'}</b></div></div>
 <section className="surface surface-pad balance-note"><h2>Seller payouts</h2><p className="muted">MINIFY records completed order value here. Actual bank/mobile-money settlement is handled through the configured Flutterwave seller payout account.</p><Link href="/account" className="btn primary">Configure payout account</Link></section>
 </main></>;
}
