'use client';
import {useEffect,useState} from 'react';
import Header from '../components/Header';
import VerificationRequest from '../components/VerificationRequest';
import {api} from '../lib';
export default function Verification(){const[u,setU]=useState<any>(null);useEffect(()=>{const x=localStorage.getItem('minify_user');if(!x){location.href='/login';return}api('/users/me/profile').then(setU).catch(()=>{})},[]);return <><Header/><main className="container section"><div className="panel auth-panel"><span className="eyebrow">SELLER TRUST</span><h1>Seller verification</h1><p className="muted">Verified sellers give buyers more confidence when choosing an advert.</p>{u&&<div className="verification-card"><b>{u.name}</b><span>{u.email}</span><span>{u.phone}</span><span>Status: {u.verificationStatus}</span><VerificationRequest status={u.verificationStatus}/></div>}<p className="muted">Verification is reviewed by MINIFY MARKET administrators. Do not upload sensitive documents until the verification workflow is enabled by an administrator.</p></div></main></>}
