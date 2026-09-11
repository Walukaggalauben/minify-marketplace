'use client';
import { FormEvent,useEffect,useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/Header';
import ImageUploader from '../../components/ImageUploader';
import { api,API,mediaUrl } from '../../lib';
import PromotionPanel from '../../components/PromotionPanel';

export default function EditAdvert(){
 const {id}=useParams<{id:string}>(); const [f,setF]=useState<any>(null); const [cats,setCats]=useState<any[]>([]); const [newFiles,setNewFiles]=useState<File[]>([]); const [msg,setMsg]=useState(''); const [busy,setBusy]=useState(false);
 useEffect(()=>{api('/ads/manage/'+id).then((a:any)=>{const u=JSON.parse(localStorage.getItem('minify_user')||'null');if(!u||u.id!==a.seller?.id){location.href='/dashboard';return}setF({...a,categoryId:a.category?.id||a.categoryId})}).catch(()=>location.href='/dashboard');api('/categories').then(setCats).catch(()=>{})},[id]);
 const set=(k:string,v:any)=>setF((x:any)=>({...x,[k]:v}));
 async function uploadImages(files:File[]){
  if(!files.length)return [];
  const token=localStorage.getItem('minify_token')||'';const form=new FormData();files.slice(0,8).forEach(file=>form.append('images',file));
  const r=await fetch(`${API}/uploads/images`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:form});
  if(!r.ok)throw new Error(await r.text());return (await r.json()).images||[];
 }
 async function removeImage(imageId:string){if(!confirm('Remove this photo?'))return;try{setBusy(true);await api('/ads/images/'+imageId,{method:'DELETE'});const fresh=await api('/ads/manage/'+id);setF({...fresh,categoryId:fresh.category?.id||fresh.categoryId});setMsg('Photo removed.')}catch(err:any){setMsg(err.message||'Could not remove photo.')}finally{setBusy(false)}}
 async function save(e:FormEvent){e.preventDefault();setBusy(true);setMsg('');try{await api('/ads/'+id,{method:'PATCH',body:JSON.stringify({title:f.title,categoryId:f.categoryId,price:Number(f.price),condition:f.condition,city:f.city,location:f.location,description:f.description,negotiable:Boolean(f.negotiable)})});setMsg('Advert updated successfully.')}catch(e:any){setMsg(e.message||'Could not update advert.')}finally{setBusy(false)}}
 if(!f)return <><Header/><main className="container section"><div className="empty">Loading advert…</div></main></>;
 const flat=cats.flatMap(c=>[c,...(c.children||[])]);
 const images=f.images||[];
 return <><Header/><main className="container section"><div className="panel sell-panel"><div className="eyebrow">SELLER CENTER</div><h1>Edit advert</h1><p className="muted">Update the details of your listing. Changes are saved to your advert.</p>
 <form className="form" onSubmit={save}><label>Title<input required value={f.title||''} onChange={e=>set('title',e.target.value)}/></label><label>Category<select required value={f.categoryId||''} onChange={e=>set('categoryId',e.target.value)}><option value="">Choose category</option>{flat.map(c=><option key={c.id} value={c.id}>{c.parentId?'↳ ':''}{c.name}</option>)}</select></label>
 <div className="form-grid"><label>Price (UGX)<input required min="0" type="number" value={f.price||''} onChange={e=>set('price',e.target.value)}/></label><label>Condition<select value={f.condition} onChange={e=>set('condition',e.target.value)}><option>NEW</option><option>USED</option><option>REFURBISHED</option></select></label></div>
 <div className="form-grid"><label>City<input required value={f.city||''} onChange={e=>set('city',e.target.value)}/></label><label>Area / location<input value={f.location||''} onChange={e=>set('location',e.target.value)}/></label></div>
 <label>Photos <span className="muted">({images.length}/8)</span></label>
 {images.length>0&&<div className="ad-gallery">{images.map((im:any,i:number)=><div className="seller-photo" key={im.id||i}><img className={i?'ad-gallery-small':'adimg'} src={mediaUrl(im.url||im)} alt={f.title}/><button type="button" className="btn danger photo-remove" disabled={busy} onClick={()=>im.id&&removeImage(im.id)}>Remove</button></div>)}</div>}<ImageUploader files={newFiles} setFiles={setNewFiles}/><button type="button" className="btn outline" disabled={busy||!newFiles.length} onClick={async()=>{try{setBusy(true);const urls=await uploadImages(newFiles);if(urls.length){await api('/ads/'+id,{method:'PATCH',body:JSON.stringify({images:[...(f.images||[]).map((x:any)=>x.url||x),...urls]})});const fresh=await api('/ads/manage/'+id);setF({...fresh,categoryId:fresh.category?.id||fresh.categoryId});setNewFiles([]);setMsg(`${urls.length} photo${urls.length===1?'':'s'} added.`)}}catch(err:any){setMsg(err.message||'Could not upload photos.')}finally{setBusy(false)}}}>Add selected photos</button>
 <label>Description<textarea required rows={8} value={f.description||''} onChange={e=>set('description',e.target.value)}/></label><label className="check-row"><input type="checkbox" checked={Boolean(f.negotiable)} onChange={e=>set('negotiable',e.target.checked)}/> Price is negotiable</label><button className="btn primary" disabled={busy}>{busy?'Saving…':'Save changes'}</button>{msg&&<div className="notice">{msg}</div>}</form></div><div style={{height:24}}/>{f.status==='ACTIVE'&&<PromotionPanel ad={f}/>}</main></>;
}
