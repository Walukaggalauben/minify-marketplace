'use client';
import {useEffect,useState} from 'react';
import {api} from '../lib';

export default function SellerSubscription(){
 const [s,setS]=useState<any>(null),[plans,setPlans]=useState<any[]>([]),[network,setNetwork]=useState('MTN'),[busy,setBusy]=useState('');
 useEffect(()=>{Promise.all([api('/subscriptions/me'),api('/subscriptions/plans')]).then(([a,b])=>{setS(a);setPlans(b||[])}).catch(()=>{})},[]);
 async function choose(plan:string){
  setBusy(plan);
  try{const r=await api('/subscriptions/initiate',{method:'POST',body:JSON.stringify({plan,network})});if(r?.authorization?.redirect){location.href=r.authorization.redirect;return}alert(r.message||'Payment started.');}
  catch(e:any){alert(e.message||'Could not start package payment.')}finally{setBusy('')}
 }
 if(!s)return null;
 const paid=s.subscriptionStatus==='ACTIVE'&&s.subscriptionEndsAt&&new Date(s.subscriptionEndsAt)>new Date();
 return <section className="panel subscription-panel">
  <div className="section-head"><div><span className="eyebrow">SELLER PACKAGE</span><h2>{paid?s.subscriptionPlan.replace('_',' ')+' plan':'Choose your seller package'}</h2></div><span className="status status-active">{s.trialExpired?'Trial ended':paid?'Active':'6-month free trial'}</span></div>
  {s.trial&&!s.trialExpired&&<p className="muted">Free seller access ends {new Date(s.trialEndsAt).toLocaleDateString()} · {s.trialDaysRemaining} days remaining.</p>}
  {s.trialExpired&&!paid&&<p className="muted">Your free launch period has ended. Choose a package and pay by MTN or Airtel Mobile Money.</p>}
  {paid&&<p className="muted">Active until {new Date(s.subscriptionEndsAt).toLocaleDateString()}.</p>}
  <label>Mobile Money<select value={network} onChange={e=>setNetwork(e.target.value)}><option value="MTN">MTN</option><option value="AIRTEL">Airtel</option></select></label>
  <div className="subscription-options">{plans.map(p=><div className="subscription-option" key={p.id}><b>{p.name}</b><strong>UGX {Number(p.price).toLocaleString()}<small>/month</small></strong><button className="btn outline" onClick={()=>choose(p.id)} disabled={!!busy}>{busy===p.id?'Starting payment…':paid&&s.subscriptionPlan===p.id?'Renew package':'Pay & activate'}</button></div>)}</div>
 </section>;
}