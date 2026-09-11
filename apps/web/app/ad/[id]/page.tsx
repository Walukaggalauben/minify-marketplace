import Header from '../../components/Header';
import AdActions from '../../components/AdActions';
import OrderPanel from '../../components/OrderPanel';
import SellerReviewForm from '../../components/SellerReviewForm';
import ReportAd from '../../components/ReportAd';
import {api,money,mediaUrl} from '../../lib';
import Link from 'next/link';
import {MapPin,ShieldCheck,Heart,Zap} from 'lucide-react';

function Card({a}:{a:any}){return <Link className="listing" href={'/ad/'+a.id}><div className="listing-image"><img src={mediaUrl(a.images?.[0]?.url||'/logo-market.png')} alt={a.title}/>{(a.featuredUntil||a.boostUntil)&&<span className="status"><Zap size={11}/> {a.featuredUntil?'Featured':'Boosted'}</span>}<span className="save-float"><Heart size={16}/></span></div><div className="listing-body"><div className="price">{money(a.price)}</div><b className="listing-title">{a.title}</b><div className="listing-location"><MapPin size={13}/>{a.city||'Uganda'}</div></div></Link>}

export default async function AdPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const a=await api('/ads/'+id);if(!a)return <><Header/><main className="container section"><div className="empty">Advert not found.</div></main></>;
 let similar:any[]=[];try{const r=await api('/ads?categoryId='+encodeURIComponent(a.category?.id||'')+'&limit=8');similar=(r.items||r).filter((x:any)=>x.id!==a.id).slice(0,4)}catch{}
 return <><Header/><main className="container section"><div className="two"><div><div className="panel"><div className="ad-gallery">{(a.images?.length?a.images:[{url:'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1200&q=80'}]).map((im:any,i:number)=><img className={i?'ad-gallery-small':'adimg'} key={i} src={mediaUrl(im.url)} alt={a.title}/>)}</div><h1>{a.title}</h1><div className="price">{money(a.price)} {a.negotiable&&<span className="muted">Negotiable</span>}</div><div className="chips"><span className="chip">{a.condition}</span><span className="chip">{a.city}</span><span className="chip">{a.views} views</span><span className="chip">{a.category?.name}</span></div><p>{a.description}</p></div><div className="panel" style={{marginTop:18}}><SellerReviewForm sellerId={a.seller.id}/></div></div><aside className="panel"><h2>Seller</h2><Link href={'/seller/'+a.seller.id}><h3>{a.seller.name} {a.seller.verified&&<ShieldCheck size={15}/>}</h3></Link><p className="muted">{a.seller.city||a.city}</p><AdActions adId={a.id} sellerId={a.seller.id} sellerPhone={a.seller.phone}/><OrderPanel ad={a}/><hr/><ReportAd adId={a.id}/><hr/><div className="safety-box"><b>Stay safe</b><span>Meet in a public place.</span><span>Inspect the exact item before paying.</span><span>Never send money in advance to an unknown seller.</span><span>Never share your PIN or password.</span></div></aside></div>
 {similar.length>0&&<section className="section"><div className="section-head"><div><span className="eyebrow">YOU MAY ALSO LIKE</span><h2>Similar adverts</h2></div></div><div className="grid listing-grid">{similar.map((x:any)=><Card a={x} key={x.id}/>)}</div></section>}
 </main></>;
}
