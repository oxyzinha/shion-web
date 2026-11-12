'use client';
import Link from 'next/link';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {ArrowRight,ArrowUpRight,Check,ChevronRight,Command,ExternalLink,LockKeyhole,
 LogOut,RefreshCw,Save,Server,Settings2,ShieldCheck,Users,X} from 'lucide-react';
import {inviteTo,SHAYON_INVITE} from '@/lib/links';
import {OwnerMonitor} from '@/components/owner-monitor';

type Guild={id:string;name:string;installed:boolean;owner:boolean};
type FieldKind='bool'|'int'|'text'|'channel'|'role'|'roles'|'choice'|'role_items'|'official_pages';
type Field={key:string;label:string;type:FieldKind;description?:string;min?:number;max?:number;options?:string[];channelType?:number};
type SectionId='divulgacao'|'moderacao'|'rececao'|'cargos_automaticos'|'cargos_interativos'|'tickets'|'personalidade'|'analytics'|'musica'|'oficial';
type Section={id:SectionId;title:string;description:string;editable:boolean};
type Option={id:string;name:string;type?:number};
type Editor={
 guild_id:string;settings:Record<string,Record<string,unknown>>;
 sections:Section[];options:{channels:Option[];roles:Option[];support_roles?:Option[]};
 limits:{role_panel_requires_publish:boolean;ticket_panel_requires_publish:boolean;analytics_delay_seconds:number}
};
type Session={authenticated:boolean;user?:{id:string;username:string;global_name?:string|null}};
type Owner={official_guild_id:string|null;paused:boolean;can_manage:boolean};
type Area='servidores'|'geral'|'comunidade'|'gestao'|'extras'|'dona';
const GROUPS=[
 {id:'comunidade' as const,title:'Comunidade',description:'Receção, tickets e divulgação.',modules:['rececao','tickets','divulgacao'] as SectionId[]},
 {id:'gestao' as const,title:'Gestão',description:'Moderação e cargos.',modules:['moderacao','cargos_automaticos','cargos_interativos'] as SectionId[]},
 {id:'extras' as const,title:'Extras',description:'Personalidade, música e estatísticas.',modules:['personalidade','musica','analytics'] as SectionId[]},
];
const FIELDS:Record<SectionId,Field[]>={
 divulgacao:[
  {key:'ativo',label:'Participar na rede de divulgação',type:'bool'},
  {key:'modo',label:'Modo de divulgação',type:'choice',options:['mutua','so_divulgar'],description:'Mútua: envia e recebe anúncios. Apenas divulgar: não recebe anúncios.'},
  {key:'canal_id',label:'Canal para receber anúncios',type:'channel',channelType:0},
  {key:'nome',label:'Nome do servidor no anúncio',type:'text',max:60},
  {key:'descricao',label:'Descrição do anúncio',type:'text',max:350},
  {key:'convite',label:'Convite Discord do próprio servidor',type:'text',max:200,description:'Tem de ser um link HTTPS do Discord e pertencer a este servidor.'},
 ],
 moderacao:[
  {key:'spam_ativo',label:'Anti-spam',type:'bool'},
  {key:'spam_repetido_ativo',label:'Detetar mensagens repetidas',type:'bool'},
  {key:'max_mensagens',label:'Máximo de mensagens',type:'int',min:3,max:20},
  {key:'janela_segundos',label:'Janela anti-spam (segundos)',type:'int',min:3,max:60},
  {key:'links_ativos',label:'Moderar links',type:'bool'},
  {key:'links_aprovacao',label:'Enviar links para aprovação',type:'bool'},
  {key:'apagar_mensagem',label:'Apagar mensagens bloqueadas',type:'bool'},
  {key:'timeout_minutos',label:'Timeout inicial (minutos)',type:'int',min:0,max:40320},
  {key:'punicao_progressiva',label:'Punições progressivas',type:'bool'},
  {key:'canal_logs',label:'Canal de logs',type:'channel',channelType:0},
  {key:'palavras',label:'Palavras bloqueadas — uma por linha',type:'text',max:1200},
 ],
 rececao:[
  {key:'entrada_ativa',label:'Boas-vindas ativas',type:'bool'},
  {key:'saida_ativa',label:'Despedidas ativas',type:'bool'},
  {key:'mencionar',label:'Mencionar membros nas boas-vindas',type:'bool'},
  {key:'canal_entrada_id',label:'Canal de boas-vindas',type:'channel',channelType:0},
  {key:'canal_saida_id',label:'Canal de despedidas',type:'channel',channelType:0},
  {key:'texto_entrada',label:'Mensagem de boas-vindas',type:'text',max:1000},
  {key:'texto_saida',label:'Mensagem de despedida',type:'text',max:1000},
 ],
 cargos_automaticos:[
  {key:'role_id',label:'Cargo atribuído à entrada',type:'role',description:'Apenas cargos existentes, abaixo da Shayon e sem poderes administrativos.'},
 ],
 cargos_interativos:[
  {key:'itens',label:'Cargos disponíveis no painel',type:'role_items',description:'Depois de guardar, republica o painel para que os botões novos apareçam.'},
 ],
 tickets:[
  {key:'ativo',label:'Sistema de tickets ativo',type:'bool'},
  {key:'categoria_id',label:'Categoria para os tickets',type:'channel',channelType:4},
  {key:'painel_canal_id',label:'Canal do painel de tickets',type:'channel',channelType:0},
  {key:'logs_canal_id',label:'Canal privado das transcrições',type:'channel',channelType:0},
  {key:'cargos_ids',label:'Cargos de suporte autorizados',type:'roles'},
 ],
 personalidade:[
  {key:'tom',label:'Tom da Shayon',type:'choice',options:['automatica','provocadora','fria','fofa'],description:'Automática adapta-se ao contexto. A IA generativa requer uma chave Groq configurada no alojamento.'},
 ],
 analytics:[
  {key:'ativo',label:'Ativar recolha de estatísticas',type:'bool',description:'Contagens de mensagens, imagens e entradas/saídas. Sem guardar conteúdo, retenção até 90 dias.'},
 ],
 musica:[
  {key:'volume_padrao',label:'Volume inicial (%)',type:'int',min:0,max:100,description:'Aplica-se às novas sessões de música. Quem controla a voz continua a poder ajustar o volume no Discord.'},
 ],
 oficial:[
  {key:'paginas',label:'Páginas e canais oficiais',type:'official_pages',description:'Personaliza cada página oficial. Campos vazios preservam os textos originais da Shayon.'},
 ],
};
const DISPLAY:Record<string,string>={mutua:'Divulgação mútua',so_divulgar:'Apenas divulgar',automatica:'Automática',provocadora:'Provocadora',fria:'Fria',fofa:'Fofa'};
const COMMANDS:Partial<Record<SectionId,string>>={
 divulgacao:'!shayon divulgacao painel',
 moderacao:'!shayon moderacao diagnostico',
 rececao:'!shayon rececao painel',
 cargos_automaticos:'!shayon cargos automatico @Cargo',
 cargos_interativos:'!shayon cargos interativos publicar #canal',
 tickets:'!shayon tickets painel',
 personalidade:'!shayon falar Olá, Shayon',
 analytics:'!shayon analytics painel',
 musica:'!shayon musica',
 oficial:'!shayon oficial',
};
const PUBLISH_NOTICE:Partial<Record<SectionId,string>>={
 cargos_interativos:'Os cargos são guardados aqui, mas os novos botões só aparecem depois de publicares/atualizares o painel pelo comando Discord.',
 tickets:'As definições ficam guardadas, mas publicar ou mudar o painel visível do Discord ainda exige o comando indicado abaixo.',
 oficial:'Guarda a configuração e depois escolhe Publicar/Atualizar para enviar as alterações diretamente ao Discord. A Shayon conserva as mensagens existentes sem duplicá-las.',
};
function readableError(value:unknown):string{
 if(value && typeof value==='object' && 'detail' in value){
  const d=(value as {detail:unknown}).detail;
  if(typeof d==='string')return d;
 }
 if(value && typeof value==='object' && 'error' in value){
  const e=(value as {error:unknown}).error;
  if(typeof e==='string')return e;
 }
 return 'Ocorreu um erro ao comunicar com a Shayon.';
}
async function jsonFetch<T>(path:string,options?:RequestInit):Promise<T>{
 const r=await fetch(path,{cache:'no-store',credentials:'same-origin',...options});
 let body:unknown;
 try{body=await r.json();}catch{body={error:'Resposta inválida do serviço.'};}
 if(!r.ok)throw new Error(readableError(body));
 return body as T;
}
function RoleItems({items,roles,change}:{items:unknown;roles:Option[];change:(v:unknown)=>void}){
 const values=Array.isArray(items)?items as {role_id:string;label:string;emoji:string|null}[]:[];
 const add=()=>{const chosen=roles.find(role=>!values.some(item=>item.role_id===role.id));if(!chosen)return;
  change([...values,{role_id:chosen.id,label:chosen.name,emoji:null}]);};
 return <div className="editor-stack">
 {values.map((item,index)=><div key={item.role_id} className="role-edit-row">
  <select aria-label="Cargo existente" value={item.role_id} onChange={e=>change(values.map((v,j)=>j===index?{...v,role_id:e.target.value}:v))}>
   {roles.map(role=><option key={role.id} value={role.id}>{role.name}</option>)}
  </select>
  <input aria-label="Texto do botão" maxLength={80} value={item.label} onChange={e=>change(values.map((v,j)=>j===index?{...v,label:e.target.value}:v))}/>
  <input aria-label="Emoji" placeholder="Emoji" maxLength={100} value={item.emoji||''} onChange={e=>change(values.map((v,j)=>j===index?{...v,emoji:e.target.value||null}:v))}/>
  <button type="button" className="icon-action" onClick={()=>change(values.filter((_,j)=>j!==index))} aria-label="Remover cargo"><X size={17}/></button>
 </div>)}
 <button type="button" className="button button-outline button-small" onClick={add} disabled={values.length>=25 || roles.every(role=>values.some(item=>item.role_id===role.id))}>+ Adicionar cargo existente</button>
 </div>;
}
type OfficialPage={pagina:string;canal_id:string;titulo:string;descricao:string};
const OFFICIAL_NAMES:Record<string,string>={
 regras:'Regras da comunidade',
 shion:'Apresentação da Shayon',
 comandos:'Guia de comandos',
 estado:'Estado do projeto',
};
function OfficialPageEditor({pages,channels,change}:{
 pages:unknown;channels:Option[];change:(v:unknown)=>void
}){
 const list=Array.isArray(pages)?pages as OfficialPage[]:[];
 const update=(index:number,key:keyof OfficialPage,value:string)=>{
  change(list.map((page,i)=>i===index?{...page,[key]:value}:page));
 };
 const textChannels=channels.filter(c=>c.type===0);
 return <div className="official-pages">
 {list.map((p,i)=><section className="official-page" key={p.pagina}>
  <div className="eyebrow">{String(i+1).padStart(2,'0')} · PÁGINA OFICIAL</div>
  <h3>{OFFICIAL_NAMES[p.pagina]||p.pagina}</h3>
  <div className="config-field"><label htmlFor={'official-channel-'+p.pagina}>Canal de publicação</label>
   <select id={'official-channel-'+p.pagina} value={p.canal_id||''} onChange={e=>update(i,'canal_id',e.target.value)}>
    <option value="">Canal original da Shayon</option>
    {textChannels.map(channel=><option value={channel.id} key={channel.id}>#{channel.name}</option>)}
   </select>
  </div>
  <div className="config-field"><label htmlFor={'official-title-'+p.pagina}>Título personalizado</label>
   <input id={'official-title-'+p.pagina} maxLength={150} value={p.titulo||''} placeholder="Manter o título original" onChange={e=>update(i,'titulo',e.target.value)}/>
  </div>
  <div className="config-field"><label htmlFor={'official-description-'+p.pagina}>Conteúdo personalizado</label>
   <textarea id={'official-description-'+p.pagina} maxLength={3000} rows={5} value={p.descricao||''} placeholder="Deixa vazio para manter o conteúdo Dark Rose original" onChange={e=>update(i,'descricao',e.target.value)}/>
   <small className="field-help">Podes usar Markdown do Discord. O banner oficial e os botões existentes continuam no painel.</small>
  </div>
 </section>)}
 </div>;
}

function FieldEditor({field,value,onChange,options}:{field:Field;value:unknown;onChange:(v:unknown)=>void;options:Editor['options']}){
 const inputId='field-'+field.key;
 const channels=options.channels.filter(ch=>field.channelType===4?ch.type===4:ch.type===0||ch.type===5);
 return <div className={'config-field '+(field.type==='bool'?'config-switch':'')} key={field.key}>
  {field.type==='bool'?<label htmlFor={inputId} className="check-line"><input id={inputId} type="checkbox" checked={Boolean(value)} onChange={e=>onChange(e.target.checked)}/><span>{field.label}</span></label>
  :<label htmlFor={inputId}>{field.label}</label>}
  {field.description&&<small className="field-help">{field.description}</small>}
  {field.type==='text'&&(field.max||0)>250&&<textarea id={inputId} rows={3} maxLength={field.max} value={String(value??'')} onChange={e=>onChange(e.target.value)}/>}
  {field.type==='text'&&(field.max||0)<=250&&<input id={inputId} type="text" maxLength={field.max} value={String(value??'')} onChange={e=>onChange(e.target.value)}/>}
  {field.type==='int'&&<input id={inputId} type="number" min={field.min} max={field.max} value={typeof value==='number'?value:''} onChange={e=>onChange(e.target.value===''?0:Number(e.target.value))}/>}
  {field.type==='choice'&&<select id={inputId} value={String(value??field.options?.[0]??'')} onChange={e=>onChange(e.target.value)}>{field.options?.map(choice=><option key={choice} value={choice}>{DISPLAY[choice]||choice}</option>)}</select>}
  {field.type==='channel'&&<select id={inputId} value={String(value??'')} onChange={e=>onChange(e.target.value)}>
   <option value="">Não configurado</option>{channels.map(ch=><option key={ch.id} value={ch.id}>#{ch.name}</option>)}</select>}
  {field.type==='role'&&<select id={inputId} value={String(value??'')} onChange={e=>onChange(e.target.value)}>
   <option value="">Desativado / nenhum cargo</option>{options.roles.map(role=><option key={role.id} value={role.id}>{role.name}</option>)}</select>}
  {field.type==='roles'&&<div className="role-checklist">{(options.support_roles||options.roles).length===0&&<span className="muted">Não existem cargos de suporte disponíveis.</span>}
   {(options.support_roles||options.roles).map(role=><label key={role.id}><input type="checkbox" checked={Array.isArray(value)&&value.map(String).includes(role.id)}
    onChange={e=>onChange(e.target.checked?[...(Array.isArray(value)?value:[]),role.id]:(Array.isArray(value)?value:[]).filter(item=>String(item)!==role.id))}/>{role.name}</label>)}</div>}
  {field.type==='role_items'&&<RoleItems items={value} roles={options.roles} change={onChange}/>}
  {field.type==='official_pages'&&<OfficialPageEditor pages={value} channels={options.channels} change={onChange}/>}
 </div>;
}
export default function Dashboard(){
 const [session,setSession]=useState<Session|null>(null);
 const [guilds,setGuilds]=useState<Guild[]>([]);
 const [selectedId,setSelectedId]=useState('');
 const [area,setArea]=useState<Area>('servidores');
 const [editor,setEditor]=useState<Editor|null>(null);
 const [section,setSection]=useState<SectionId|null>(null);
 const [draft,setDraft]=useState<Record<string,unknown>>({});
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [owner,setOwner]=useState<Owner|null>(null);
 const [ownerBusy,setOwnerBusy]=useState(false);
 const [publishing,setPublishing]=useState(false);
 const [confirmPublish,setConfirmPublish]=useState(false);
 const [publishFeedback,setPublishFeedback]=useState('');

 const loadGuild=useCallback(async(id:string)=>{
  setSelectedId(id);setSection(null);setEditor(null);setArea('geral');setError('');setMessage('');
  setConfirmPublish(false);setPublishFeedback('');
  if(!id)return;
  try{const data=await jsonFetch<Editor>('/api/dashboard/'+id+'/editor');setEditor(data);}
  catch(e){setError(e instanceof Error?e.message:'Não foi possível consultar o servidor.');}
 },[]);

 const reload=useCallback(async()=>{
  setLoading(true);setError('');
  try{
   const auth=await jsonFetch<Session>('/api/auth/session');
   setSession(auth);
   if(!auth.authenticated){setGuilds([]);setOwner(null);return;}
   // A área da proprietária não depende da consulta de servidores.
   // Um módulo indisponível não deve esconder o resto do painel.
   const [guildResult, ownerResult]=await Promise.allSettled([
    jsonFetch<{guilds:Guild[]}>('/api/dashboard/summary'),
    jsonFetch<Owner>('/api/dashboard/owner/status'),
   ]);
   if(ownerResult.status==='fulfilled' && ownerResult.value.can_manage){
    setOwner(ownerResult.value);
   }else{
    setOwner(null);
   }
   if(guildResult.status==='fulfilled'){
    const found=guildResult.value.guilds;
    setGuilds(found);
    const requested=new URLSearchParams(window.location.search).get('guild');
    if(requested&&found.some(g=>g.id===requested&&g.installed)){
     window.history.replaceState(null,'',window.location.pathname);
     void loadGuild(requested);
    }
   }else{
    setGuilds([]);
    setError('Não foi possível carregar os servidores. Experimenta atualizar a lista.');
   }
  }catch(e){setError(e instanceof Error?e.message:'Erro ao carregar os servidores.');}
  finally{setLoading(false);}
 },[loadGuild]);
 useEffect(()=>{void reload();},[reload]);
 const activeGuild=useMemo(()=>guilds.find(g=>g.id===selectedId),[guilds,selectedId]);
 const activeSection=useMemo(()=>editor?.sections.find(s=>s.id===section),[editor,section]);
 const selectSection=(name:SectionId)=>{
  setSection(name);setMessage('');setError('');setConfirmPublish(false);setPublishFeedback('');
  setDraft({...editor?.settings[name]});
 };
 const goServers=()=>{setSelectedId('');setEditor(null);setSection(null);setArea('servidores');setError('');setMessage('');};
 const goArea=(next:Area)=>{setArea(next);setSection(null);setError('');setMessage('');};
 const goOwner=()=>{setSelectedId('');setEditor(null);setSection(null);setArea('dona');setError('');setMessage('');};
 const openOfficial=async()=>{
  const id=owner?.official_guild_id;
  if(!id||!owner?.can_manage)return;
  setArea('dona');setSelectedId(id);setEditor(null);setSection(null);setError('');
  try{
   const item=await jsonFetch<Editor>('/api/dashboard/'+id+'/editor');
   setEditor(item);setSection('oficial');setDraft({...item.settings.oficial});
  }catch(e){setError(e instanceof Error?e.message:'Não foi possível abrir o servidor oficial.');}
 };
 const update=(key:string,value:unknown)=>setDraft(prev=>({...prev,[key]:value}));
 const save=async()=>{
  if(!selectedId||!section)return;
  if(section==='oficial' && (!owner?.can_manage || owner.official_guild_id!==selectedId))return;
  setSaving(true);setMessage('');setError('');
  try{
   const body=Object.fromEntries(FIELDS[section].map(field=>[field.key,draft[field.key]]));
   const result=await jsonFetch<{ok:boolean;config:Record<string,unknown>;note:string}>('/api/dashboard/'+selectedId+'/editor/'+section,{
    method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),
   });
   setEditor(prev=>prev?{...prev,settings:{...prev.settings,[section]:result.config}}:prev);
   setDraft(result.config);setMessage(result.note||'Configuração guardada.');
  }catch(e){setError(e instanceof Error?e.message:'Não foi possível guardar.');}
  finally{setSaving(false);}
 };
 const publishOfficial=async()=>{
  if(!selectedId || !owner?.can_manage || owner.official_guild_id!==selectedId)return;
  if(!confirmPublish)return;
  setPublishing(true);setError('');setMessage('');setPublishFeedback('A Shayon está a verificar os quatro painéis oficiais...');
  try{
   const request=await jsonFetch<{job_id:number}>('/api/dashboard/'+selectedId+'/editor/oficial/publish',{
    method:'POST',headers:{'Content-Type':'application/json'},body:'{}',
   });
   let finalStatus='';
   for(let attempt=0;attempt<16;attempt++){
    await new Promise(resolve=>setTimeout(resolve,1600));
    const result=await jsonFetch<{status:string;detail:string}>(
     '/api/dashboard/'+selectedId+'/editor/jobs/'+request.job_id
    );
    if(result.status==='done'||result.status==='failed'){
     finalStatus=result.status;
     setPublishFeedback(result.detail||'Sem detalhes da publicação.');
     break;
    }
   }
   if(!finalStatus)setPublishFeedback('A publicação continua em processamento. Consulta o estado pelo bot se necessário.');
   if(finalStatus==='failed')setError('A Shayon encontrou um problema ao publicar. Consulta os detalhes abaixo.');
   if(finalStatus==='done')setMessage('Painéis oficiais publicados/atualizados pela Shayon. ♡');
  }catch(e){
   setError(e instanceof Error?e.message:'Não foi possível publicar os painéis.');
   setPublishFeedback('');
  }finally{
   setPublishing(false);setConfirmPublish(false);
  }
 };
 const logout=async()=>{
  await jsonFetch('/api/auth/logout',{method:'POST'}).catch(()=>null);
  setSession({authenticated:false});setGuilds([]);setEditor(null);setOwner(null);setSelectedId('');
 };
 const setGlobalPause=async(paused:boolean)=>{
  setOwnerBusy(true);setError('');
  try{
   const result=await jsonFetch<{paused:boolean}>('/api/dashboard/owner/global',{
    method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({paused}),
   });
   setOwner(prev=>prev?{...prev,paused:result.paused}:prev);
   setMessage(paused?'Rede de divulgação global pausada.':'Rede de divulgação global reativada.');
  }catch(e){setError(e instanceof Error?e.message:'Falha ao alterar o motor global.');}
  finally{setOwnerBusy(false);}
 };
 const activeGroup=GROUPS.find(g=>g.id===area);
 const heading=activeSection?.title
  ||(area==='servidores'?'Os teus servidores':area==='dona'?'A minha Shayon':area==='geral'?(activeGuild?.name||'Servidor'):activeGroup?.title||'Painel');
 if(loading)return <main className="wrap dashboard-wait"><span className="eyebrow">SHAYON</span><h1>A carregar o <em>painel...</em></h1></main>;
 if(!session?.authenticated)return <main className="auth-screen"><section className="auth-panel">
  <div className="eyebrow">SHAYON ♡</div><h1>Gerir <em>servidores.</em></h1>
  <p>Entra com Discord para configurar a Shayon.</p>
  {error&&<div className="auth-error" role="alert">{error}</div>}
  <Link className="button auth-button" href="/entrar"><LockKeyhole size={17}/> Entrar com Discord <ArrowRight size={17}/></Link>
  <Link href="/adicionar" className="auth-help">Ainda não tens a Shayon? Adicionar ao servidor</Link>
 </section></main>;
 return <main className="dashboard-shell dashboard-live dashboard-simple">
  <aside className="dashboard-sidebar simple-sidebar">
   <div className="sidebar-heading">PAINEL SHAYON</div>
   <button type="button" onClick={goServers} className={'side-link '+(area==='servidores'?'active':'')}><Server size={17}/> Servidores</button>
   {selectedId&&editor&&area!=='dona'&&<div className="sidebar-context">
    <div className="sidebar-current"><small>SERVIDOR</small><strong>{activeGuild?.name||'Servidor selecionado'}</strong></div>
    <button type="button" className={'side-link '+(area==='geral'?'active':'')} onClick={()=>goArea('geral')}>Visão geral</button>
    {GROUPS.map(group=><button key={group.id} type="button" className={'side-link '+(area===group.id?'active':'')} onClick={()=>goArea(group.id)}>
     {group.title}<ChevronRight size={15}/>
    </button>)}
   </div>}
   {owner?.can_manage&&<div className="sidebar-owner"><div className="sidebar-heading">ÁREA PRIVADA</div>
    <button type="button" className={'side-link '+(area==='dona'?'active':'')} onClick={goOwner}>
     <LockKeyhole size={15}/> A minha Shayon
    </button></div>}
   <div className="sidebar-account"><span>{session.user?.global_name||session.user?.username||'Discord'}</span>
    <button type="button" onClick={()=>void logout()}><LogOut size={15}/> Sair</button>
   </div>
  </aside>
  <div className="dashboard-main simple-main">
   <div className="dashboard-top"><div>
    <div className="eyebrow">SHAYON CONTROL CENTER</div><h1>{heading}</h1>
    {activeSection&&<button type="button" className="dashboard-back" onClick={()=>{setSection(null);setError('');setMessage('');}}>
     ← Voltar a {area==='dona'?'A minha Shayon':activeGroup?.title||'Visão geral'}</button>}
   </div>
   {area==='servidores'&&<button type="button" className="icon-action" onClick={()=>void reload()} aria-label="Atualizar servidores"><RefreshCw size={18}/></button>}
   </div>
   {error&&<div className="note simple-alert" role="alert">{error}<button type="button" className="icon-action" onClick={()=>setError('')} aria-label="Fechar"><X size={16}/></button></div>}
   {message&&<div className="notice-success" role="status"><Check size={16}/>{message}</div>}
   {area==='servidores'&&<>
    <p className="simple-subtitle">Escolhe onde queres gerir a Shayon.</p>
    <div className="simple-guilds">{guilds.map(g=><div className="simple-guild" key={g.id}>
     <span className="guild-initial">{g.name.charAt(0).toUpperCase()}</span><div className="simple-guild-info"><strong>{g.name}</strong><small>{g.installed?'Shayon instalada':'Shayon ainda não instalada'}</small></div>
     {g.installed?<button type="button" className="button button-small" onClick={()=>void loadGuild(g.id)}>Gerir <ArrowRight size={15}/></button>
     :<a className="button button-outline button-small" href={inviteTo(g.id)} target="_blank" rel="noopener noreferrer">Adicionar <ArrowUpRight size={15}/></a>}
    </div>)}</div>
    {guilds.length===0&&!error&&<div className="simple-empty">Ainda não encontramos servidores disponíveis. Confirma que tens a permissão <b>Gerir Servidor</b> no Discord.</div>}
    <Link className="simple-bottom-link" href="/adicionar">Como adicionar a Shayon <ArrowRight size={15}/></Link>
   </>}
   {area==='dona'&&!activeSection&&<div className="simple-owner-screen">
    {owner?.can_manage&&<>
     <OwnerMonitor/>
     <div className="owner-management-heading"><h3>Administração</h3><p>Configurações da própria Shayon e do servidor oficial.</p></div>
     <div className="simple-module-row" role="group" aria-label="Servidor oficial">
      <div><strong>Servidor oficial</strong><p>Regras, apresentação e páginas da Shayon.</p></div>
      <button className="button button-outline button-small" type="button" disabled={!owner.official_guild_id} onClick={()=>void openOfficial()}>Configurar <ArrowRight size={15}/></button>
     </div>
     <div className="simple-module-row simple-global">
      <div><strong>Rede global</strong><p>Estado da rede de divulgação de todos os servidores.</p><small>{owner.paused?'Pausada':'Ativa'}</small></div>
      <button type="button" className="button button-outline button-small" disabled={ownerBusy} onClick={()=>void setGlobalPause(!owner.paused)}>
       {owner.paused?'Reativar':'Pausar'}
      </button>
     </div>
    </>}
   </div>}
   {selectedId&&!editor&&area!=='servidores'&&<p className="simple-subtitle">A carregar as configurações do servidor...</p>}
   {selectedId&&editor&&area==='geral'&&!activeSection&&<>
    <p className="simple-subtitle">O que queres configurar?</p>
    <div className="simple-categories">{GROUPS.map(group=><button type="button" className="simple-category" key={group.id} onClick={()=>goArea(group.id)}>
     <span className="category-count">0{GROUPS.indexOf(group)+1}</span>
     <strong>{group.title}</strong><p>{group.description}</p><span className="category-footer">{group.modules.length} opções <ArrowRight size={16}/></span>
    </button>)}</div>
   </>}
   {selectedId&&editor&&activeGroup&&!activeSection&&<>
    <p className="simple-subtitle">{activeGroup.description}</p>
    <div className="simple-module-list">{activeGroup.modules.map(name=>{
     const mod=editor.sections.find(item=>item.id===name);
     if(!mod)return null;
     return <button type="button" className="simple-module-row" key={name} onClick={()=>selectSection(name)}>
      <div><strong>{mod.title}</strong><p>{mod.description}</p></div><ChevronRight size={19}/>
     </button>;
    })}</div>
   </>}
   {selectedId&&editor&&activeSection&&<section className="simple-settings">
    <div className="simple-settings-intro"><p>As alterações afetam apenas este servidor.</p></div>
    {section==='oficial'&&(!owner?.can_manage||owner.official_guild_id!==selectedId)?
     <div className="note">Esta área é exclusiva da proprietária.</div>
     :<div className="editor-grid simple-editor-grid">{(FIELDS[section!]||[]).map(field=><FieldEditor key={field.key} field={field} value={draft[field.key]} onChange={value=>update(field.key,value)} options={editor.options}/>)}</div>}
    {section&&PUBLISH_NOTICE[section]&&<p className="simple-field-note">{PUBLISH_NOTICE[section]}</p>}
    {section==='personalidade'&&<p className="simple-field-note">O modo de IA gratuita só fica ativo quando tiver uma chave Groq configurada no alojamento.</p>}
    {(section!=='oficial'||(owner?.can_manage&&owner.official_guild_id===selectedId))&&
    <div className="form-actions simple-save-actions"><button className="button" type="button" disabled={saving} onClick={()=>void save()}>
     <Save size={16}/>{saving?'A guardar...':'Guardar alterações'}
    </button><button className="button button-outline" type="button" onClick={()=>selectSection(section!)}>Repor</button></div>}
    {section==='oficial'&&owner?.can_manage&&owner.official_guild_id===selectedId&&<div className="official-actions">
     <h3>Publicar no Discord</h3><p>Guarda primeiro as alterações. A Shayon atualiza as páginas oficiais existentes.</p>
     {!confirmPublish?<button className="button button-outline" type="button" disabled={publishing||saving} onClick={()=>setConfirmPublish(true)}>
      Preparar publicação <ArrowUpRight size={16}/></button>
      :<div className="official-confirm"><p>Confirmas a publicação das quatro páginas oficiais?</p>
       <div className="form-actions"><button className="button" type="button" disabled={publishing} onClick={()=>void publishOfficial()}>{publishing?'A publicar...':'Confirmar publicação'}</button>
        <button className="button button-outline" type="button" disabled={publishing} onClick={()=>setConfirmPublish(false)}>Cancelar</button></div></div>}
     {publishFeedback&&<div className="note" role="status"><pre className="official-results">{publishFeedback}</pre></div>}
    </div>}
    {section&&COMMANDS[section]&&<details className="simple-discord-help"><summary>Também podes usar no Discord</summary>
     <div className="discord-command"><code>{COMMANDS[section]}</code><button type="button" className="icon-action" onClick={()=>void navigator.clipboard?.writeText(COMMANDS[section]!)} aria-label="Copiar comando"><Command size={16}/></button></div>
    </details>}
   </section>}
   <footer className="simple-dashboard-footer">Shayon ♡ · {selectedId?activeGuild?.name||'Servidor':''}</footer>
  </div>
 </main>;
}
