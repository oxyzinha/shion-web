import Link from 'next/link';
import type {Metadata} from 'next';
import {ArrowRight,Compass} from 'lucide-react';
import {DiscoveryBrowser,Community} from '@/components/discovery-browser';
export const dynamic='force-dynamic';
export const metadata:Metadata={
 title:'Descobrir servidores Discord | Shayon',
 description:'Encontra comunidades Discord de jogos, roleplay, tecnologia, anime, música e outros interesses. Catálogo de servidores que escolheram participar na Shayon.',
 alternates:{canonical:'/descobrir'},
};
const UPSTREAM=(process.env.SHAYON_BOT_API_URL||'https://app-582c58dcabe4.factorai.cloud').replace(/\/$/,'');
async function communities():Promise<{items:Community[];unavailable:boolean}>{
 try{
  const response=await fetch(UPSTREAM+'/api/discover',{cache:'no-store',signal:AbortSignal.timeout(8500)});
  if(!response.ok)throw new Error('O catálogo não respondeu.');
  const data=await response.json() as {servers?:Community[]};
  return {items:Array.isArray(data.servers)?data.servers:[],unavailable:false};
 }catch{return {items:[],unavailable:true};}
}
export default async function DiscoverPage(){
 const {items,unavailable}=await communities();
 return <main className="wrap discovery-page">
  <section className="discovery-intro"><div className="eyebrow">SHAYON · DISCOVERY</div>
   <h1>Encontra a tua <em>próxima comunidade.</em></h1>
   <p>Novos jogos, amizades e universos para descobrir. Não precisas de ter a Shayon no teu servidor para explorar os convites públicos.</p>
  </section>
  {unavailable&&<p className="note" role="status">O catálogo está temporariamente indisponível. Experimenta novamente mais tarde.</p>}
  <DiscoveryBrowser communities={items}/>
  <section className="discovery-bottom"><Compass size={25}/><div>
   <h2>Queres ver o teu servidor aqui?</h2>
   <p>Adiciona a Shayon, regista o anúncio e ativa a publicação no catálogo. Nada é publicado sem autorização.</p>
   <Link className="text-link" href="/parcerias">Como participar <ArrowRight size={16}/></Link>
  </div></section>
 </main>;
}
