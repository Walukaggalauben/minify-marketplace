'use client';
import {useEffect,useState} from 'react';
import {api} from '../lib';

export default function SellerTrial(){
 const [s,setS]=useState<any>(null);
 useEffect(()=>{api('/subscriptions/me').then(setS).catch(()=>{})},[]);
 if(!s?.active)return null;
 return <div className="trial-banner"><div><b>MINIFY MARKET Seller Trial</b><span>Free launch access for 6 months. Post adverts, chat with buyers and sell without subscription fees.</span></div><strong>{s.trialDaysRemaining} days remaining</strong></div>;
}
