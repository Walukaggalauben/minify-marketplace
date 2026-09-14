'use client';
import {useEffect,useState} from 'react';
import Header from '../components/Header';
import {api} from '../lib';

export default function ResetPassword(){
 const [token,setToken]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(false);
 useEffect(()=>{setToken(new URLSearchParams(location.search).get('token')||'')},[]);
 async function submit(e:any){e.preventDefault();if(!token){setMsg('This reset link is missing or invalid.');return}if(password!==confirm){setMsg('Passwords do not match.');return}if(password.length<8){setMsg('Password must be at least 8 characters.');return}setBusy(true);setMsg('');try{await api('/auth/reset-password',{method:'POST',body:JSON.stringify({token,password})});setDone(true);setMsg('Password changed successfully. You can now sign in.')}catch(e:any){setMsg(e.message||'This reset link is invalid or expired.')}finally{setBusy(false)}}
 return <><Header/><main className="container section"><section className="panel auth-panel"><span className="eyebrow">ACCOUNT RECOVERY</span><h1>Create a new password</h1>{done?<><div className="notice">{msg}</div><a className="btn primary" href="/login">Sign in</a></>:<form className="auth-form" onSubmit={submit}><label>New password<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label><label>Confirm password<input type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat your password"/></label><button className="btn primary" disabled={busy||!token}>{busy?'Updating…':'Reset password'}</button>{msg&&<div className="notice">{msg}</div>}</form>}<p className="muted auth-switch"><a href="/login">Back to sign in</a></p></section></main></>;
}
