'use client';
import {useState} from 'react';
import {api} from '../lib';
export default function SellerReviewForm({sellerId}:{sellerId:string}){
 const [rating,setRating]=useState(5),[comment,setComment]=useState(''),[msg,setMsg]=useState('');
 async function submit(e:any){e.preventDefault();if(!localStorage.getItem('minify_token')){location.href='/login';return}try{await api('/reviews',{method:'POST',body:JSON.stringify({sellerId,rating,comment})});setMsg('Thanks — your feedback was submitted.');setComment('')}catch(e:any){setMsg(e.message||'Could not submit feedback.')}}
 return <form className="review-form" onSubmit={submit}><h3>Rate this seller</h3><div className="stars">{[1,2,3,4,5].map(n=><button type="button" key={n} className={n<=rating?'star active':'star'} onClick={()=>setRating(n)}>★</button>)}</div><textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Share your experience (optional)" rows={3}/><button className="btn primary">Submit feedback</button>{msg&&<small className="muted">{msg}</small>}</form>
}
