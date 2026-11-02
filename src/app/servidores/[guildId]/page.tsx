'use client';

import Link from 'next/link';
import {useParams} from 'next/navigation';
import {useEffect,useState} from 'react';
import {ArrowLeft,CheckCircle2,Clock,Heart,LockKeyhole,Megaphone,RefreshCw,Shield,Ticket,Users,Music,Settings,Globe} from 'lucide-react';
import './painel.css';

type Moderate={links_ativos:boolean;spam_ativo:boolean;max_mensagens:number;janela_segundos:number;apagar_mensagem:boolean;timeout_minutos:number;punicao_progressiva:boolean;palavras_count:number;automated_punishments_verified:boolean};
type Reception={entrada_ativa:boolean;saida_ativa:boolean;mencionar:boolean;texto_entrada:string;texto_saida:string;canal_entrada_id:string;canal_saida_id:string};
type Tickets={ativo:boolean;tickets_abertos:number;tickets_fechados:number;cargos_count:number;painel_mensagem_id:string|null};
type Modules={guild_id:string;moderacao:Moderate|null;rececao:Reception|null;cargo_automatico:string|null;tickets:Tickets|null;cargos_interativos:{total:number};servidor_oficial:{vinculado:boolean};modules_status:Record<string,string>};
type Ad={guild_id:string;installed:boolean;ativo:boolean;modo:'mutua'|'so_divulgar';nome:string|null;descricao:string|null;enviados:number;recebidos:number;canal_configurado:boolean;anuncio_configurado:boolean};
type Section='divulgacao'|'moderacao'|'rececao'|'cargo_automatico'|'cargos_interativos'|'tickets'|'servidor_oficial'|'musica';
const ITEMS:{id:Section;label:string;Icon:typeof Shield}[]=[
 {id:'divulgacao',label:'Divulgação',Icon:Megaphone},
 {id:'moderacao',label:'Moderação',Icon:Shield},
 {id:'rececao',label:'Boas-vindas',Icon:Heart},
 {id:'cargo_automatico',label:'Cargo automático',Icon:Users},
 {id:'cargos_interativos',label:'Cargos interativos',Icon:Settings},
 {id:'tickets',label:'Tickets',Icon:Ticket},
 {id:'servidor_oficial',label:'Servidor oficial',Icon:Globe},
 {id:'musica',label:'Música',Icon:Music},
];
const checkbox=(id:string,label:string,checked:boolean,onChange:(v:boolean)=>void,disabled=false)=>
 <label className="sh-toggle" htmlFor={id}><span>{label}</span><input id={id} type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} disabled={disabled}/></label>;

