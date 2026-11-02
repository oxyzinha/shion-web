export const dynamic='force-dynamic';
export const metadata={title:'Estado do serviço · Shayon'};
export default async function Page(){
 let connected=false;
 let checked='';
 try{
  const r=await fetch('https://app-582c58dcabe4.factorai.cloud/api/health',{cache:'no-store',signal:AbortSignal.timeout(7000)});
  if(r.ok){
   const data=await r.json() as {bot_running:boolean,database_present:boolean};
   connected=data.bot_running&&data.database_present;
  }
  checked=new Date().toLocaleString('pt-PT',{timeZone:'Europe/Lisbon'});
 }catch{checked=new Date().toLocaleString('pt-PT',{timeZone:'Europe/Lisbon'});}
 return <main className="wrap"><div className="subhero"><div className="eyebrow">SERVICE STATUS</div>
 <h1>Estado do <em>serviço.</em></h1>
 <p>Verificação real do processo Shayon e da base de dados no Gaudencio.</p></div>
 <div className="page-body"><div className="public-placeholder">
 <strong>{connected?'Shayon operacional':'Estado indisponível ou offline'}</strong>
 <p>{connected?'Bot em execução e base de dados acessível.':'Não foi possível confirmar o funcionamento da Shayon neste momento.'}</p>
 <small>Verificação: {checked} · Este teste pontual não garante disponibilidade contínua.</small>
 </div></div></main>;
}
