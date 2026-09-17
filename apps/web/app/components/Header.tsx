'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import Image from 'next/image';
import {Search,Heart,MessageCircle,UserCircle,Plus,Bell,Grid2X2,BriefcaseBusiness,CircleHelp,Globe2} from 'lucide-react';
import {api} from '../lib';
import {languages,useLanguage} from '../i18n';

export default function Header(){
 const [q,setQ]=useState(''),[user,setUser]=useState<any>(null),[unread,setUnread]=useState(0),[noticeUnread,setNoticeUnread]=useState(0),[languageOpen,setLanguageOpen]=useState(false);
 const {language,setLanguage,t}=useLanguage();
 useEffect(()=>{const raw=localStorage.getItem('minify_user');if(!raw)return;try{const u=JSON.parse(raw);setUser(u);const refresh=()=>{api('/chats/unread-count').then((x:any)=>setUnread(Number(x.count)||0)).catch(()=>{});api('/notifications/unread-count').then((x:any)=>setNoticeUnread(Number(x.count)||0)).catch(()=>{})};refresh();const timer=window.setInterval(refresh,30000);window.addEventListener('focus',refresh);return()=>{window.clearInterval(timer);window.removeEventListener('focus',refresh)}}catch{}},[]);
 function submit(e:React.FormEvent){e.preventDefault();const v=q.trim();location.href=v?'/ads?q='+encodeURIComponent(v):'/ads'}
 const current=languages.find(x=>x.code===language)?.native||'English';
 return <header className="header">
  <div className="container nav-main">
   <Link href="/" className="brand market-brand" aria-label="MINIFY MARKET home"><span className="market-mark"><Image src="/minify-market-official.png" alt="MINIFY MARKET" width={181} height={58} className="market-mark-image" priority/></span><span className="market-wordmark"><b>MINIFY</b><strong>MARKET</strong></span></Link>
   <form className="search" onSubmit={submit}><Search size={19}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={t('searchPlaceholder')}/><button type="submit" className="search-btn">{t('search')}</button></form>
   <div className="nav-primary-actions"><div className="language-menu"><button type="button" className="language-btn" onClick={()=>setLanguageOpen(v=>!v)}><Globe2 size={16}/><span>{current}</span></button>{languageOpen&&<div className="language-popover">{languages.map(item=><button key={item.code} type="button" className={item.code===language?'active':''} onClick={()=>{setLanguage(item.code);setLanguageOpen(false)}}>{item.native}</button>)}</div>}</div>{user?<Link href="/account" className="nav-link primary-account"><UserCircle size={20}/><span>{t('account')}</span></Link>:<Link href="/login" className="nav-link primary-account"><UserCircle size={20}/><span>{t('signIn')||'Sign in'}</span></Link>}<Link className="sell-btn" href="/sell"><Plus size={18}/><span>{t('sell')}</span></Link></div>
  </div>
  <div className="nav-secondary"><div className="container nav-secondary-inner">
   <Link href="/marketplace" className="nav-link browse-link"><span className="nav-dot"/>{t('browse')}</Link>
   <nav className="nav-actions">
    <Link href="/categories" className="nav-link"><Grid2X2 size={17}/><span>{t('categories')}</span></Link><Link href="/jobs" className="nav-link"><BriefcaseBusiness size={17}/><span>{t('jobs')}</span></Link><Link href={user?'/favorites':'/login?next=/favorites'} className="nav-link"><Heart size={18}/><span>{t('saved')}</span></Link>
    {user&&<Link href="/saved-searches" className="nav-link"><Search size={18}/><span>Searches</span></Link>}{user&&<Link href="/messages" className="nav-link message-link"><MessageCircle size={18}/><span>{t('messages')}</span>{unread>0&&<i className="unread-badge">{unread>99?'99+':unread}</i>}</Link>}{user&&<Link href="/notifications" className="nav-link message-link"><Bell size={18}/><span>Alerts</span>{noticeUnread>0&&<i className="unread-badge">{noticeUnread>99?'99+':noticeUnread}</i>}</Link>}
    <Link href="/help" className="nav-link"><CircleHelp size={17}/><span>{t('help')}</span></Link>
   </nav>
  </div></div>
 </header>
}
