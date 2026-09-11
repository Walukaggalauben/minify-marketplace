export const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000/api';
export const API_ORIGIN=API.replace(/\/api\/?$/,'');
export const mediaUrl=(url:string)=>url?.startsWith('http')?url:url?.startsWith('/')?`${API_ORIGIN}${url}`:url;
export async function api(path:string,init?:RequestInit){const token=typeof window!=='undefined'?localStorage.getItem('minify_token'):null;const headers:Record<string,string>={'Content-Type':'application/json',...(init?.headers as Record<string,string>||{})};if(token)headers.Authorization=`Bearer ${token}`;const r=await fetch(`${API}${path}`,{...init,headers,cache:'no-store'});if(!r.ok)throw new Error(await r.text());return r.json()}
export const money=(n:number|string)=>`UGX ${Number(n).toLocaleString()}`;
