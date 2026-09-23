'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import {api,mediaUrl,money} from '../lib';
import {BriefcaseBusiness,FileText,MapPin,Search,ShieldCheck,SlidersHorizontal,ArrowUpDown,ChevronDown,X} from 'lucide-react';

type Ad={id:string;title:string;price:number;city?:string;attributes?:Record<string,any>;images?:{url:string}[];seller?:{name?:string;verified?:boolean}};
const JOB_TYPES=['Full-time','Part-time','Temporary','Contract','Freelance','Internship','Volunteer'];
const SALARIES=[['Commission','commission'],['Below USh 100,000','0-99999'],['USh 100,000 - 200,000','100000-200000'],['USh 200,000 - 300,000','200000-300000'],['USh 300,000 - 400,000','300000-400000'],['USh 400,000 - 600,000','400000-600000'],['USh 600,000 - 800,000','600000-800000'],['USh 800,000 - 1,000,000','800000-1000000'],['USh 1,000,000 - 1,200,000','1000000-1200000'],['USh 1,200,000 - 1,500,000','1200000-1500000'],['Above USh 1,500,000','1500001-999999999']];
const LOCATIONS=['All Uganda','Kampala','Wakiso','Mukono','Entebbe','Jinja','Mbarara','Gulu','Lira'];
const JOB_CATEGORIES=['Accounting & Finance Jobs','Advertising & Marketing Jobs','Arts & Entertainment Jobs','Construction & Skilled Trade Jobs','Customer Service Jobs','Driver Jobs','Education Jobs','Engineering Jobs','Health & Beauty Jobs','Hospitality Jobs','IT Jobs','Office Jobs','Sales Jobs','Security Jobs','Other Jobs'];
const CV_CATEGORIES=['Accounting & Finance CVs','Advertising & Marketing CVs','Construction & Skilled Trade CVs','Customer Service CVs','Driver CVs','Education CVs','Health & Beauty CVs','IT CVs','Manual Labour CVs','Office CVs','Sales CVs','Security CVs','Other CVs'];

