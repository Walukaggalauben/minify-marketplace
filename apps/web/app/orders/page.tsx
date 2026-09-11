'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import {api,money} from '../lib';
import PaymentPanel from '../components/PaymentPanel';

const labels:any={REQUESTED:'Requested',ACCEPTED:'Accepted',READY:'Ready for collection',OUT_FOR_DELIVERY:'Out for delivery',COMPLETED:'Completed',CANCELLED:'Cancelled'};
export default function Orders(){
 const [orders,setOrders]=useState<any[]>([]),[busy,setBusy]=useState(true),[me,setMe]=useState<any>(null),[msg,setMsg]=useState('');
 async function load(){try{setOrders(await api('/orders/mine'))}catch{}finally{setBusy(false)}}
 useEffect(()=>{const x=localStorage.getItem('minify_user');if(!x){location.href='/login';return}setMe(JSON.parse(x));load()},[]);
 async function update(id:string,status:string){try{setMsg('');await api(`/orders/${id}/status`,{method:'PATCH',body:JSON.stringify({status})});await load()}catch(e:any){setMsg(e?.message||'Could not update order.')}}
 async function confirmCash(id:string){try{setMsg('');await api(`/orders/${id}/cash-confirmation`,{method:'POST'});await load()}catch(e:any){setMsg(e?.message||'Could not confirm cash payment.')}}
 function actions(o:any){const seller=me&&o.sellerId===me.id;const buyer=me&&o.buyerId===me.id;return <div className="order-actions">
  {seller&&o.status==='REQUESTED'&&<button className="btn primary" onClick={()=>update(o.id,'ACCEPTED')}>Accept</button>}
  {seller&&o.status==='ACCEPTED'&&<button className="btn primary" onClick={()=>update(o.id,'READY')}>Mark ready</button>}
  {seller&&o.status==='READY'&&o.deliveryMethod==='DELIVERY'&&<button className="btn primary" onClick={()=>update(o.id,'OUT_FOR_DELIVERY')}>Send out</button>}
  {seller&&o.paymentStatus==='PENDING'&&o.paymentMethod==='CASH'&&['READY','OUT_FOR_DELIVERY'].includes(o.status)&&<button className="btn outline" onClick={()=>confirmCash(o.id)}>Confirm cash received</button>}
  {buyer&&o.status==='READY'&&o.deliveryMethod==='MEETUP'&&<button className="btn primary" onClick={()=>update(o.id,'COMPLETED')}>Confirm received</button>}
  {buyer&&o.status==='OUT_FOR_DELIVERY'&&<button className="btn primary" onClick={()=>update(o.id,'COMPLETED')}>Confirm received</button>}
  {['REQUESTED','ACCEPTED','READY','OUT_FOR_DELIVERY'].includes(o.status)&&<button className="btn outline" onClick={()=>update(o.id,'CANCELLED')}>Cancel</button>}
 </div>}
 return <><Header/><main className="container section"><div className="section-head"><div><span className="eyebrow">TRANSACTIONS</span><h1>My orders</h1><p className="muted">Track purchase requests, handover, delivery and payment.</p></div></div>{msg&&<div className="notice">{msg}</div>}{busy?<div className="empty">Loading orders…</div>:!orders.length?<div className="panel empty"><h2>No orders yet</h2><p className="muted">When you request an item, your transaction will appear here.</p><Link className="btn primary" href="/">Browse adverts</Link></div>:<div className="orders-list">{orders.map(o=><article className="order-card" key={o.id}><div className="order-thumb">{o.ad.images?.[0]?.url&&<img src={o.ad.images[0].url} alt=""/>}</div><div className="order-main"><Link href={'/ad/'+o.ad.id}><h2>{o.ad.title}</h2></Link><p>{o.quantity} × {money(o.ad.price)} · <b>{money(o.total)}</b></p><div className="order-meta"><span>{labels[o.status]||o.status}</span><span>{o.deliveryMethod==='DELIVERY'?'Delivery':'Meet seller'}</span><span>{o.paymentMethod==='MOBILE_MONEY'?'Mobile Money':'Cash'}</span><span>Payment: {o.paymentStatus}</span></div>{o.deliveryAddress&&<p className="muted">Delivery: {o.deliveryAddress}</p>}{o.buyerNote&&<p className="muted">Note: {o.buyerNote}</p>}<PaymentPanel order={o} onPaid={load}/></div>{actions(o)}</article>)}</div>}</main></>;
}
