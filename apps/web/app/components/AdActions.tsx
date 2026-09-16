'use client';
import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Phone, Share2 } from 'lucide-react';
import { api } from '../lib';

export default function AdActions({adId,sellerId,sellerPhone}:{adId:string;sellerId:string;sellerPhone?:string}){
 const [user,setUser]=useState<any>(null),[saved,setSaved]=useState(false),[busy,setBusy]=useState(false);
 useEffect(()=>{const raw=localStorage.getItem('minify_user');if(!raw)return;const u=JSON.parse(raw);setUser(u);api('/favorites/'+u.id).then((x:any[])=>setSaved(x.some(f=>f.adId===adId))).catch(()=>{})},[adId]);
 async function favorite(){if(!user){location.href='/login?next=/ad/'+adId;return}setBusy(true);try{if(saved){await api('/favorites/'+user.id+'/'+adId,{method:'DELETE'});setSaved(false)}else{await api('/favorites',{method:'POST',body:JSON.stringify({userId:user.id,adId})});setSaved(true)}}finally{setBusy(false)}}
 async function chat(){if(!user){location.href='/login?next=/ad/'+adId;return}if(user.id===sellerId)return;const c=await api('/chats/conversation',{method:'POST',body:JSON.stringify({adId,buyerId:user.id,sellerId})});location.href='/messages?conversation='+c.id}
 async function share(){const url=location.href;try{if(navigator.share)await navigator.share({title:document.title,text:'View this advert on MINIFY MARKET',url});else{await navigator.clipboard.writeText(url);alert('Advert link copied.')}}catch(e:any){if(e?.name!=='AbortError')alert('Could not share this advert.')}}
 return <div className="ad-actions"><button className="btn primary" onClick={chat} disabled={user?.id===sellerId}><MessageCircle size={17}/> {user?.id===sellerId?'Your advert':'Chat with seller'}</button>{sellerPhone&&user?.id!==sellerId&&<a className="btn outline" href={'tel:'+sellerPhone}><Phone size={17}/> Call seller</a>}<button className="btn outline" onClick={favorite} disabled={busy}><Heart size={17} fill={saved?'currentColor':'none'}/> {saved?'Saved':'Save'}</button><button className="btn outline" onClick={share}><Share2 size={17}/> Share</button></div>;
}