'use client';
import Link from 'next/link';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {ArrowRight,ArrowUpRight,Check,ChevronRight,Command,ExternalLink,LockKeyhole,
 LogOut,RefreshCw,Save,Server,Settings2,ShieldCheck,Users,X} from 'lucide-react';
import {inviteTo,SHAYON_INVITE} from '@/lib/links';

type Guild={id:string;name:string;installed:boolean;owner:boolean};
type FieldKind='bool'|'int'|'text'|'channel'|'role'|'roles'|'choice'|'role_items';
type Field={key:string;label:string;type:FieldKind;description?:string;min?:number;max?:number;options?:string[];channelType?:number};
type SectionId='divulgacao'|'moderacao'|'rececao'|'cargos_automaticos'|'cargos_interativos'|'tickets'|'personalidade'|'analytics'|'musica'|'oficial';
type Section={id:SectionId;title:string;description:string;editable:boolean};
type Option={id:string;name:string;type?:number};
type Editor={
 guild_id:string;settings:Record<string,Record<string,unknown>>;
 sections:Section[];options:{channels:Option[];roles:Option[]};
 limits:{role_panel_requires_publish:boolean;ticket_panel_requires_publish:boolean;analytics_delay_seconds:number}
};
type Session={authenticated:boolean;user?:{id:string;username:string;global_name?:string|null}};
type Owner={official_guild_id:string|null;paused:boolean;can_manage:boolean};
const FIELDS:Record<Exclude<SectionId,'oficial'>,Field[]>={
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
 oficial:'As páginas e mensagens oficiais precisam de ser publicadas/sincronizadas pelo bot no Discord. Não é possível publicá-las a partir deste formulário.',
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
  {field.type==='roles'&&<div className="role-checklist">{options.roles.length===0&&<span className="muted">Não existem cargos atribuíveis pela Shayon.</span>}
   {options.roles.map(role=><label key={role.id}><input type="checkbox" checked={Array.isArray(value)&&value.map(String).includes(role.id)}
    onChange={e=>onChange(e.target.checked?[...(Array.isArray(value)?value:[]),role.id]:(Array.isArray(value)?value:[]).filter(item=>String(item)!==role.id))}/>{role.name}</label>)}</div>}
  {field.type==='role_items'&&<RoleItems items={value} roles={options.roles} change={onChange}/>}
 </div>;
}
export default function Dashboard(){
 const [session,setSession]=useState<Session|null>(null);
 const [guilds,setGuilds]=useState<Guild[]>([]);
 const [selectedId,setSelectedId]=useState('');
 const [editor,setEditor]=useState<Editor|null>(null);
 const [section,setSection]=useState<SectionId|null>(null);
 const [draft,setDraft]=useState<Record<string,unknown>>({});
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [owner,setOwner]=useState<Owner|null>(null);
 const [ownerBusy,setOwnerBusy]=useState(false);

 const loadGuild=useCallback(async(id:string)=>{
  setSelectedId(id);setSection(null);setEditor(null);setError('');setMessage('');
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
   const summary=await jsonFetch<{guilds:Guild[]}>('/api/dashboard/summary');
   setGuilds(summary.guilds);
   try{setOwner(await jsonFetch<Owner>('/api/dashboard/owner/status'));}catch{setOwner(null);}
  }catch(e){setError(e instanceof Error?e.message:'Erro ao carregar os servidores.');}
  finally{setLoading(false);}
 },[]);
 useEffect(()=>{void reload();},[reload]);
 const activeGuild=useMemo(()=>guilds.find(g=>g.id===selectedId),[guilds,selectedId]);
 const activeSection=useMemo(()=>editor?.sections.find(s=>s.id===section),[editor,section]);
 const selectSection=(name:SectionId)=>{
  setSection(name);setMessage('');setError('');
  setDraft({...editor?.settings[name]});
 };
 const update=(key:string,value:unknown)=>setDraft(prev=>({...prev,[key]:value}));
 const save=async()=>{
  if(!selectedId||!section||section==='oficial')return;
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
 if(loading)return <main className="wrap"><div className="subhero"><div className="eyebrow">SHAYON CONTROL CENTER</div><h1>A consultar os teus <em>servidores...</em></h1></div></main>;
 if(!session?.authenticated)return <main className="wrap"><div className="subhero"><div className="eyebrow">SHAYON CONTROL CENTER</div><h1>O poder nas <em>tuas mãos.</em></h1><p>Entra com Discord para ver apenas os servidores que podes administrar.</p><a className="button" href="/api/auth/login"><LockKeyhole size={17}/> Entrar com Discord</a><p style={{marginTop:20}}><Link className="text-link" href="/adicionar">Ainda não tens a Shayon? Aprende a adicioná-la →</Link></p>{error&&<div className="note">{error}</div>}</div></main>;
 return <main className="dashboard-shell dashboard-live">
  <aside className="dashboard-sidebar">
   <p className="sidebar-title">SHAYON CONTROL CENTER</p>
   <div className="profile-chip"><Users size={16}/><span>{session.user?.global_name||session.user?.username||'Discord'}</span></div>
   <p className="sidebar-title" style={{marginTop:26}}>OS TEUS SERVIDORES</p>
   {guilds.map(g=><button key={g.id} type="button" className={'side-link '+(selectedId===g.id?'active':'')} onClick={()=>void loadGuild(g.id)}>
    <span>{g.name}</span><span>{g.installed?'♡':'+'}</span>
   </button>)}
   {guilds.length===0&&<div className="muted" style={{padding:12,fontSize:12}}>Ainda não tens servidores disponíveis para gerir.</div>}
   <a className="side-link" href={SHAYON_INVITE} target="_blank" rel="noopener noreferrer">+ Adicionar a outro servidor <ExternalLink size={14}/></a>
   {selectedId&&editor&&<>
    <p className="sidebar-title" style={{marginTop:26}}>CONFIGURAÇÕES</p>
    <button type="button" className={'side-link '+(section===null?'active':'')} onClick={()=>{setSection(null);setError('');}}>Visão geral</button>
    {editor.sections.map(mod=><button type="button" key={mod.id} className={'side-link '+(section===mod.id?'active':'')} onClick={()=>selectSection(mod.id)}>{mod.title}<ChevronRight size={14}/></button>)}
   </>}
   {owner&&<button className={'side-link '+(section===null&&selectedId===''?'active':'')} onClick={()=>{setSelectedId('');setSection(null);setEditor(null);setError('');setMessage('');}}>♡ Gestão global</button>}
   <button className="side-link logout-button" onClick={()=>void logout()}><LogOut size={15}/> Terminar sessão</button>
  </aside>
  <div className="dashboard-main">
   <div className="dashboard-top"><div><div className="eyebrow">SHAYON · PAINEL AUTENTICADO</div>
    <h1>{activeSection?.title||activeGuild?.name||(owner?'Gestão global da Shayon':'Escolhe um servidor')}</h1>
    <p>{activeSection?.description||'Altera as configurações diretamente na Shayon, com permissões verificadas pelo Discord.'}</p></div>
    <button type="button" className="button button-outline button-small" onClick={()=>void reload()}><RefreshCw size={15}/> Atualizar lista</button>
   </div>
   {error&&<div className="note" role="alert">{error}<button className="icon-action" onClick={()=>setError('')} aria-label="Fechar aviso"><X size={15}/></button></div>}
   {message&&<div className="notice-success" role="status"><Check size={16}/>{message}</div>}
   {!selectedId&&<div className="content-card"><div className="eyebrow">COMEÇA AQUI</div><h2>Escolhe um servidor no menu.</h2>
    <p>Os servidores com Shayon instalada estão prontos para configuração. Se ainda não tiverem o bot, utiliza o convite oficial.</p>
    <div className="guild-grid">{guilds.map(g=><button type="button" className="guild-choice" key={g.id} onClick={()=>g.installed?void loadGuild(g.id):window.open(inviteTo(g.id),'_blank','noopener,noreferrer')}>
     <Server size={20}/><strong>{g.name}</strong><small>{g.installed?'Instalada · abrir gestão':'Sem Shayon · adicionar'}</small><ArrowRight size={16}/></button>)}</div>
    {owner&&<div className="owner-controls"><div className="eyebrow">APENAS PROPRIETÁRIA</div><h2>Motor global de divulgação</h2>
      <p>Esta opção controla a rede completa da Shayon, e não apenas um servidor. Afeta todas as comunidades participantes.</p>
      <div className="owner-state">Estado: <strong>{owner.paused?'Pausado':'Ativo'}</strong></div>
      <button type="button" className="button button-outline button-small" disabled={ownerBusy} onClick={()=>void setGlobalPause(!owner.paused)}>{owner.paused?'Reativar rede global':'Pausar rede global'}</button>
      <p style={{fontSize:12,marginTop:16}}>Servidor oficial: {guilds.find(g=>g.id===owner.official_guild_id)?.name||'Identificado pela Shayon'}. A edição dos canais oficiais só é feita no servidor principal.</p>
    </div>}
   </div>}
   {selectedId&&!editor&&<div className="content-card"><p>A consultar configurações... <RefreshCw size={16}/></p></div>}
   {selectedId&&editor&&!activeSection&&<>
    <div className="content-card"><div className="eyebrow">{owner?.official_guild_id===selectedId?'SERVIDOR OFICIAL':'SERVIDOR COM SHAYON'}</div>
     <h2>Escolhe o que queres configurar. ♡</h2>
     <p>As alterações são guardadas no bot. Só aparecem servidores que podes gerir; cargos e canais são verificados de novo antes de cada gravação.</p>
     <div className="module-selection">{editor.sections.map(s=><button type="button" key={s.id} className="module-choice" onClick={()=>selectSection(s.id)}>
      <Settings2 size={19}/><strong>{s.title}</strong><small>{s.description}</small><ChevronRight size={17}/></button>)}</div>
    </div>
    <div className="note"><ShieldCheck size={17}/> Para usar a Shayon noutro servidor, escolhe-o na barra lateral. O servidor oficial tem a sua própria gestão e os demais servidores nunca recebem acesso global.</div>
   </>}
   {selectedId&&editor&&activeSection&&<section className="content-card config-editor">
    <div className="eyebrow">CONFIGURAÇÃO POR SERVIDOR</div><h2>{activeSection.title}</h2><p>{activeSection.description}</p>
    {section==='oficial'?
      <><div className="note">{editor.settings.oficial?.vinculado
       ?'Este é o servidor oficial vinculado à Shayon. O bot publica regras, apresentações e painéis por comandos com verificação de permissões.'
       :'Este não é o servidor oficial. A gestão global e os painéis oficiais não estão disponíveis aqui.'}</div>
       <p>As páginas oficiais são publicadas através do comando abaixo. Não apresentamos um botão web que não consiga publicá-las.</p></>
    :<div className="editor-grid">{(FIELDS[section!]||[]).map(f=><FieldEditor key={f.key} field={f} value={draft[f.key]} onChange={v=>update(f.key,v)} options={editor.options}/>)}</div>}
    {section&&PUBLISH_NOTICE[section]&&<div className="note">{PUBLISH_NOTICE[section]}</div>}
    {section==='analytics'&&<div className="note">As estatísticas são opcionais e são recolhidas apenas depois de ativas. Pode demorar até 15 segundos para a alteração ser refletida no bot.</div>}
    {section==='personalidade'&&<div className="note">A IA generativa gratuita do Groq utiliza a chave configurada no alojamento. O site não mostra nem permite recolher chaves privadas.</div>}
    {section!=='oficial'&&<div className="form-actions">
      <button className="button" type="button" disabled={saving} onClick={()=>void save()}><Save size={16}/>{saving?'A guardar...':'Guardar alterações'}</button>
      <button className="button button-outline" type="button" onClick={()=>selectSection(section!)}><RefreshCw size={15}/> Descartar</button>
    </div>}
    {section&&COMMANDS[section]&&<div className="discord-command"><span>NO DISCORD</span><code>{COMMANDS[section]}</code><button type="button" className="icon-action" onClick={()=>void navigator.clipboard?.writeText(COMMANDS[section]!)} aria-label="Copiar comando"><Command size={15}/></button></div>}
   </section>}
   <div className="dashboard-footnote"><ShieldCheck size={14}/> Configurações reais, sem números fictícios. Algumas operações que publicam mensagens no Discord ainda exigem os comandos próprios do bot. <Link href="/adicionar">Como instalar <ArrowUpRight size={12}/></Link></div>
  </div>
 </main>;
}
