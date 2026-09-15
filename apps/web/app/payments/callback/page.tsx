'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import {api} from '../../lib';

export default function PaymentCallback(){
 const [state,setState]=useState('checking');
 useEffect(()=>{
  const params=new URLSearchParams(location.search);const status=params.get('status');const ref=params.get('tx_ref');
  if(status==='cancelled'||status==='failed'){setState('failed');return;}
  if(!ref){setState('pending');return;}
  const token=localStorage.getItem('minify_token');if(!token){setState('pending');return;}
  let attempts=0;
  const check=async()=>{
   try{
    const payment=await api(`/payments/reference/${encodeURIComponent(ref)}`);
    if(payment?.paymentStatus==='PAID'){setState('paid');return;}
   }catch{}
   attempts+=1;
   if(attempts<6)setTimeout(check,2500);else setState('pending');
  };
  check(); },[]);
 return <><Header/><main className="container section"><div className="panel payment-result">
  {state==='checking'&&<><span className="eyebrow">PAYMENT</span><h1>Confirming your payment…</h1><p className="muted">We are checking the secure payment result. Please keep this page open.</p></>}
  {state==='paid'&&<><span className="eyebrow">PAYMENT CONFIRMED</span><h1>Payment successful</h1><p className="muted">Your payment has been verified. Your order is now recorded as paid.</p><Link className="btn primary" href="/orders">View my order</Link></>}
  {state==='failed'&&<><span className="eyebrow">PAYMENT NOT COMPLETED</span><h1>Payment was not completed</h1><p className="muted">No money is marked as received until Flutterwave verification succeeds.</p><Link className="btn outline" href="/orders">Return to orders</Link></>}
  {state==='pending'&&<><span className="eyebrow">PAYMENT PROCESSING</span><h1>Payment is still processing</h1><p className="muted">If you approved Mobile Money, the payment may still be reaching us. Your order will only be marked paid after server-side verification.</p><Link className="btn primary" href="/orders">Check my orders</Link></>}
 </div></main></>;
}
