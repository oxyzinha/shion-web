'use client';

import {useCallback,useEffect,useState} from 'react';
type Guild={id:string;name:string;owner:boolean;installed:boolean|null};
type Settings={
 guild_id:string;installed:boolean;ativo:boolean;modo:string;
 canal_configurado:boolean;anuncio_configurado:boolean;
 nome:string|null;descricao:string|null;enviados:number;recebidos:number;
};
type GuildResponse={username:string;guilds:Guild[];verified:boolean};
type State={status:'loading'|'installed'|'error';data?:Settings;message?:string};

export default function Servidores(){
 const [data,setData]=useState<GuildResponse|null>(null);
 const [error,setError]=useState('');
 const [checks,setChecks]=useState<Record<string,State>>({});
 const [saving,setSaving]=useState<string|null>(null);
 const [feedback,setFeedback]=useState<Record<string,string>>({});

 const loadDetail=useCallback(async(id:string)=>{
  setChecks(previous=>({...previous,[id]:{status:'loading'}}));
  try{
   const r=await fetch('/api/dashboard/'+id,{cache:'no-store'});
   const d=await r.json();
   if(!r.ok)throw Error(typeof d.detail==='string'?d.detail:(d.error||'Não foi possível consultar este servidor'));
   setChecks(previous=>({...previous,[id]:{status:'installed',data:d}}));
  }catch(e){
   setChecks(previous=>({...previous,[id]:{
    status:'error',
    message:e instanceof Error?e.message:'Erro temporário'
   }}));
  }
 },[]);

 const load=useCallback(async()=>{
  setError('');
  const response=await fetch('/api/auth/guilds',{cache:'no-store'});
  if(response.status===401){window.location.replace('/entrar');return;}
  const body=await response.json();
  if(!response.ok)throw Error(body.error||'Não foi possível consultar os servidores');
  const value=body as GuildResponse;
  setData(value);
  setChecks({});
  for(const guild of value.guilds){
   if(guild.installed===true)void loadDetail(guild.id);
  }
 },[loadDetail]);

 useEffect(()=>{
  let cancelled=false;
  (async()=>{try{await load();}catch(e){
   if(!cancelled)setError(e instanceof Error?e.message:'Erro ao consultar servidores');
  }})();
  return()=>{cancelled=true;};
 },[load]);

 const update=async(id:string,modo:string)=>{
  setSaving(id);
  setFeedback(prev=>({...prev,[id]:''}));
  try{
   const r=await fetch('/api/dashboard/'+id+'/modo',{
    method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({modo})
   });
   const result=await r.json();
   if(!r.ok)throw Error(result.detail||result.error||'Não foi possível guardar');
   setChecks(prev=>({...prev,[id]:{status:'installed',data:result}}));
   setFeedback(prev=>({...prev,[id]:'Modo guardado na Shayon com sucesso ♡'}));
  }catch(e){
   setFeedback(prev=>({...prev,[id]:e instanceof Error?e.message:'Erro ao guardar'}));
  }finally{setSaving(null);}
 };

 return <main className="wrap">
  <div className="subhero">
   <div className="eyebrow">SHAYON · SERVIDORES</div>
   <h1>Os teus <em>servidores.</em></h1>
   <p>Servidor e permissões confirmados pelo Discord. Dados reais da divulgação.</p>
  </div>
  <div className="page-body">
   {error&&<div className="content-card"><p>{error}</p><button className="button" onClick={()=>void load().catch(e=>setError(String(e)))}>Tentar novamente</button></div>}
   {!error&&!data&&<div className="content-card">A consultar os teus servidores…</div>}
   {data&&<>
    <div className="content-card">
     <h2>Olá, {data.username} ♡</h2>
     <p>{data.verified
      ?'A Shayon identificou os servidores onde está instalada. A gestão só fica disponível para administradores autorizados.'
      :'A verificação de instalação está temporariamente indisponível. As configurações continuam protegidas.'}
     </p>
     <button className="button" onClick={()=>void load().catch(e=>setError(String(e)))}>
      Atualizar servidores
     </button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(285px,1fr))',gap:15,marginTop:20}}>
     {data.guilds.map(g=>{
      const status=checks[g.id],details=status?.data;
      return <section className="content-card" key={g.id} style={{margin:0}}>
       <h2 style={{fontSize:22,overflowWrap:'anywhere'}}>{g.name}</h2>
       <p style={{fontSize:12}}>{g.owner?'Proprietária/o':'Permissão de gestão confirmada'}</p>
       {g.installed===false&&<p>Shayon não instalada neste servidor.</p>}
       {g.installed===null&&<p>A instalação da Shayon não pôde ser verificada.</p>}
       {g.installed===true&&status?.status==='loading'&&<p>♡ Shayon instalada · A carregar definições…</p>}
       {g.installed===true&&status?.status==='error'&&<>
        <p>♡ Shayon instalada · {status.message||'Não foi possível obter as definições'}</p>
        <button className="button" onClick={()=>void loadDetail(g.id)}>Tentar novamente</button>
       </>}
       {details&&<>
        <p style={{fontSize:13}}>♡ Shayon instalada · Divulgação {details.ativo?'ativa':'pausada'}</p>
        <div style={{borderTop:'1px solid #51404e',paddingTop:12}}>
         <p style={{fontSize:13}}>Anúncio: {details.anuncio_configurado?details.nome:'Não configurado'}</p>
         <p style={{fontSize:13}}>Enviados: {details.enviados} · Recebidos: {details.recebidos}</p>
         <p style={{fontSize:13}}>Canal de receção: {details.canal_configurado?'Configurado':'Por configurar'}</p>
         <label style={{display:'block',marginTop:12,marginBottom:5}} htmlFor={'mode-'+g.id}>Modo de divulgação</label>
         <select id={'mode-'+g.id} value={details.modo}
          disabled={saving===g.id||!details.anuncio_configurado}
          onChange={e=>void update(g.id,e.target.value)}
          style={{width:'100%',padding:12,background:'#261b28',color:'white',border:'1px solid #795267',borderRadius:7}}>
          <option value="mutua">Divulgação mútua</option>
          <option value="so_divulgar">Apenas divulgar</option>
         </select>
         {!details.anuncio_configurado&&<p style={{fontSize:12}}>Regista primeiro o anúncio no Discord para ativar as opções.</p>}
         {feedback[g.id]&&<p role="status" style={{fontSize:13}}>{feedback[g.id]}</p>}
        </div>
       </>}
      </section>;
     })}
    </div>
   </>}
  </div>
 </main>;
}
