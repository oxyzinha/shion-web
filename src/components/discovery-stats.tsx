'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {ArrowUpRight,MousePointerClick,RadioTower} from 'lucide-react';
type Stats={invite_opens_total:number;invite_opens_7d:number;invite_opens_today:number;network_posts_7d:number;invite_opens_catalog_7d?:number;invite_opens_recommendation_7d?:number;disclaimer:string};
export function DiscoveryStats({guildId}:{guildId:string}){
 const [stats,setStats]=useState<Stats|null>(null);
 const [error,setError]=useState('');
 useEffect(()=>{
  let cancelled=false;
  (async()=>{
   try{
    const response=await fetch('/api/dashboard/'+guildId+'/discovery/stats',{cache:'no-store'});
    if(!response.ok)throw new Error('As estatísticas estão indisponíveis.');
    const data=await response.json() as Stats;
    if(!cancelled){setStats(data);setError('');}
   }catch{if(!cancelled)setError('Não foi possível carregar os resultados.');}
  })();
  return ()=>{cancelled=true;};
 },[guildId]);
 return <section className="discovery-stats" aria-label="Resultados de descoberta">
  <div className="discovery-stats-head"><h3>Resultados da descoberta</h3><Link href="/descobrir" target="_blank">Ver catálogo <ArrowUpRight size={14}/></Link></div>
  {stats?<div className="discovery-stat-grid">
   <div><MousePointerClick size={16}/><small>Convites abertos hoje</small><strong>{stats.invite_opens_today}</strong></div>
   <div><MousePointerClick size={16}/><small>Convites abertos em 7 dias</small><strong>{stats.invite_opens_7d}</strong></div>
   <div><MousePointerClick size={16}/><small>Total de aberturas</small><strong>{stats.invite_opens_total}</strong></div>
   <div><RadioTower size={16}/><small>Anúncios da rede em 7 dias</small><strong>{stats.network_posts_7d}</strong></div>
  </div>:<p className="simple-field-note">{error||'A carregar resultados...'}</p>}
  {stats&&<div className="discovery-stats-sources">
   <strong>De onde vieram as aberturas registadas?</strong>
   <div><span>Catálogo público</span><b>{stats.invite_opens_catalog_7d??0}</b></div>
   <div><span>Recomendações pedidas à Shayon</span><b>{stats.invite_opens_recommendation_7d??0}</b></div>
  </div>}
  <p className="discovery-stats-note">As aberturas dos links não são visitantes únicos nem entradas confirmadas. A origem é declarada pelo próprio link, podendo ser alterada; não equivale a atribuição verificada. Dados anteriores a esta medição não aparecem separados por origem.</p>
 </section>;
}
