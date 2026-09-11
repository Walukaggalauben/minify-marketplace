'use client';
import {useState} from 'react';
import {Bell,Bookmark} from 'lucide-react';
import {api} from '../lib';

type Props={params:Record<string,string|undefined>};
export default function SaveSearch({params}:Props){
 const [busy,setBusy]=useState(false),[done,setDone]=useState(false),[msg,setMsg]=useState('');
 async function save(){
  const token=localStorage.getItem('minify_token');
  if(!token){location.href='/login?next='+encodeURIComponent(location.pathname+location.search);return;}
  setBusy(true);setMsg('');
  try{
   const query=String(params.q||'').trim();
   const name=query?`Search: ${query}`:(params.city?`Gadgets in ${params.city}`:'Marketplace search');
   await api('/saved-searches',{method:'POST',body:JSON.stringify({...params,name})});
   setDone(true);setMsg('Search saved. You will find it under Searches.');
  }catch(e:any){setMsg(e.message||'Could not save this search.')}finally{setBusy(false)}
 }
 return <div className="save-search"><button className="btn outline" onClick={save} disabled={busy||done}>{done?<Bookmark size={16}/>:<Bell size={16}/>} {done?'Search saved':'Save this search'}</button>{msg&&<span className="save-search-msg">{msg}</span>}</div>;
}

