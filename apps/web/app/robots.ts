import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base=process.env.NEXT_PUBLIC_SITE_URL||"https://minifygadgets.com";
  return { rules:{ userAgent:"*", allow:"/", disallow:["/dashboard","/account","/admin","/messages","/notifications","/orders","/sell","/verification"] }, sitemap:`${base}/sitemap.xml` };
}
