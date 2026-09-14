'use client';
import {useState} from 'react';
import Header from '../components/Header';
import {api} from '../lib';

export default function ForgotPassword(){
 const [email,setEmail]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false),[link,setLink]=useState('');
 async function submit(e:any){e.preventDefault();setBusy(true);setMsg('');setLink('');try{const r=await api('/auth/forgot-password',{method:'POST',body:JSON.stringify({email:email.trim()})});setMsg(r.message||'If an account exists, reset instructions have been sent.');if(r.resetUrl)setLink(r.resetUrl)}catch(e:any){setMsg(e.message||'Unable to process your request.')}finally{setBusy(false)}}
 return <><Header/><main className="container section"><section className="panel auth-panel"><span className="eyebrow">ACCOUNT RECOVERY</span><h1>Forgot your password?</h1><p className="muted">Enter your email and we’ll help you create a new password.</p><form className="auth-form" onSubmit={submit}><label>Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><button className="btn primary" disabled={busy}>{busy?'Sending…':'Send reset instructions'}</button></form>{msg&&<div className="notice">{msg}</div>}{link&&<div className="notice"><b>Development reset link</b><br/><a href={link}>{link}</a></div>}<p className="muted auth-switch"><a href="/login">Back to sign in</a></p></section></main></>;
}
