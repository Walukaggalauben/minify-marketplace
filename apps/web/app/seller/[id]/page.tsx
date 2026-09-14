'use client';
import {useEffect,useState} from 'react';
import Header from '../../components/Header';
import {API,api,mediaUrl,money} from '../../lib';
import Link from 'next/link';
import {BadgeCheck,Star,MapPin,MessageCircle,Phone,ShieldCheck} from 'lucide-react';

export default function SellerPage({params}:{params:Promise<{id:string}>}){
 const [id,setId]=useState(''),[seller,setSeller]=useState<any>(null),[ads,setAds]=useState<any[]>([]),[reviews,setReviews]=useState<any[]>([]),[err,setErr]=useState('');
 useEffect(()=>{params.then(p=>setId(p.id))},[params]);
 useEffect(()=>{if(!id)return;Promise.all([fetch(`${API}/users/${id}`).then(r=>r.ok?r.json():null),api(`/ads?sellerId=${id}`).catch(()=>({items:[]})),api(`/reviews/seller/${id}`).catch(()=>[])]).then(([s,a,r])=>{setSeller(s);setAds(Array.isArray(a)?a:(a?.items||[]));setReviews(Array.isArray(r)?r:[])}).catch(e=>setErr(e.message))},[id]);
 const avg=reviews.length?reviews.reduce((x,r)=>x+Number(r.rating||0),0)/reviews.length:0;
 const stars=Math.max(0,Math.min(5,Math.round(avg)));
 async function chat(){const raw=localStorage.getItem('minify_user');if(!raw){location.href='/login?next=/seller/'+id;return}const u=JSON.parse(raw);if(u.id===id)return;const a=ads[0];if(!a){location.href='/messages';return}const c=await api('/chats/conversation',{method:'POST',body:JSON.stringify({adId:a.id,buyerId:u.id,sellerId:id})});location.href='/messages?conversation='+c.id}
 const canChat=ads.length>0&&seller?.id!==id;
 return <><Header/><main className="container section">{err&&<div className="notice">{err}</div>}
 {seller?<>
 <section className="seller-profile panel">
 <div className="seller-avatar">{seller.avatarUrl?<img src={mediaUrl(seller.avatarUrl)} alt=""/>:seller.name?.charAt(0).toUpperCase()}</div>
 <div className="seller-profile-info"><h1>{seller.name} {seller.verified&&<BadgeCheck size={21}/>}</h1>
 <p className="muted"><MapPin size={14}/> {seller.city||'Uganda'} · Member since {new Date(seller.createdAt).toLocaleDateString()}</p>
 <div className="rating"><Star size={17} fill="currentColor"/> {avg?avg.toFixed(1):'New'} {avg>0&&<span aria-label={`${stars} out of 5 stars`}>{'★'.repeat(stars)}{'☆'.repeat(5-stars)}</span>} <span className="muted">({reviews.length} reviews)</span></div></div>
 <div className="seller-contact-actions">{canChat&&<button className="btn primary" onClick={chat}><MessageCircle size={17}/> Chat seller</button>}{seller.phone&&<a className="btn outline" href={'tel:'+seller.phone}><Phone size={17}/> Call seller</a>}</div>
 </section>
 <div className="seller-trust"><span><ShieldCheck size={15}/> {seller.verified?'Verified seller':'Seller profile'}</span><span>✓ {ads.length} active advert{ads.length===1?'':'s'}</span><span>✓ {reviews.length} buyer review{reviews.length===1?'':'s'}</span></div>
 <section className="section"><div className="section-head"><div><span className="eyebrow">SELLER LISTINGS</span><h2>Active adverts</h2></div></div>
 {ads.length?<div className="grid">{ads.map(a=><Link className="listing" key={a.id} href={'/ad/'+a.id}><div className="listing-image"><img src={mediaUrl(a.images?.[0]?.url||'/logo-market.png')} alt=""/></div><div className="listing-body"><div className="price">UGX {Number(a.price).toLocaleString()}</div><b className="listing-title">{a.title}</b><span className="muted">{a.city||'Uganda'}</span></div></Link>)}</div>:<div className="empty">This seller has no active adverts right now.</div>}</section>
 <section className="panel"><h2>Buyer feedback</h2>{reviews.length?reviews.map(r=><article className="review" key={r.id}><div className="rating">{'★'.repeat(Number(r.rating))}{'☆'.repeat(5-Number(r.rating))}</div><b>{r.reviewer?.name||'Buyer'}</b><p className="muted">{r.comment||'No comment.'}</p></article>):<p className="muted">No feedback yet.</p>}</section>
 </>:<div className="empty">Loading seller profile...</div>}</main></>;
}
