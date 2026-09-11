'use client';
import {ChangeEvent,useEffect,useState} from 'react';

type Props={files:File[];setFiles:(files:File[])=>void};

export default function ImageUploader({files,setFiles}:Props){
 const [previews,setPreviews]=useState<string[]>([]);
 useEffect(()=>{const urls=files.map(file=>URL.createObjectURL(file));setPreviews(urls);return()=>urls.forEach(url=>URL.revokeObjectURL(url));},[files]);
 const onChange=(e:ChangeEvent<HTMLInputElement>)=>{
  const incoming=Array.from(e.target.files||[]);
  const valid=incoming.filter(f=>/^image\/(jpeg|png|webp|gif)$/.test(f.type)&&f.size<=8*1024*1024);
  setFiles([...files,...valid].slice(0,8));e.target.value='';
 };
 const remove=(i:number)=>setFiles(files.filter((_,n)=>n!==i));
 return <div className="image-uploader">
  <label className="upload-drop"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={onChange}/><strong>+ Add photos</strong><span>JPG, PNG, WEBP or GIF · max 8MB each · up to 8 photos</span></label>
  {!!files.length&&<div className="upload-preview">{files.map((file,i)=><div className="upload-thumb" key={`${file.name}-${i}`}><img src={previews[i]||''} alt={file.name}/><button type="button" onClick={()=>remove(i)} aria-label={`Remove ${file.name}`}>×</button>{i===0&&<small>Cover</small>}</div>)}</div>}
 </div>;
}
