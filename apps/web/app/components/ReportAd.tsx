'use client';
import {useState} from 'react';
import {api} from '../lib';
export default function ReportAd({adId}:{adId:string}){
 const [open,setOpen]=useState(false),[reason,setReason]=useState('Fraud or scam'),[details,setDetails]=useState(''),[msg,setMsg]=useState('');
 async function submit(e:any){e.preventDefault();if(!localStorage.getItem('minify_token')){location.href='/login';return}try{await api('/reports',{method:'POST',body:JSON.stringify({adId,reason,details})});setMsg('Report submitted. Thank you.');setOpen(false)}catch(e:any){setMsg(e.message||'Could not submit report.')}}
 return <div className="report-box"><button className="report-link" onClick={()=>setOpen(!open)}>Report this advert</button>{open&&<form className="report-form" onSubmit={submit}><select value={reason} onChange={e=>setReason(e.target.value)}><option>Fraud or scam</option><option>Prohibited item</option><option>Wrong information</option><option>Duplicate advert</option><option>Other</option></select><textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Tell us what is wrong" rows={3}/><button className="btn primary">Submit report</button></form>}{msg&&<small className="muted">{msg}</small>}</div>
}
