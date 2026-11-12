'use client';
import {useCallback,useEffect,useState} from 'react';
import {Activity,Clock3,Headphones,Server,RefreshCw,Shield,Ticket,Radio,ChartNoAxesColumn} from 'lucide-react';

type Monitor={
 checked_at:string;
 bot:{process_running:boolean;discord_connected:boolean;heartbeat_age_seconds:number|null;uptime_seconds:number|null;latency_ms:number|null;servers:number|null;cogs_loaded:number|null};
 music:{playing:number|null;paused:number|null;queued:number|null};
 activity:{publications_today:number;publications_week:number;tickets_open:number;tickets_today:number;moderation_today:number;analytics_enabled_guilds:number;pending_publications:number;failed_publications_week:number};
 daily_publications:{date:string;count:number}[];
 modules:Record<string,number>;
 recent_jobs:{category:string;status:string;at:number}[];
 notes:{heartbeat:string;errors:string};
};
const modules:Record<string,string>={moderation:'Moderação',welcome:'Receção',tickets:'Tickets',promotion:'Divulgação',analytics:'Analytics'};
const number=(v:number|null|undefined)=>typeof v==='number'?v.toLocaleString('pt-PT'):'—';
function duration(seconds:number|null){
 if(seconds===null)return '—';
 const days=Math.floor(seconds/86400),hours=Math.floor((seconds%86400)/3600),minutes=Math.floor((seconds%3600)/60);
 return days>0?`${days}d ${hours}h`:hours>0?`${hours}h ${minutes}min`:`${minutes}min`;
}
function textStatus(s:string){return s==='done'?'Concluída':s==='failed'?'Falhou':s==='pending'?'Pendente':s==='running'?'A executar':'Desconhecido';}

