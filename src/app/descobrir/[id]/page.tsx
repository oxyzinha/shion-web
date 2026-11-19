import Link from 'next/link';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {ArrowLeft,ArrowUpRight} from 'lucide-react';
import type {Community} from '@/components/discovery-browser';
export const dynamic='force-dynamic';
const UPSTREAM=(process.env.SHAYON_BOT_API_URL||'https://app-582c58dcabe4.factorai.cloud').replace(/\/$/,'');
async function getCommunity(id:string):Promise<Community|null>{
 if(!/^[0-9]{16,21}$/.test(id))return null;
 try{
  const res=await fetch(UPSTREAM+'/api/discover',{cache:'no-store',signal:AbortSignal.timeout(6500)});
  if(!res.ok)return null;
  const result=await res.json() as {servers?:Community[]};
  return result.servers?.find(item=>item.id===id)||null;
 }catch{return null;}
}
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const {id}=await params;
 const community=await getCommunity(id);
 if(!community)return {title:'Comunidade não disponível | Shayon',robots:{index:false,follow:false}};
 return {
  title:community.name+' | Descobrir servidores Discord na Shayon',
  description:community.description,
  alternates:{canonical:'/descobrir/'+id},
  openGraph:{title:community.name+' · Shayon',description:community.description,type:'website'},
 };
}
export default async function CommunityPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const item=await getCommunity(id);
 if(!item)notFound();
 return <main className="wrap discovery-page discovery-detail">
  <Link href="/descobrir" className="text-link"><ArrowLeft size={15}/> Todas as comunidades</Link>
  <section className="discovery-detail-card">
   <div className="eyebrow">SHAYON · COMUNIDADE</div>
   <div className="discovery-card-symbol">{item.name.slice(0,1).toUpperCase()}</div>
   <h1>{item.name}</h1>
   <div className="discovery-card-meta"><span>{item.category_label}</span><span>{item.language_label}</span>{item.partner&&<span>Rede parceira</span>}</div>
   <p>{item.description}</p>
   <div className="discovery-tags">{item.tags.map(tag=><span key={tag}>{tag}</span>)}</div>
   <a href={'/api/descobrir/entrar/'+encodeURIComponent(item.id)} className="button" target="_blank" rel="noopener noreferrer">
    Entrar no Discord <ArrowUpRight size={17}/>
   </a>
   <small>A entrada depende das definições do servidor e da validade do convite. A Shayon não garante adesões.</small>
  </section>
 </main>;
}
