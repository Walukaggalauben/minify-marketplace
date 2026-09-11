'use client';
import { FormEvent, useEffect, useState } from 'react';
import Header from '../components/Header';
import ImageUploader from '../components/ImageUploader';
import { API, api } from '../lib';

export default function Sell(){
 const [cats,setCats]=useState<any[]>([]),[user,setUser]=useState<any>(null),[files,setFiles]=useState<File[]>([]);
 const [f,setF]=useState<any>({condition:'USED',city:'Kampala',negotiable:true}),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{api('/categories').then(setCats).catch(()=>{});const u=localStorage.getItem('minify_user');if(u)setUser(JSON.parse(u));},[]);
 const set=(key:string,value:any)=>setF((x:any)=>({...x,[key]:value}));
 async function uploadImages(){
  if(!files.length)return [];
  const token=localStorage.getItem('minify_token')||'';const form=new FormData();files.forEach(file=>form.append('images',file));
  const r=await fetch(`${API}/uploads/images`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:form});
  if(!r.ok)throw new Error(await r.text());return (await r.json()).images||[];
 }
 async function submit(e:FormEvent){
  e.preventDefault();if(!user){location.href='/login?next=/sell';return;}setBusy(true);setMsg('');
  try{
   if(user.role==='BUYER'){
    const upgraded=await api('/auth/become-seller',{method:'POST'});
    localStorage.setItem('minify_token',upgraded.token);localStorage.setItem('minify_user',JSON.stringify(upgraded.user));setUser(upgraded.user);
   }
   const imageUrls=await uploadImages();const a=await api('/ads',{method:'POST',body:JSON.stringify({...f,price:Number(f.price),negotiable:Boolean(f.negotiable),images:imageUrls})});await api('/ads/'+a.id+'/publish',{method:'POST'});setMsg('Advert submitted for review. We will make it visible after moderation.');setF({condition:'USED',city:'Kampala',negotiable:true});setFiles([]);}
  catch(err:any){setMsg(err.message||'Could not submit advert.');}finally{setBusy(false);}
 }
 const flat=cats.flatMap(c=>[c,...(c.children||[])]);
 return <><Header/><main className="container section"><div className="panel sell-panel"><div className="eyebrow">SELL ON MINIFY MARKET</div><h1>Post an advert</h1><p className="muted">Use clear photos and accurate details. Your advert will be reviewed before it goes live.</p>
 <form className="form" onSubmit={submit}>
  <label>Title<input required value={f.title||''} placeholder="e.g. iPhone 15 Pro 256GB" onChange={e=>set('title',e.target.value)}/></label>
  <label>Category<select required value={f.categoryId||''} onChange={e=>set('categoryId',e.target.value)}><option value="">Choose category</option>{flat.map(c=><option key={c.id} value={c.id}>{c.parentId?'↳ ':''}{c.name}</option>)}</select></label>
  <div className="form-grid"><label>Price (UGX)<input required min="0" type="number" value={f.price||''} onChange={e=>set('price',e.target.value)}/></label><label>Condition<select value={f.condition} onChange={e=>set('condition',e.target.value)}><option>NEW</option><option>USED</option><option>REFURBISHED</option></select></label></div>
  <div className="form-grid"><label>City<input required value={f.city} onChange={e=>set('city',e.target.value)}/></label><label>Area / location<input value={f.location||''} placeholder="e.g. Downtown Kampala" onChange={e=>set('location',e.target.value)}/></label></div>
  <label>Photos <span className="muted">(up to 8, 8MB each)</span></label><ImageUploader files={files} setFiles={setFiles}/>
  <div className="listing-quality"><b>Listing quality checklist</b><span className={files.length?'ok':''}>{files.length?'✓':'○'} At least one real product photo</span><span className={String(f.title||'').trim().split(/\s+/).length>=2?'ok':''}>{String(f.title||'').trim().split(/\s+/).length>=2?'✓':'○'} Clear product title</span><span className={String(f.description||'').trim().length>=30?'ok':''}>{String(f.description||'').trim().length>=30?'✓':'○'} Useful product description</span><span className={Number(f.price)>0?'ok':''}>{Number(f.price)>0?'✓':'○'} Valid asking price</span></div>
  {files.length>0&&<div className="upload-list">{files.map((x,i)=><span key={i}>{x.name}</span>)}</div>}
  <label>Description<textarea required rows={7} value={f.description||''} placeholder="Describe the item, condition, included accessories and important details." onChange={e=>set('description',e.target.value)}/></label>
  <label className="check-row"><input type="checkbox" checked={Boolean(f.negotiable)} onChange={e=>set('negotiable',e.target.checked)}/> Price is negotiable</label>
  <button className="btn primary" disabled={busy}>{busy?'Submitting…':'Submit for review'}</button>{msg&&<div className="notice">{msg}</div>}
 </form></div></main></>;
}