export function OwnerMonitor(){
 const [data,setData]=useState<Monitor|null>(null);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 const [refreshing,setRefreshing]=useState(false);
 const reload=useCallback(async(manual=false)=>{
  if(manual)setRefreshing(true);
  try{
   const result=await fetch('/api/dashboard/owner/monitor',{credentials:'same-origin',cache:'no-store'});
   const body=await result.json();
   if(!result.ok)throw new Error(typeof body?.detail==='string'?body.detail:typeof body?.error==='string'?body.error:'Sem acesso à monitorização.');
   setData(body as Monitor);setError('');
  }catch(e){setError(e instanceof Error?e.message:'Não foi possível consultar a Shayon.');}
  finally{setLoading(false);setRefreshing(false);}
 },[]);
 useEffect(()=>{
  void reload();
  const interval=window.setInterval(()=>{if(document.visibilityState==='visible')void reload();},30000);
  return ()=>window.clearInterval(interval);
 },[reload]);
 const max=Math.max(1,...(data?.daily_publications||[]).map(p=>p.count));
 return <section className="owner-monitor" aria-label="Monitorização em tempo real da Shayon">
  <div className="monitor-heading"><div><div className="eyebrow">MONITORIZAÇÃO</div><h2>Estado da Shayon <span>♡</span></h2></div>
   <button type="button" className="button button-outline button-small" disabled={refreshing} onClick={()=>void reload(true)}>
    <RefreshCw size={15}/> {refreshing?'A atualizar...':'Atualizar'}
   </button>
  </div>
  {loading&&!data&&<div className="monitor-skeleton" role="status">A consultar o estado da Shayon...</div>}
  {error&&<div className="note" role="alert">{error}{data?' · A mostrar a última leitura disponível.':''}</div>}
  {data&&<>
   <div className="monitor-grid">
    <article className="monitor-stat"><span className="monitor-stat-label"><Radio size={15}/> Discord</span>
     <strong className={data.bot.discord_connected?'monitor-good':'monitor-muted'}>{data.bot.discord_connected?'Ligada':data.bot.process_running?'A verificar':'Desligada'}</strong>
     <small>{data.bot.discord_connected?'Ligação confirmada recentemente':data.bot.process_running?'Processo ativo, sem confirmação recente':'Processo não está ativo'}</small></article>
    <article className="monitor-stat"><span className="monitor-stat-label"><Clock3 size={15}/> Tempo online</span>
     <strong>{duration(data.bot.uptime_seconds)}</strong><small>Desde o último arranque do bot</small></article>
    <article className="monitor-stat"><span className="monitor-stat-label"><Server size={15}/> Servidores</span>
     <strong>{number(data.bot.servers)}</strong><small>Servidores com a Shayon ligada</small></article>
    <article className="monitor-stat"><span className="monitor-stat-label"><Activity size={15}/> Latência</span>
     <strong>{data.bot.latency_ms!==null?`${data.bot.latency_ms} ms`:'—'}</strong><small>Ligação ao Discord</small></article>
   </div>
   <div className="monitor-two-col">
    <section className="monitor-section"><h3>Atividade</h3>
     <div className="monitor-rows">
      <div><span><ChartNoAxesColumn size={15}/> Divulgações hoje</span><strong>{number(data.activity.publications_today)}</strong></div>
      <div><span>Divulgações em 7 dias</span><strong>{number(data.activity.publications_week)}</strong></div>
      <div><span><Ticket size={15}/> Tickets abertos</span><strong>{number(data.activity.tickets_open)}</strong></div>
      <div><span>Novos tickets hoje</span><strong>{number(data.activity.tickets_today)}</strong></div>
      <div><span><Shield size={15}/> Eventos AutoMod hoje</span><strong>{number(data.activity.moderation_today)}</strong></div>
     </div>
    </section>
    <section className="monitor-section"><h3>Música e módulos</h3>
     <div className="monitor-rows">
      <div><span><Headphones size={15}/> A reproduzir</span><strong>{number(data.music.playing)}</strong></div>
      <div><span>Em pausa</span><strong>{number(data.music.paused)}</strong></div>
      <div><span>Faixas em fila</span><strong>{number(data.music.queued)}</strong></div>
     </div>
     <div className="monitor-module-chips">
      {Object.entries(modules).map(([key,label])=><span key={key}>{label}: <b>{number(data.modules[key])}</b></span>)}
     </div>
     <small className="monitor-explain">Módulos: número de servidores com a configuração ativa, não garantia de funcionamento em todos os canais.</small>
    </section>
   </div>
   <section className="monitor-section monitor-trend"><div className="monitor-title-row"><h3>Divulgações nos últimos 7 dias</h3><span>{number(data.activity.publications_week)} no total</span></div>
    <div className="monitor-bars" role="img" aria-label={data.daily_publications.map(v=>v.date+': '+v.count+' divulgações').join('; ')}>
     {data.daily_publications.map(day=><div className="monitor-bar-cell" key={day.date}>
       <strong>{day.count}</strong><div className="monitor-bar-track"><div style={{height:`${day.count===0?2:Math.max(8,Math.round(day.count/max*100))}%`}}/></div>
       <small>{new Date(day.date+'T12:00:00Z').toLocaleDateString('pt-PT',{day:'2-digit',month:'short',timeZone:'UTC'})}</small>
      </div>)}
    </div>
   </section>
   <details className="monitor-details"><summary>Publicações do website e verificações</summary>
    <div className="monitor-rows">
     <div><span>Pedidos por publicar</span><strong>{number(data.activity.pending_publications)}</strong></div>
     <div><span>Publicações falhadas (7 dias)</span><strong>{number(data.activity.failed_publications_week)}</strong></div>
     <div><span>Servidores com Analytics ativo</span><strong>{number(data.activity.analytics_enabled_guilds)}</strong></div>
     <div><span>Módulos carregados no processo</span><strong>{number(data.bot.cogs_loaded)}</strong></div>
    </div>
    {data.recent_jobs.length>0&&<div className="monitor-job-list">{data.recent_jobs.map((job,i)=>
     <div key={job.at+'-'+i}><span>{job.category}</span><b>{textStatus(job.status)}</b><small>{new Date(job.at*1000).toLocaleString('pt-PT')}</small></div>)}</div>}
    <p className="monitor-explain">{data.notes.errors}</p>
   </details>
   <p className="monitor-updated">Última leitura: {new Date(data.checked_at).toLocaleString('pt-PT')} · Atualização automática a cada 30 segundos</p>
  </>}
 </section>;
}