export default function GuildPanel(){
 const params=useParams<{guildId:string}>();
 const id=params.guildId;
 const [section,setSection]=useState<Section>('divulgacao');
 const [modules,setModules]=useState<Modules|null>(null);
 const [advertising,setAdvertising]=useState<Ad|null>(null);
 const [moderation,setModeration]=useState<Moderate|null>(null);
 const [reception,setReception]=useState<Reception|null>(null);
 const [mode,setMode]=useState<'mutua'|'so_divulgar'>('mutua');
 const [error,setError]=useState('');
 const [info,setInfo]=useState('');
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [serverName,setServerName]=useState('');

 async function refresh(){
  setLoading(true);setError('');
  try{
   const [m,a,g]=await Promise.all([
    fetch('/api/dashboard/'+id+'/modules',{cache:'no-store'}),
    fetch('/api/dashboard/'+id,{cache:'no-store'}),
    fetch('/api/auth/guilds',{cache:'no-store'}),
   ]);
   if(m.status===401||a.status===401||g.status===401){location.assign('/entrar');return;}
   const [md,ad,gd]=await Promise.all([m.json(),a.json(),g.json()]);
   if(!m.ok||!a.ok)throw Error(md.detail||md.error||ad.detail||ad.error||'Não foi possível carregar o painel.');
   setModules(md as Modules);setModeration(md.moderacao?{...md.moderacao}:null);
   setReception(md.rececao?{...md.rececao}:null);
   setAdvertising(ad as Ad);setMode(ad.modo);
   const found=gd.guilds?.find((x:{id:string})=>x.id===id);
   setServerName(found?.name||'Servidor Discord');
  }catch(e){setError(e instanceof Error?e.message:'Erro de ligação');}
  finally{setLoading(false);}
 }

 useEffect(()=>{void refresh();/* Only after guild id change */ // eslint-disable-next-line react-hooks/exhaustive-deps
 },[id]);

 async function save(module:'moderacao'|'rececao'|'divulgacao'){
  setSaving(true);setError('');setInfo('');
  try{
   const url=module==='divulgacao'?'/api/dashboard/'+id+'/modo':'/api/dashboard/'+id+'/modules/'+module;
   const payload=module==='divulgacao'?{modo:mode}:module==='moderacao'?{
    links_ativos:moderation!.links_ativos,spam_ativo:moderation!.spam_ativo,
    max_mensagens:moderation!.max_mensagens,janela_segundos:moderation!.janela_segundos,
    apagar_mensagem:moderation!.apagar_mensagem,
   }:{
    entrada_ativa:reception!.entrada_ativa,saida_ativa:reception!.saida_ativa,
    mencionar:reception!.mencionar,texto_entrada:reception!.texto_entrada,
    texto_saida:reception!.texto_saida,
   };
   const r=await fetch(url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   const d=await r.json();
   if(!r.ok)throw Error(d.detail||d.error||'A alteração não foi guardada.');
   if(module==='divulgacao'){setAdvertising(d as Ad);setMode(d.modo);}
   else{
    setModules(d as Modules);
    if(module==='moderacao')setModeration(d.moderacao);
    if(module==='rececao')setReception(d.rececao);
   }
   setInfo('Configuração guardada no bot com sucesso.');
  }catch(e){setError(e instanceof Error?e.message:'Ocorreu um erro ao guardar.');}
  finally{setSaving(false);}
 }
 function choose(tab:Section){setSection(tab);setError('');setInfo('');}
 function placeholder(title:string,description:string,details?:React.ReactNode){
  return <div className="sh-module-content"><h2>{title}</h2><p className="sh-subtle">{description}</p>
   {details}
   <div className="sh-later"><LockKeyhole size={19}/><div><strong>Configuração em preparação</strong><p>Os dados apresentados são reais. Os comandos que faltam serão ligados à Shayon e validados antes de permitir alterações.</p></div></div>
  </div>;
 }

 return <main className="wrap sh-panel">
  <div className="sh-heading">
   <div><Link href="/servidores" className="sh-back"><ArrowLeft size={15}/> Todos os servidores</Link>
    <div className="eyebrow">SHAYON CONTROL CENTER</div>
    <h1>{serverName||'O teu servidor'}<span> ♡</span></h1>
    <p>Gerir as funcionalidades da Shayon neste servidor.</p></div>
   <button className="sh-refresh" onClick={()=>void refresh()} disabled={loading||saving}><RefreshCw size={15}/> Atualizar</button>
  </div>
  {loading&&<div className="sh-notice">A carregar configurações reais…</div>}
  {error&&<div className="sh-notice sh-error" role="alert">{error}</div>}
  {info&&<div className="sh-notice sh-success" role="status"><CheckCircle2 size={17}/>{info}</div>}
  {modules&&!loading&&<div className="sh-frame">
   <nav className="sh-menu" aria-label="Funcionalidades">
    <span className="sh-menu-caption">CONFIGURAÇÕES</span>
    {ITEMS.map(item=><button className={'sh-menu-link '+(section===item.id?'sh-current':'')} key={item.id} onClick={()=>choose(item.id)} aria-current={section===item.id?'page':undefined}>
     <item.Icon size={17}/>{item.label}
     {['cargo_automatico','cargos_interativos','tickets','servidor_oficial','musica'].includes(item.id)&&<Clock size={12} className="sh-clock"/>}
    </button>)}
   </nav>
   <section className="sh-workspace">
    {section==='divulgacao'&&<div className="sh-module-content"><h2>Divulgação automática</h2>
     <p className="sh-subtle">A Shayon divulga o teu servidor de acordo com a configuração da rede.</p>
     {advertising&&<>
      <div className="sh-metrics"><div><span>Estado</span><strong>{advertising.ativo?'Ativa':'Pausada'}</strong></div>
       <div><span>Enviados</span><strong>{advertising.enviados}</strong></div><div><span>Recebidos</span><strong>{advertising.recebidos}</strong></div></div>
      <div className="sh-field"><label>Nome do anúncio</label><span>{advertising.nome||'Ainda sem anúncio'}</span></div>
      <div className="sh-field"><label>Canal de receção</label><span>{advertising.canal_configurado?'Configurado':'Por configurar'}</span></div>
      <div className="sh-field"><label htmlFor="sh-mode">Modo de divulgação</label>
       <select id="sh-mode" value={mode} onChange={e=>setMode(e.target.value as 'mutua'|'so_divulgar')}>
        <option value="mutua">Divulgação mútua</option><option value="so_divulgar">Apenas divulgar</option>
       </select></div>
      <button className="sh-save" onClick={()=>void save('divulgacao')} disabled={saving||mode===advertising.modo||!advertising.anuncio_configurado}>Guardar modo</button>
      <p className="sh-caption">A edição do anúncio, o convite e a ativação da rede serão acrescentados a este painel. O modo só muda quando carregas em Guardar.</p>
     </>}
    </div>}

    {section==='moderacao'&&<div className="sh-module-content"><h2>Moderação</h2>
     <p className="sh-subtle">Definições de proteção de mensagens, ligadas à base de dados do bot.</p>
     {!moderation?<p>A moderação ainda não foi configurada neste servidor.</p>:<>
      {checkbox('sh-links','Proteção de links',moderation.links_ativos,v=>setModeration({...moderation,links_ativos:v}))}
      {checkbox('sh-spam','Deteção de spam',moderation.spam_ativo,v=>setModeration({...moderation,spam_ativo:v}))}
      {checkbox('sh-delete','Apagar mensagens que infringem regras',moderation.apagar_mensagem,v=>setModeration({...moderation,apagar_mensagem:v}))}
      <div className="sh-two">
       <div className="sh-field"><label htmlFor="sh-max">Máximo de mensagens (3–20)</label><input id="sh-max" type="number" min={3} max={20} value={moderation.max_mensagens} onChange={e=>setModeration({...moderation,max_mensagens:Number(e.target.value)})}/></div>
       <div className="sh-field"><label htmlFor="sh-window">Janela de segundos (3–60)</label><input id="sh-window" type="number" min={3} max={60} value={moderation.janela_segundos} onChange={e=>setModeration({...moderation,janela_segundos:Number(e.target.value)})}/></div>
      </div>
      <div className="sh-later"><Shield size={18}/><div><strong>Punições automáticas em validação</strong><p>As opções de timeout e punição progressiva ainda necessitam de testes no Discord antes de serem disponibilizadas pelo website.</p></div></div>
      <button className="sh-save" disabled={saving} onClick={()=>void save('moderacao')}>Guardar moderação</button>
     </>}
    </div>}

    {section==='rececao'&&<div className="sh-module-content"><h2>Boas-vindas e despedidas</h2>
     <p className="sh-subtle">Ativa mensagens e personaliza os textos. Variáveis disponíveis: {'{membro}'}, {'{servidor}'} e {'{total}'}.</p>
     {!reception?<div className="sh-later"><Heart size={18}/><div><strong>Canais por configurar</strong><p>Configura os canais de entrada e saída no Discord uma vez. Depois poderás editar os textos aqui.</p></div></div>:<>
      {checkbox('sh-welcome','Enviar boas-vindas',reception.entrada_ativa,v=>setReception({...reception,entrada_ativa:v}))}
      {checkbox('sh-goodbye','Enviar despedidas',reception.saida_ativa,v=>setReception({...reception,saida_ativa:v}))}
      {checkbox('sh-mention','Mencionar o novo membro',reception.mencionar,v=>setReception({...reception,mencionar:v}))}
      <div className="sh-field"><label htmlFor="sh-welcome-text">Texto de boas-vindas</label><textarea id="sh-welcome-text" maxLength={1000} rows={5} value={reception.texto_entrada} onChange={e=>setReception({...reception,texto_entrada:e.target.value})}/></div>
      <div className="sh-field"><label htmlFor="sh-goodbye-text">Texto de despedida</label><textarea id="sh-goodbye-text" maxLength={1000} rows={5} value={reception.texto_saida} onChange={e=>setReception({...reception,texto_saida:e.target.value})}/></div>
      <button className="sh-save" disabled={saving} onClick={()=>void save('rececao')}>Guardar receção</button>
      <p className="sh-caption">Canais de entrada e saída já definidos no bot. A alteração de canais será acrescentada aqui após validação das permissões.</p>
     </>}
    </div>}

    {section==='cargo_automatico'&&placeholder('Cargo automático','Atribuição de um cargo existente a novos membros.',
     <p className="sh-fact">Cargo atual: <strong>{modules.cargo_automatico?'Configurado':'Desativado'}</strong></p>)}
    {section==='cargos_interativos'&&placeholder('Cargos interativos','Botões que permitem aos membros escolher cargos existentes.',
     <p className="sh-fact">Cargos configurados: <strong>{modules.cargos_interativos.total}</strong></p>)}
    {section==='tickets'&&placeholder('Central de tickets','Atendimento, categorias, equipa autorizada, canais privados e transcrições.',
     <div className="sh-metrics"><div><span>Central</span><strong>{modules.tickets?'Configurada':'Pendente'}</strong></div><div><span>Tickets abertos</span><strong>{modules.tickets?.tickets_abertos??'—'}</strong></div><div><span>Encerrados</span><strong>{modules.tickets?.tickets_fechados??'—'}</strong></div></div>)}
    {section==='servidor_oficial'&&placeholder('Servidor oficial','Gestão dos painéis de apresentação, regras e publicação de mensagens.',
     <p className="sh-fact">Este servidor: <strong>{modules.servidor_oficial.vinculado?'Vinculado ao servidor oficial':'Servidor normal'}</strong></p>)}
    {section==='musica'&&placeholder('Música','Módulo de voz e reprodução: ainda não implementado na versão atual do bot.')}
   </section>
  </div>}
 </main>;
}
