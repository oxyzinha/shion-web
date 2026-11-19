import type {MetadataRoute} from 'next';
const BASE='https://app-a9ad77db7684.factorai.cloud';
const API=(process.env.SHAYON_BOT_API_URL||'https://app-582c58dcabe4.factorai.cloud').replace(/\/$/,'');
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const pages=['','/descobrir','/parcerias','/adicionar','/funcionalidades','/sobre','/privacidade','/termos'];
 const fixed:MetadataRoute.Sitemap=pages.map(path=>({
  url:BASE+path,changeFrequency:path==='/descobrir'?'daily':'monthly',
  priority:path==='/descobrir'?1:0.6,
 }));
 try{
  const res=await fetch(API+'/api/discover',{cache:'no-store',signal:AbortSignal.timeout(5500)});
  if(!res.ok)return fixed;
  const catalog=await res.json() as {servers?:{id:string}[]};
  const listed=(catalog.servers||[]).filter(item=>/^[0-9]{16,21}$/.test(item.id));
  return [...fixed,...listed.map(item=>({
   url:BASE+'/descobrir/'+item.id,changeFrequency:'weekly' as const,priority:0.7,
  }))];
 }catch{return fixed;}
}
