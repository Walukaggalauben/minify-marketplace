'use client';
import {useEffect,useState} from 'react';
import {api} from '../lib';

export default function PromotionPanel({ad}:{ad:any}){
 const [type,setType]=useState('BOOST');const [days,setDays]=useState(7);const [network,setNetwork]=useState('MTN');const [busy,setBusy]=useState(false);const [done,setDone]=useState('');
 const price=type==='FEATURED'?15000:5000;const total=price*Math.ceil(days/(type==='FEATURED'?7:3));
 useEffect(()=>{setDone('')},[type,days,network]);
 async function promote(){setBusy(true);try{const r=await api('/promotion-payments/initiate',{method:'POST',body:JSON.stringify({adId:ad.id,type,days,network})});if(r?.authorization?.redirect){location.href=r.authorization.redirect;return}setDone(r?.message||'Payment started.')}catch(e:any){setDone(e?.message||'Promotion payment failed.')}finally{setBusy(false)}}
 return <div className="promotion-panel">
  <div><span className="eyebrow">GROW YOUR REACH</span><h2>Promote this advert</h2><p className="muted">Put your listing in front of more buyers.</p></div>
  <div className="promotion-options"><button className={type==='BOOST'?'promotion-option active':'promotion-option'} onClick={()=>setType('BOOST')}><b>Boost</b><span>Higher placement in listings</span><strong>UGX 5,000 / 3 days</strong></button><button className={type==='FEATURED'?'promotion-option active':'promotion-option'} onClick={()=>setType('FEATURED')}><b>Featured</b><span>Premium placement for maximum visibility</span><strong>UGX 15,000 / 7 days</strong></button></div>
  <label>Mobile Money<select value={network} onChange={e=>setNetwork(e.target.value)}><option value="MTN">MTN</option><option value="AIRTEL">Airtel</option></select></label>
  <label>Duration<select value={days} onChange={e=>setDays(Number(e.target.value))}>{[3,7,14,30].map(x=><option key={x} value={x}>{x} days</option>)}</select></label>
  <div className="promotion-total"><span>Promotion total</span><b>UGX {total.toLocaleString()}</b></div>
  <button className="btn primary" onClick={promote} disabled={busy}>{busy?'Starting payment…':'Pay & promote'}</button>
  {done&&<div className="notice">{done}</div>}
  <small className="muted">Promotion activates only after the payment is verified.</small>
 </div>;
}