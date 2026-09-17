'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, HelpCircle, BriefcaseBusiness, Grid2X2, Search, UserCircle, Plus } from 'lucide-react';

export default function Header(){
 const [q,setQ]=useState('');
 const submit=(e:React.FormEvent)=>{e.preventDefault();const v=q.trim();location.href=v?'/ads?'+new URLSearchParams({q:v}).toString():'/ads'};
 return <header className="header">
  <div className="container nav-main">
   <Link href="/" className="brand-logo-wrap" aria-label="MINIFY MARKET home"><img src="/minify-market-official.png" className="brand-logo" alt="MINIFY MARKET"/></Link>
   <form className="search header-search" onSubmit={submit}><Search size={19}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search phones, laptops, TVs & more"/><button className="search-btn" type="submit">Search</button></form>
   <div className="nav-actions"><Link className="nav-link" href="/login"><UserCircle size={17}/><span>Sign in</span></Link><Link className="sell-btn" href="/sell"><Plus size={18}/><span>Sell</span></Link></div>
  </div>
  <nav className="market-nav container" aria-label="Marketplace navigation">
   <Link href="/ads" className="browse-link">Browse marketplace</Link>
   <div className="market-nav-links"><Link href="/categories"><Grid2X2 size={16}/> Categories</Link><Link href="/jobs"><BriefcaseBusiness size={16}/> Jobs & CVs</Link><Link href="/favorites"><Heart size={16}/> Saved</Link><Link href="/help"><HelpCircle size={16}/> Help & support</Link></div>
  </nav>
 </header>;
}