export default function JobsPage(){
 const [mode,setMode]=useState<'jobs'|'cvs'>('jobs');
 const [items,setItems]=useState<Ad[]>([]);const [total,setTotal]=useState(0);const [loading,setLoading]=useState(true);
 const [q,setQ]=useState('');const [city,setCity]=useState('');const [jobType,setJobType]=useState('');const [category,setCategory]=useState('');
 const [verified,setVerified]=useState(false);const [salary,setSalary]=useState('');const [sort,setSort]=useState('createdAt');const [filtersOpen,setFiltersOpen]=useState(false);
 const categoryOptions=mode==='jobs'?JOB_CATEGORIES:CV_CATEGORIES;
 useEffect(()=>{
  setLoading(true);const root=mode==='jobs'?'Jobs':'Seeking Work / CVs';const params=new URLSearchParams({category:category||root,page:'1',limit:'24',sort,order:'desc'});
  if(q.trim())params.set('q',q.trim());if(city&&city!=='All Uganda')params.set('city',city);
  if(jobType&&mode==='jobs'){params.set('attributeKey','jobType');params.set('attributeValue',jobType)}
  if(mode==='cvs'&&jobType){params.set('attributeKey','experience');params.set('attributeValue',jobType)}
  if(verified)params.set('verifiedSeller','true');
  if(salary&&!salary.includes('commission')){const [min,max]=salary.split('-');if(min)params.set('minPrice',min);if(max)params.set('maxPrice',max)}
  api('/ads?'+params.toString()).then((x:any)=>{setItems(Array.isArray(x)?x:(x?.items||[]));setTotal(Number(x?.total||0))}).catch(()=>{setItems([]);setTotal(0)}).finally(()=>setLoading(false));
 },[mode,q,city,jobType,category,verified,salary,sort]);
 const title=mode==='jobs'?'Jobs in Uganda':'Seeking Work & CVs in Uganda';
 const reset=()=>{setQ('');setCity('');setJobType('');setCategory('');setVerified(false);setSalary('');setSort('createdAt');};
 const empty=useMemo(()=>mode==='jobs'?'No matching jobs yet. Try another category, location or job type.':'No matching CVs yet. Try another role, location or experience level.',[mode]);
 return <><Header/><main className="jobs-market-page">
  <section className="jobs-market-top container">
   <div className="jobs-market-heading"><div><span className="eyebrow">MINIFY MARKET · JOBS & WORK</span><h1>{title}</h1><p>Search opportunities across Uganda and contact employers or candidates directly.</p></div><Link href="/sell" className="btn primary"><BriefcaseBusiness size={17}/> Post an advert</Link></div>
   <div className="jobs-mode-tabs"><button className={mode==='jobs'?'active':''} onClick={()=>{setMode('jobs');reset()}}><BriefcaseBusiness size={17}/> Jobs</button><button className={mode==='cvs'?'active':''} onClick={()=>{setMode('cvs');reset()}}><FileText size={17}/> Seeking Work / CVs</button></div>
  </section>
  <section className="jobs-search-strip"><div className="container"><div className="jobs-search-main"><Search size={19}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={mode==='jobs'?'Search jobs, roles, companies or skills':'Search professions, roles or candidates'}/><button className="jobs-filter-toggle" onClick={()=>setFiltersOpen(v=>!v)}><SlidersHorizontal size={18}/><span>Filters</span></button></div></div></section>
  <section className="jobs-quick container">
   <div className="jobs-chip-row">{(mode==='jobs'?JOB_TYPES:['No experience','Less than 1 year','1-2 years','3-5 years','6-10 years','10+ years']).map(t=><button key={t} className={jobType===t?'selected':''} onClick={()=>setJobType(jobType===t?'':t)}>{t}</button>)}</div>
   <div className="jobs-filter-row"><select value={city||'All Uganda'} onChange={e=>setCity(e.target.value==='All Uganda'?'':e.target.value)}><option>All Uganda</option>{LOCATIONS.slice(1).map(x=><option key={x}>{x}</option>)}</select><select value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option>{categoryOptions.map(x=><option key={x}>{x}</option>)}</select><button className={verified?'filter-pill selected':'filter-pill'} onClick={()=>setVerified(v=>!v)}><ShieldCheck size={16}/> Verified sellers</button><button className="filter-pill" onClick={()=>setFiltersOpen(v=>!v)}><SlidersHorizontal size={16}/> More filters</button></div>
  </section>
  {filtersOpen&&<section className="jobs-filter-panel container"><div className="jobs-filter-panel-head"><div><b>Filters</b><span>Refine your {mode==='jobs'?'job':'CV'} search</span></div><button onClick={()=>setFiltersOpen(false)}><X size={19}/></button></div><div className="jobs-filter-grid"><label>Location<select value={city||'All Uganda'} onChange={e=>setCity(e.target.value==='All Uganda'?'':e.target.value)}><option>All Uganda</option>{LOCATIONS.slice(1).map(x=><option key={x}>{x}</option>)}</select></label><label>{mode==='jobs'?'Job category':'CV category'}<select value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option>{categoryOptions.map(x=><option key={x}>{x}</option>)}</select></label><label>Salary<select value={salary} onChange={e=>setSalary(e.target.value)}><option value="">Any salary</option>{(mode==='jobs'?SALARIES:SALARIES.filter(x=>x[0]!=='Commission')).map(([label,value])=><option value={value} key={value}>{label}</option>)}</select></label><label className="check-filter"><input type="checkbox" checked={verified} onChange={e=>setVerified(e.target.checked)}/> Verified sellers</label></div><div className="jobs-filter-actions"><button className="btn outline" onClick={reset}>Reset</button><button className="btn primary" onClick={()=>setFiltersOpen(false)}>Apply filters</button></div></section>}
  <section className="jobs-results container"><div className="jobs-results-head"><div><strong>{loading?'Loading…':`${total.toLocaleString()} results`}</strong><span>{city||'All Uganda'}</span></div><div className="jobs-sort"><ArrowUpDown size={16}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="createdAt">Newest</option><option value="views">Most viewed</option><option value="price">Salary</option></select><ChevronDown size={15}/></div></div>
   {loading?<div className="jobs-list">{[1,2,3,4].map(n=><div className="job-list-card skeleton-card" key={n}/>)}</div>:items.length?<div className="jobs-list">{items.map(ad=><Link className="job-list-card" href={'/ad/'+ad.id} key={ad.id}><div className="job-list-image"><img src={mediaUrl(ad.images?.[0]?.url||'/minify-market-official.png')} alt=""/></div><div className="job-list-body"><div className="job-list-top"><strong>{Number(ad.price)>0?money(ad.price):(ad.attributes?.salaryType==='Commission'?'Commission':'Contact seller')}</strong>{ad.seller?.verified&&<span className="verified-badge"><ShieldCheck size={13}/> Verified</span>}</div><h2>{ad.title}</h2><p className="job-location"><MapPin size={14}/> {ad.city||'Uganda'}{ad.attributes?.workMode?' · '+ad.attributes.workMode:''}</p><div className="job-meta"><span>{ad.attributes?.jobType||ad.attributes?.experience||'Opportunity'}</span>{ad.seller?.name&&<span>{ad.seller.name}</span>}</div></div></Link>)}</div>:<div className="surface jobs-empty"><FileText size={34}/><h3>{empty}</h3><p className="muted">Try clearing filters or post the first advert in this section.</p><button className="btn outline" onClick={reset}>Reset filters</button></div>}
  </section>
 </main></>;
}
