'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import Image from 'next/image';
import {Search,Heart,MessageCircle,UserCircle,Plus,Bell} from 'lucide-react';
import {api} from '../lib';
export default function Header(){
 const [q,setQ]=useState(''),[user,setUser]=useState<any>(null),[unread,setUnread]=useState(0),[noticeUnread,setNoticeUnread]=useState(0);
 useEffect(()=>{const raw=localStorage.getItem('minify_user');if(!raw)return;try{const u=JSON.parse(raw);setUser(u);const refresh=()=>{api('/chats/unread-count').then((x:any)=>setUnread(Number(x.count)||0)).catch(()=>{});api('/notifications/unread-count').then((x:any)=>setNoticeUnread(Number(x.count)||0)).catch(()=>{})};refresh();const timer=window.setInterval(refresh,30000);window.addEventListener('focus',refresh);return()=>{window.clearInterval(timer);window.removeEventListener('focus',refresh)}}catch{}},[]);
 function submit(e:React.FormEvent){e.preventDefault();location.href='/?q='+encodeURIComponent(q.trim())}
 return <header className="header"><div className="container nav">
  <Link href="/" className="brand" aria-label="MINIFY MARKET home"><span className="brand-logo-wrap"><Image src="/logo-market.png" alt="MINIFY GADGETS" width={181} height={65} className="brand-logo" priority/></span><span className="market-label">MARKET</span></Link>
  <form className="search" onSubmit={submit}><Search size={19}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search phones, laptops, TVs & more"/><button className="search-btn">Search</button></form>
  <nav className="nav-actions">{user&&<Link href="/account" className="nav-link"><UserCircle size={20}/><span>Account</span></Link>}<Link href={user?'/favorites':'/login?next=/favorites'} className="nav-link hide-mobile"><Heart size={20}/><span>Saved</span></Link>{user&&<Link href="/saved-searches" className="nav-link hide-mobile"><Search size={20}/><span>Searches</span></Link>}{user&&<Link href="/messages" className="nav-link message-link"><MessageCircle size={20}/><span>Messages</span>{unread>0&&<i className="unread-badge">{unread>99?'99+':unread}</i>}</Link>}{user&&<Link href="/notifications" className="nav-link message-link"><Bell size={20}/><span>Alerts</span>{noticeUnread>0&&<i className="unread-badge">{noticeUnread>99?'99+':noticeUnread}</i>}</Link>}{!user&&<Link href="/login" className="nav-link">Sign in</Link>}<Link className="sell-btn" href="/sell"><Plus size={18}/><span>Sell</span></Link></nav>
 </div></header>
}
