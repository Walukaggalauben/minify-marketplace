import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base=process.env.NEXT_PUBLIC_SITE_URL||"https://minifygadgets.com";
  const now=new Date();
  const paths=["/","/login","/register"];
  return paths.map(path=>({url:`${base}${path}`,lastModified:now,changeFrequency:path==="/"?"daily":"monthly",priority:path==="/"?1:0.3}));
}
