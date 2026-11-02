'use client';
import {useEffect,useState} from 'react';
type Guild={id:string;name:string;owner:boolean};
type Settings={guild_id:string;installed:boolean;ativo:boolean;modo:string;canal_configurado:boolean;anuncio_configurado:boolean;nome:string|null;descricao:string|null;enviados:number;recebidos:number};
type State={status:'loading'|'installed'|'not_installed'|'error';data?:Settings};
export default function Servidores(){
 const [data,setData]=useState<{username:string;guilds:Guild[]}|null>(null),[error,setError]=useState('');
 const [checks,setChecks]=useState<Record<string,State>>({});
 const [saving,setSaving]=useState<string|null>(null);
 const [feedback,setFeedback]=useState<Record<string,string>>({});
 useEffect(()=>{
  let cancelled=false;
  const load=async()=>{
   try{
    const r=await fetch('/api/auth/guilds',{cache:'no-store'});
    if(r.status===401){location.replace('/entrar');return}
    const value=await r.json();
    if(!r.ok)throw Error(value.error||'Discord indisponível');
    if(cancelled)return;
    setData(value);
    for(const g of value.guilds as Guild[]){
     if(cancelled)break;
     try{
      const check=await fetch('/api/dashboard/'+g.id,{cache:'no-store'});
      const d=await check.json();
      if(cancelled)break;
      setChecks(prev=>({...prev,[g.id]:check.ok?{status:'installed',data:d}:{status:check.status===404?'not_installed':'error'}}));
     }catch{if(!cancelled)setChecks(prev=>({...prev,[g.id]:{status:'error'}}))}
    }
   }catch(e){if(!cancelled)setError(e instanceof Error?e.message:'Não foi possível carregar servidores');}
  };
  void load();
  return()=>{cancelled=true};
 },[]);
 const update=async(id:string,modo:string)=>{
  setSaving(id);
  setFeedback(p=>({...p,[id]:''}));
  try{
   const response=await fetch('/api/dashboard/'+id+'/modo',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({modo})});
   const d=await response.json();
   if(!response.ok)throw Error(d.detail||d.error||'Não foi possível guardar');
   setChecks(p=>({...p,[id]:{status:'installed',data:d}}));
   setFeedback(p=>({...p,[id]:'Modo atualizado com sucesso ♡'}));
  }catch(e){setFeedback(p=>({...p,[id]:e instanceof Error?e.message:'Erro ao guardar'}))}
  finally{setSaving(null)}
 };
 return <main className="wrap"><div className="subhero"><div className="eyebrow">SHAYON · SERVIDORES</div><h1>Os teus <em>servidores.</em></h1><p>Configuração da Divulgação com dados reais e permissões verificadas no Discord.</p></div>
 <div className="page-body">
  {error&&<div className="content-card">{error}</div>}
  {!error&&!data&&<div className="content-card">A consultar os servidores…</div>}
  {data&&<><div className="content-card"><h2>Olá, {data.username} ♡</h2>
   <p>A Shayon confirma a instalação e as tuas permissões para cada servidor. Só os servidores instalados permitem consultar ou alterar as definições.</p>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:15,marginTop:22}}>
   {data.guilds.map(g=>{const s=checks[g.id];const d=s?.data;return <div className="content-card" key={g.id} style={{margin:0}}>
    <h2 style={{fontSize:22,overflowWrap:'anywhere'}}>{g.name}</h2>
    <p style={{fontSize:12}}>{g.owner?'Proprietária/o':'Permissão de gestão confirmada'}</p>
    {!s&&<p>A verificar instalação…</p>}
    {s?.status==='not_installed'&&<p>Shayon não instalada neste servidor.</p>}
    {s?.status==='error'&&<p>Não foi possível verificar a instalação. Tenta atualizar a página.</p>}
    {d&&<><p style={{fontSize:13}}>♡ Shayon instalada · Divulgação {d.ativo?'ativa':'pausada'}</p>
     <div style={{borderTop:'1px solid #51404e',paddingTop:12}}>
      <p style={{fontSize:13}}>Anúncio: {d.anuncio_configurado?(d.nome||'Configurado'):'Não configurado'}</p>
      <p style={{fontSize:13}}>Enviados: {d.enviados} · Recebidos: {d.recebidos}</p>
      <p style={{fontSize:13}}>Canal de receção: {d.canal_configurado?'Configurado':'Por configurar'}</p>
      <label style={{display:'block',marginTop:12,marginBottom:5}}>Modo de divulgação</label>
      <select aria-label={'Modo de divulgação de '+g.name} value={d.modo} disabled={saving===g.id||!d.anuncio_configurado}
       onChange={e=>void update(g.id,e.target.value)}
       style={{width:'100%',padding:12,background:'#261b28',color:'white',border:'1px solid #795267',borderRadius:7}}>
       <option value="mutua">Divulgação mútua</option><option value="so_divulgar">Apenas divulgar</option>
      </select>
      {!d.anuncio_configurado&&<p style={{fontSize:12}}>Regista primeiro o anúncio com o comando /divulgacao registar no Discord.</p>}
      {feedback[g.id]&&<p role="status" style={{fontSize:13}}>{feedback[g.id]}</p>}
     </div>
    </>}
   </div>})}
  </div></>}
 </div></main>;
}
