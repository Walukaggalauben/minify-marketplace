'use client';
import {useState} from 'react';
import {api} from '../lib';
export default function VerificationRequest({status}:{status?:string}){
 const [s,setS]=useState(status||'UNVERIFIED'),[busy,setBusy]=useState(false);
 async function request(){setBusy(true);try{const r=await api('/users/me/verification',{method:'POST'});setS(r.verificationStatus)}catch{}finally{setBusy(false)}}
 if(s==='VERIFIED')return <span className="verified-badge">✓ Verified seller</span>;
 if(s==='PENDING')return <span className="pending-badge">Verification pending</span>;
 return <button className="btn outline" onClick={request} disabled={busy}>{busy?'Requesting…':'Request seller verification'}</button>;
}
