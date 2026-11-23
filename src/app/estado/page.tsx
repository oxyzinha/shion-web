export const dynamic='force-dynamic';
export const metadata={title:'Estado do serviço · Shayon'};
const API=(process.env.SHAYON_BOT_API_URL||'https://app-582c58dcabe4.factorai.cloud').replace(/\/$/,'');
export default async function Page(){
 let connected=false;
 let checked='';
 let apiOk=false;
 try{
  const r=await fetch(API+'/api/health',{cache:'no-store',signal:AbortSignal.timeout(7000)});
  apiOk=r.ok;
  if(r.ok){
   const data=await r.json() as {bot_running?:boolean,database_present?:boolean};
   connected=Boolean(data.bot_running&&data.database_present);
  }
 }catch{}
 checked=new Date().toLocaleString('pt-PT',{timeZone:'Europe/Lisbon'});
 return <main className="wrap"><div className="subhero">
  <div className="eyebrow">SHAYON · ESTADO</div>
  <h1>Estado do <em>serviço.</em></h1>
  <p>Verificação do alojamento e do processo do bot. Não é um teste completo de cada comando Discord.</p></div>
  <div className="page-body"><div className="public-placeholder">
   <strong>{connected?'Shayon em execução':apiOk?'Bot parado ou em recuperação':'Serviço indisponível para verificação'}</strong>
   <p>{connected?'Processo do bot ativo e base de dados presente. A ligação ao gateway Discord e as permissões precisam de verificações próprias.':'Não foi possível confirmar que o bot esteja ligado neste momento. O site pode continuar acessível independentemente do Discord.'}</p>
   <small>Verificado às {checked} · A disponibilidade pode mudar depois desta consulta.</small>
  </div></div>
 </main>
}
