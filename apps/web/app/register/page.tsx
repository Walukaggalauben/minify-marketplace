'use client';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import Header from '../components/Header';
import { api } from '../lib';

export default function Register(){
 const [f,setF]=useState({name:'',email:'',phone:'',password:''}),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e:any){e.preventDefault();setBusy(true);setMsg('');try{const r=await api('/auth/register',{method:'POST',body:JSON.stringify(f)});localStorage.setItem('minify_token',r.accessToken||r.token);localStorage.setItem('minify_user',JSON.stringify(r.user));location.href='/dashboard'}catch(e:any){setMsg(e.message)}finally{setBusy(false)}}
 return <><Header/><main className="container section"><div className="panel auth-panel"><div className="auth-icon"><UserPlus size={30}/></div><span className="eyebrow">JOIN MINIFY MARKET</span><h1>Create your account</h1><p className="muted">Buy, save favourites, chat with sellers and post your own adverts.</p><form className="form" onSubmit={submit}><input required placeholder="Full name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/><input required type="email" placeholder="Email address" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/><input required pattern="[+0-9][0-9\s-]{6,29}" placeholder="Phone number (e.g. 0772 123 456)" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/><input required minLength={8} type="password" placeholder="Password (8+ characters)" value={f.password} onChange={e=>setF({...f,password:e.target.value})}/><button className="btn primary" disabled={busy}>{busy?'Creating account…':'Create account'}</button>{msg&&<p>{msg}</p>}</form><p className="muted auth-switch">Already have an account? <a href="/login">Sign in</a></p></div></main></>;
}