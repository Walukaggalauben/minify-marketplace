'use client';
import {useState} from 'react';
import {api,money} from '../lib';

export default function PaymentPanel({order,onPaid}:{order:any,onPaid?:()=>void}){
 const [busy,setBusy]=useState(false),[msg,setMsg]=useState('');
 async function pay(){
  setBusy(true);setMsg('');
  try{
   const r=await api('/payments',{method:'POST',body:JSON.stringify({orderId:order.id,provider:'MOBILE_MONEY'})});
   if(r?.authorizationUrl){
    setMsg('Opening secure Flutterwave checkoutâ€¦');
    window.location.href=r.authorizationUrl;
    return;
   }
   setMsg(r?.message||'Payment is pending.');
   onPaid?.();
  }catch(e:any){setMsg(e?.message||'Could not start payment.')}finally{setBusy(false)}
 }
 if(order.paymentMethod!=='MOBILE_MONEY'||order.paymentStatus==='PAID')return null;
 return <div className="payment-panel"><div><span className="eyebrow">SECURE PAYMENT</span><h3>Mobile Money</h3><p className="muted">Amount: {money(order.total)}</p></div><button className="btn primary" onClick={pay} disabled={busy}>{busy?'Preparingâ€¦':'Pay securely with Flutterwave'}</button>{msg&&<div className="notice">{msg}</div>}<small className="muted">You will be redirected to Flutterwave to complete payment. Your order is marked paid only after server-side verification.</small></div>;
}


