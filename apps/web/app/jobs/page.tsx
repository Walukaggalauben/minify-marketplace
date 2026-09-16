'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import {api,mediaUrl,money} from '../lib';
import {BriefcaseBusiness,FileText,MapPin,Search,ShieldCheck,ArrowRight} from 'lucide-react';

type Ad={id:string;title:string;price:number;city?:string;attributes?:Record<string,any>;images?:{url:string}[];seller?:{name?:string;verified?:boolean}};

export default function JobsPage(){
 const [mode,setMode]=useState<'jobs'|'cvs'>('jobs');
 const [items,setItems]=useState<Ad[]>([]);const [loading,setLoading]=useState(true);const [q,setQ]=useState('');
 const [city,setCity]=useState('');const [jobType,setJobType]=useState('');const [experience,setExperience]=useState('');
 useEffect(()=>{setLoading(true);const category=mode==='jobs'?'Jobs':'Seeking Work / CVs';const params=new URLSearchParams({category,page:'1',limit:'24'});if(q.trim())params.set('q',q.trim());if(city)params.set('city',city);if(jobType)params.set('attributeKey','jobType');if(jobType)params.set('attributeValue',jobType);if(experience&&mode==='cvs'){params.set('attributeKey','experience');params.set('attributeValue',experience)}api('/ads?'+params.toString()).then((x:any)=>setItems(Array.isArray(x)?x:(x?.items||[]))).catch(()=>setItems([])).finally(()=>setLoading(false))},[mode,q,city,jobType,experience]);
 const title=mode==='jobs'?'Find jobs in Uganda':'Find work & CVs in Uganda';
 const subtitle=mode==='jobs'?'Discover local opportunities and contact employers directly.':'Browse candidate profiles and CV adverts from people looking for work.';
 const empty=useMemo(()=>mode==='jobs'?'No matching jobs yet. Try a broader search.':'No matching CVs yet. Try another role, location or experience level.',[mode]);
 return <><Header/><main className="container section jobs-page">
  <section className="jobs-hero surface"><div><span className="eyebrow">MINIFY MARKET · JOBS & SERVICES</span><h1>{title}</h1><p>{subtitle}</p><div className="jobs-hero-actions"><Link href="/sell" className="btn primary"><BriefcaseBusiness size={17}/> Post an advert</Link><Link href="/help" className="btn outline">Safety & help</Link></div></div><div className="jobs-hero-art"><BriefcaseBusiness size={42}/><b>Work locally</b><span>Connect through MINIFY MARKET</span></div></section>
  <div className="jobs-tabs"><button className={mode==='jobs'?'active':''} onClick={()=>{setMode('jobs');setExperience('')}}><BriefcaseBusiness size={17}/> Jobs</button><button className={mode==='cvs'?'active':''} onClick={()=>{setMode('cvs');setJobType('')}}><FileText size={17}/> Seeking Work / CVs</button></div>
  <section className="surface jobs-filters"><div className="jobs-search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={mode==='jobs'?'Search job title, company or skill':'Search profession, role or candidate'}/></div>
   <select value={city} onChange={e=>setCity(e.target.value)}><option value="">All Uganda</option><option>Kampala</option><option>Wakiso</option><option>Mukono</option><option>Entebbe</option><option>Jinja</option><option>Mbarara</option></select>
   {mode==='jobs'?<select value={jobType} onChange={e=>setJobType(e.target.value)}><option value="">Any job type</option><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Temporary</option><option>Internship</option><option>Volunteer</option></select>:<select value={experience} onChange={e=>setExperience(e.target.value)}><option value="">Any experience</option><option>No experience</option><option>Less than 1 year</option><option>1-2 years</option><option>3-5 years</option><option>6-10 years</option><option>10+ years</option></select>}
  </section>
  <section className="jobs-results"><div className="section-head"><div><span className="eyebrow">DISCOVER</span><h2>{mode==='jobs'?'Latest job opportunities':'Latest CVs'}</h2></div><span className="muted">{loading?'Loading…':`${items.length} results`}</span></div>
   {loading?<div className="jobs-grid">{[1,2,3,4].map(n=><div className="surface job-card skeleton-card" key={n}/>)}</div>:items.length?<div className="jobs-grid">{items.map(ad=><Link className="surface job-card" href={'/ad/'+ad.id} key={ad.id}><div className="job-image"><img src={mediaUrl(ad.images?.[0]?.url||'/minify-market-official.png')} alt=""/></div><div className="job-body"><span className="job-chip">{ad.attributes?.jobType||ad.attributes?.experience||'Opportunity'}</span><h3>{ad.title}</h3>{ad.city&&<span className="muted"><MapPin size={14}/> {ad.city}</span>}<strong>{Number(ad.price)>0?money(ad.price):'Contact seller'}</strong>{ad.seller?.verified&&<span className="verified-mini"><ShieldCheck size={14}/> Verified seller</span>}</div><ArrowRight className="job-arrow" size={18}/></Link>)}</div>:<div className="surface jobs-empty"><FileText size={34}/><h3>{empty}</h3><p className="muted">Post the first advert in this section and start connecting with people.</p><Link href="/sell" className="btn primary">Post an advert</Link></div>}
  </section>
 </main></>;
}
