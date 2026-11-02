'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowRight,Check,ChevronDown,Clock3,RefreshCw,Search,Server,ShieldCheck,SlidersHorizontal} from 'lucide-react';
import './servidores.css';

type Mode='mutua'|'so_divulgar';
type Settings={
 guild_id:string; installed:boolean; ativo:boolean; modo:Mode;
 canal_configurado:boolean; anuncio_configurado:boolean;
 nome:string|null; descricao:string|null; enviados:number; recebidos:number;
};
type Guild={id:string;name:string;owner:boolean;installed:boolean;divulgacao?:Settings};
type Payload={username:string;guilds:Guild[];verified:boolean;checked_at:number};
type Feedback={text:string;ok:boolean};
type Filter='all'|'installed'|'other';
const modeLabel=(mode:Mode)=>mode==='mutua'?'Divulgação mútua':'Apenas divulgar';

export default function Servidores(){
 const [payload,setPayload]=useState<Payload|null>(null);
 const [loading,setLoading]=useState(true);
 const [refreshing,setRefreshing]=useState(false);
 const [notice,setNotice]=useState('');
 const [search,setSearch]=useState('');
 const [filter,setFilter]=useState<Filter>('all');
 const [drafts,setDrafts]=useState<Record<string,Mode>>({});
 const [savingId,setSavingId]=useState<string|null>(null);
 const [feedback,setFeedback]=useState<Record<string,Feedback>>({});
 const requestId=useRef(0);

 const load=useCallback(async()=>{
  const id=++requestId.current;
  if(!payload)setLoading(true);
  else setRefreshing(true);
  setNotice('');
  try{
   const response=await fetch('/api/auth/guilds',{cache:'no-store'});
   if(response.status===401){window.location.assign('/entrar');return;}
   const body=await response.json();
   if(!response.ok)throw new Error(body.error||'A consulta aos servidores falhou.');
   if(!body.verified||!Array.isArray(body.guilds))throw new Error('Dados de servidores indisponíveis.');
   if(id!==requestId.current)return;
   const next=body as Payload;
   setPayload(next);
   const current:Record<string,Mode>={};
   for(const guild of next.guilds){
    if(guild.installed&&guild.divulgacao)current[guild.id]=guild.divulgacao.modo;
   }
   setDrafts(current);
  }catch(e){
   if(id!==requestId.current)return;
   setNotice(e instanceof Error?e.message:'Não foi possível atualizar os servidores.');
  }finally{
   if(id===requestId.current){setLoading(false);setRefreshing(false);}
  }
 },[payload]);

 useEffect(()=>{
  void load();
  return()=>{requestId.current++};
  // One request on mount: user can refresh explicitly to avoid duplicate Discord calls.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);

 const save=async(guild:Guild)=>{
  const d=guild.divulgacao;
  const mode=drafts[guild.id];
  if(!d||!mode||mode===d.modo||savingId)return;
  setSavingId(guild.id);
  setFeedback(previous=>({...previous,[guild.id]:{text:'',ok:false}}));
  try{
   const response=await fetch('/api/dashboard/'+guild.id+'/modo',{
    method:'PUT',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({modo:mode}),cache:'no-store',
   });
   const body=await response.json();
   if(!response.ok)throw new Error(body.detail||body.error||'Não foi possível guardar o modo.');
   const updated=body as Settings;
   setPayload(old=>old?{...old,guilds:old.guilds.map(g=>g.id===guild.id?{...g,divulgacao:updated}:g)}:old);
   setDrafts(old=>({...old,[guild.id]:updated.modo}));
   setFeedback(old=>({...old,[guild.id]:{ok:true,text:'Modo guardado na Shayon.'}}));
  }catch(e){
   setFeedback(old=>({...old,[guild.id]:{ok:false,text:e instanceof Error?e.message:'Erro ao guardar.'}}));
  }finally{setSavingId(null);}
 };

 const guilds=payload?.guilds||[];
 const active=guilds.filter(g=>g.installed);
 const inactive=guilds.filter(g=>!g.installed);
 const match=(g:Guild)=>g.name.toLocaleLowerCase('pt-PT').includes(search.trim().toLocaleLowerCase('pt-PT'));
 const showActive=filter!=='other'?active.filter(match):[];
 const showInactive=filter!=='installed'?inactive.filter(match):[];
 const count=showActive.length+showInactive.length;

 return <main className="wrap sg-page">
  <div className="sg-top">
   <div>
    <div className="eyebrow">SHAYON CONTROL CENTER / DISCORD</div>
    <h1>Os teus <em>servidores.</em></h1>
    <p>Gestão da Divulgação com dados reais, diretamente do bot.</p>
   </div>
   <button className="sg-refresh" onClick={()=>void load()} disabled={loading||refreshing} aria-label="Atualizar servidores">
    <RefreshCw size={16} className={refreshing?'sg-spin':''}/>
    {refreshing?'A atualizar…':'Atualizar'}
   </button>
  </div>

  {notice&&<div className="sg-alert" role="alert">
   <div><strong>Não foi possível atualizar agora.</strong><p>{notice}{payload?' Os dados anteriores continuam visíveis.':''}</p></div>
   <button onClick={()=>void load()} disabled={refreshing}>Tentar novamente</button>
  </div>}

  {loading&&!payload&&<div className="sg-loading"><RefreshCw size={20} className="sg-spin"/> A verificar os teus servidores…</div>}

  {payload&&<>
   <div className="sg-summary">
    <div className="sg-user"><span className="sg-avatar"><ShieldCheck size={21}/></span>
     <div><strong>Olá, {payload.username} ♡</strong><span>Servidores com autorização confirmada pelo Discord</span></div>
    </div>
    <div className="sg-counters">
     <div><strong>{guilds.length}</strong><span>Administráveis</span></div>
     <div><strong>{active.length}</strong><span>Com Shayon</span></div>
     <div><strong>{inactive.length}</strong><span>Sem Shayon</span></div>
    </div>
   </div>

   <div className="sg-toolbar">
    <div className="sg-filter" role="group" aria-label="Filtrar servidores">
     {([
      ['all','Todos'],['installed','Com Shayon'],['other','Sem Shayon'],
     ] as [Filter,string][]).map(([value,label])=>
      <button key={value} className={filter===value?'sg-selected':''} onClick={()=>setFilter(value)} aria-pressed={filter===value}>{label}</button>
     )}
    </div>
    <label className="sg-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar servidor" aria-label="Pesquisar servidor"/></label>
   </div>

   {showActive.length>0&&<section className="sg-section">
    <div className="sg-section-heading"><div><h2><Server size={19}/> Com a Shayon instalada</h2><p>Definições da rede de divulgação</p></div><span>{showActive.length} {showActive.length===1?'servidor':'servidores'}</span></div>
    <div className="sg-installed-grid">
     {showActive.map(g=>{
      const d=g.divulgacao;
      const draft=drafts[g.id]||d?.modo||'mutua';
      const changed=Boolean(d&&draft!==d.modo);
      const saving=savingId===g.id;
      return <article className="sg-card" key={g.id}>
       <div className="sg-card-head">
        <div className="sg-server-icon"><Server size={21}/></div>
        <div className="sg-server-name"><h3 title={g.name}>{g.name}</h3><span>{g.owner?'Proprietária/o':'Pode gerir servidor'}</span></div>
        <span className="sg-connected"><Check size={14}/> Instalada</span>
       </div>
       {!d?<div className="sg-no-data">Ainda não foi possível obter os dados da Divulgação.</div>:<>
        <div className="sg-status"><span className={'sg-dot '+(d.ativo?'sg-dot-on':'')}/><span>Divulgação {d.ativo?'ativa':'pausada'}</span></div>
        <div className="sg-stats">
         <div><small>Enviados</small><strong>{d.enviados}</strong></div>
         <div><small>Recebidos</small><strong>{d.recebidos}</strong></div>
        </div>
        <div className="sg-details">
         <div><span>Anúncio</span><strong title={d.nome||''}>{d.anuncio_configurado?(d.nome||'Configurado'):'Por configurar'}</strong></div>
         <div><span>Canal de receção</span><strong>{d.canal_configurado?'Configurado':'Por configurar'}</strong></div>
        </div>
        <div className="sg-settings">
         <label htmlFor={'sg-mode-'+g.id}><SlidersHorizontal size={15}/> Modo de divulgação</label>
         <div className="sg-control">
          <div className="sg-select-wrap"><select id={'sg-mode-'+g.id} value={draft}
            onChange={e=>{setDrafts(old=>({...old,[g.id]:e.target.value as Mode}));setFeedback(old=>({...old,[g.id]:{ok:true,text:''}}));}}
            disabled={saving||!d.anuncio_configurado}>
            <option value="mutua">Divulgação mútua</option>
            <option value="so_divulgar">Apenas divulgar</option>
           </select><ChevronDown size={16}/></div>
          <button className="sg-save" onClick={()=>void save(g)} disabled={!changed||saving||!d.anuncio_configurado}>
           {saving?'A guardar…':'Guardar'}
          </button>
         </div>
         {!d.anuncio_configurado&&<p className="sg-hint">Configura primeiro o anúncio no Discord.</p>}
         {changed&&<p className="sg-hint">Alteração ainda não guardada.</p>}
         {feedback[g.id]?.text&&<p className={feedback[g.id].ok?'sg-feedback':'sg-feedback sg-fail'} role="status">{feedback[g.id].text}</p>}
        </div>
       </>}
      </article>;
     })}
    </div>
   </section>}

   {showInactive.length>0&&<section className="sg-section">
    <div className="sg-section-heading"><div><h2><Server size={19}/> Outros servidores</h2><p>Onde ainda não tens a Shayon instalada</p></div><span>{showInactive.length} {showInactive.length===1?'servidor':'servidores'}</span></div>
    <div className="sg-other-grid">
     {showInactive.map(g=><div className="sg-other" key={g.id}>
      <span className="sg-other-icon"><Server size={17}/></span>
      <div><strong title={g.name}>{g.name}</strong><span>{g.owner?'Proprietária/o':'Pode gerir servidor'} · Shayon não instalada</span></div>
      <ArrowRight size={15} className="sg-other-arrow"/>
     </div>)}
    </div>
   </section>}

   {count===0&&<div className="sg-empty">Não encontrámos servidores para este filtro.</div>}
   <p className="sg-footnote"><Clock3 size={14}/> Dados consultados ao Discord e à base da Shayon. Cada alteração de modo só é enviada quando carregas em Guardar.</p>
  </>}
 </main>;
}
