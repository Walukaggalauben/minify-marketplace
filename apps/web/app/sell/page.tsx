'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import ImageUploader from '../components/ImageUploader';
import { API, api } from '../lib';

type Category={id:string;name:string;slug:string;parentId:string|null;children?:Category[]};

export default function Sell(){
 const [cats,setCats]=useState<Category[]>([]),[user,setUser]=useState<any>(null),[files,setFiles]=useState<File[]>([]);
 const [f,setF]=useState<any>({condition:'USED',city:'Kampala',negotiable:true}),[rootId,setRootId]=useState(''),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{api('/categories').then((x:any)=>setCats(Array.isArray(x)?x:[])).catch(()=>{});const u=localStorage.getItem('minify_user');if(u)setUser(JSON.parse(u));},[]);
 const root=cats.find(c=>c.id===rootId);const children=root?.children||[];
 const selectedCategory=cats.flatMap(c=>[c,...(c.children||[])]).find(c=>c.id===f.categoryId);
 const categoryLabel=selectedCategory?.name||'';
 const titlePlaceholder=categoryLabel?`e.g. ${categoryLabel==='Cars'?'Toyota Premio 2018':categoryLabel==='Laptops & Computers'?'Dell Latitude 5420':categoryLabel==='Furniture'?'6-Seater Sofa Set':categoryLabel==='Jobs'?'Experienced Accountant':categoryLabel==='Services'?'Professional Computer Repair Service':'Describe what you are offering'}`:'e.g. iPhone 15 Pro, Toyota Premio, Sofa Set, Laptop, House for Rent';
 const set=(key:string,value:any)=>setF((x:any)=>({...x,[key]:value}));
 const chooseRoot=(id:string)=>{setRootId(id);set('categoryId','');};
 async function uploadImages(){if(!files.length)return [];const token=localStorage.getItem('minify_token')||'';const form=new FormData();files.forEach(file=>form.append('images',file));const r=await fetch(`${API}/uploads/images`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:form});if(!r.ok)throw new Error(await r.text());return (await r.json()).images||[];}
 async function submit(e:FormEvent){e.preventDefault();if(!user){location.href='/login?next=/sell';return;}if(root?.children?.length&&!f.categoryId){setMsg('Choose a subcategory so buyers can find your advert.');return;}setBusy(true);setMsg('');
  try{if(user.role==='BUYER'){const upgraded=await api('/auth/become-seller',{method:'POST'});localStorage.setItem('minify_token',upgraded.token);localStorage.setItem('minify_user',JSON.stringify(upgraded.user));setUser(upgraded.user);}
   const imageUrls=await uploadImages();const a=await api('/ads',{method:'POST',body:JSON.stringify({...f,price:Number(f.price),negotiable:Boolean(f.negotiable),images:imageUrls})});await api('/ads/'+a.id+'/publish',{method:'POST'});setMsg('Advert submitted for review. We will make it visible after moderation.');setF({condition:'USED',city:'Kampala',negotiable:true});setRootId('');setFiles([]);
  }catch(err:any){setMsg(err.message||'Could not submit advert.');}finally{setBusy(false);}
 }
 const qualityTitle=String(f.title||'').trim().split(/\s+/).filter(Boolean).length>=2;
 const qualityDescription=String(f.description||'').trim().length>=30;
 return <><Header/><main className="container section"><div className="panel sell-panel"><div className="eyebrow">SELL ON MINIFY MARKET</div><h1>Post an advert</h1><p className="muted">Sell products, vehicles, property, services, jobs and more. Choose the category that best matches what you are offering.</p>
 <div className="sell-category-note"><b>Marketplace selling</b><span>One advert flow for every category — not just phones.</span></div>
 <form className="form" onSubmit={submit}>
  <label>What are you offering?<input required value={f.title||''} placeholder={titlePlaceholder} onChange={e=>set('title',e.target.value)}/></label>
  <div className="form-grid"><label>Main category<select required value={rootId} onChange={e=>chooseRoot(e.target.value)}><option value="">Choose a category</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
  <label>Subcategory<select required={Boolean(root?.children?.length)} disabled={!rootId||!children.length} value={f.categoryId||''} onChange={e=>set('categoryId',e.target.value)}><option value="">{rootId?(children.length?'Choose a subcategory':'This category has no subcategories'):'Choose a main category first'}</option>{children.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>
  {categoryLabel&&<div className="sell-category-selected">Selected: <b>{root?.name}</b>{children.length?' → ':''}{children.length?categoryLabel:''}</div>}
  <div className="form-grid"><label>Price (UGX)<input required min="0" type="number" value={f.price||''} onChange={e=>set('price',e.target.value)}/></label><label>Condition<select value={f.condition} onChange={e=>set('condition',e.target.value)}><option value="NEW">Brand new</option><option value="USED">Used</option><option value="REFURBISHED">Refurbished</option></select></label></div>
  <div className="form-grid"><label>City<input required value={f.city} onChange={e=>set('city',e.target.value)}/></label><label>Area / location<input value={f.location||''} placeholder="e.g. Downtown Kampala" onChange={e=>set('location',e.target.value)}/></label></div>
  <label>Photos <span className="muted">(up to 8, 8MB each)</span></label><ImageUploader files={files} setFiles={setFiles}/>
  <div className="listing-quality"><b>Listing quality checklist</b><span className={files.length?'ok':''}>{files.length?'✓':'○'} Add at least one clear photo</span><span className={qualityTitle?'ok':''}>{qualityTitle?'✓':'○'} Clear advert title</span><span className={qualityDescription?'ok':''}>{qualityDescription?'✓':'○'} Useful description</span><span className={Number(f.price)>0?'ok':''}>{Number(f.price)>0?'✓':'○'} Valid asking price</span></div>
  {files.length>0&&<div className="upload-list">{files.map((x,i)=><span key={i}>{x.name}</span>)}</div>}
  <label>Description<textarea required rows={7} value={f.description||''} placeholder="Describe what you are offering, its condition or key details, what is included, and anything a buyer should know." onChange={e=>set('description',e.target.value)}/></label>
  <label className="check-row"><input type="checkbox" checked={Boolean(f.negotiable)} onChange={e=>set('negotiable',e.target.checked)}/> Price is negotiable</label>
  <button className="btn primary" disabled={busy}>{busy?'Submitting…':'Submit for review'}</button>{msg&&<div className="notice">{msg}</div>}
 </form></div></main></>;
}
