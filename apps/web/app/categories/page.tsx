'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import {api} from '../lib';
import {ChevronRight} from 'lucide-react';
type C={id:string;name:string;slug:string;children?:C[]};
export default function Categories(){const [cats,setCats]=useState<C[]>([]);useEffect(()=>{api('/categories').then((x:any)=>setCats(Array.isArray(x)?x:[])).catch(()=>{})},[]);return <><Header/><main className="container section category-browser"><div className="eyebrow">MINIFY MARKET</div><h1>Browse categories</h1><p className="muted">Choose a main category, then narrow down to the exact type you want.</p><div className="browser-grid">{cats.map(root=><section className="browser-card" key={root.id}><Link href={'/ads?category='+encodeURIComponent(root.name)} className="browser-title"><strong>{root.name}</strong><ChevronRight size={18}/></Link><div className="browser-links">{(root.children||[]).slice(0,12).map(c=><Link key={c.id} href={'/ads?category='+encodeURIComponent(c.name)}>{c.name}{c.children?.length?<small>{c.children.length}</small>:null}</Link>)}</div>{(root.children||[]).length>12&&<Link className="browser-more" href={'/ads?category='+encodeURIComponent(root.name)}>View all {(root.children||[]).length} categories</Link>}</section>)}</div></main></>}
