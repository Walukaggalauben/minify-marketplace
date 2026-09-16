'use client';
import {useState} from 'react';
import {api,money} from '../lib';

export default function OrderPanel({ad}:{ad:any}){
 const [qty,setQty]=useState(1),[delivery,setDelivery]=useState('MEETUP'),[payment,setPayment]=useState('CASH');
 const [address,setAddress]=useState(''),[note,setNote]=useState(''),[busy,setBusy]=useState(false),[msg,setMsg]=useState('');
 const total=Number(ad.price)*qty;
 async function order(){
  if(!localStorage.getItem('minify_token')){location.href='/login?next='+encodeURIComponent(location.pathname);return}
  if(delivery==='DELIVERY'&&!address.trim()){setMsg('Please enter a delivery address.');return}
  setBusy(true);setMsg('');
  try{const o=await api('/orders',{method:'POST',body:JSON.stringify({adId:ad.id,quantity:qty,deliveryMethod:delivery,paymentMethod:payment,deliveryAddress:delivery==='DELIVERY'?address.trim():null,buyerNote:note.trim()||null})});
   setMsg(`Purchase request created. Order ${String(o.id).slice(0,8)}...`);setTimeout(()=>{location.href='/orders'},700);
  }catch(e:any){setMsg(e?.message||'Could not create order.')}finally{setBusy(false)}
 }
 return <div className="order-panel"><div><span className="eyebrow">BUY SAFELY</span><h2>Request this item</h2><p className="muted">Send the seller a structured purchase request.</p></div>
  <label>Quantity<select value={qty} onChange={e=>setQty(Math.max(1,Number(e.target.value)))}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
  <label>Collection or delivery<select value={delivery} onChange={e=>setDelivery(e.target.value)}><option value="MEETUP">Meet seller</option><option value="DELIVERY">Request delivery</option></select></label>
  <label>Payment method<select value={payment} onChange={e=>setPayment(e.target.value)}><option value="CASH">Cash on handover</option><option value="MOBILE_MONEY">Mobile Money</option></select></label>
  {delivery==='DELIVERY'&&<label>Delivery address<input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Area, street or landmark"/></label>}
  <label>Message to seller <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional note" rows={2}/></label>
  <div className="order-total"><span>Estimated total</span><b>{money(total)}</b></div>
  <button className="btn primary" onClick={order} disabled={busy}>{busy?'Sending...':'Request to buy'}</button>{msg&&<div className="notice">{msg}</div>}
  <small className="muted">Mobile Money payments are securely handled through Flutterwave. You will be redirected to complete checkout; never share your PIN.</small>
 </div>
}

