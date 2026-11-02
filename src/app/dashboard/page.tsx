'use client';

import {useEffect,useMemo,useState} from 'react';
import {AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer} from 'recharts';

type Overview={
  servers:number;publications:number;tickets_open:number;tickets_closed:number;
  checked_at:string;daily:{date:string;count:number}[];
};
type Period=7|30|90;
const tabs=['Visão Geral','Servidores','Divulgação','Membros','Analytics','Boas-vindas','Cargos Automáticos','Tickets','AutoMod','Música','Configurações','Histórico / Logs'];

export default function Dashboard(){
 const [data,setData]=useState<Overview|null>(null);
 const [error,setError]=useState('');
 const [pending,setPending]=useState(true);
 const [tab,setTab]=useState('Visão Geral');
 const [period,setPeriod]=useState<Period>(30);

 useEffect(()=>{
   let alive=true;
   const load=async()=>{
     try{
       const response=await fetch('/api/overview',{cache:'no-store'});
       if(!response.ok)throw new Error('Serviço de dados indisponível');
       const value=await response.json() as Overview;
       if(alive){setData(value);setError('');}
     }catch{if(alive){setError('Não foi possível consultar os dados reais neste momento.');setData(null);}}
     finally{if(alive)setPending(false);}
   };
   void load();
   const interval=setInterval(()=>void load(),60000);
   return()=>{alive=false;clearInterval(interval);};
 },[]);

 const chart=useMemo(()=>data?.daily.slice(-period).map(item=>({
   day:item.date.slice(5),value:item.count
 }))??[],[data,period]);
 const metrics=[
   {label:'Servidores na rede',value:data?.servers},
   {label:'Publicações registadas',value:data?.publications},
   {label:'Tickets abertos',value:data?.tickets_open},
   {label:'Tickets encerrados',value:data?.tickets_closed},
 ];
 const overview=['Visão Geral','Analytics','Divulgação','Servidores','Tickets'].includes(tab);
 return <main className="dashboard-shell">
  <aside className="dashboard-sidebar">
   <p className="sidebar-title">SHAYON CONTROL CENTER</p>
   {tabs.map(t=><button key={t} className={'side-link '+(tab===t?'active':'')} onClick={()=>setTab(t)}>{t}</button>)}
  </aside>
  <section className="dashboard-main">
   <div className="dashboard-top"><div>
     <div className="eyebrow">SHAYON · DADOS REAIS</div>
     <h1>{tab}</h1><p>Indicadores agregados da Shayon no Discord, atualizados automaticamente.</p>
    </div><span className="demo-flag">{data?'✦ DADOS VERIFICADOS':'✦ AGUARDANDO DADOS'}</span></div>
   {pending&&<div className="content-card"><p>A consultar a Shayon…</p></div>}
   {error&&<div className="content-card"><p>{error}</p></div>}
   {!pending&&overview&&<>
    <div className="metric-grid">{metrics.map(m=><div className="metric" key={m.label}>
      <span>{m.label}</span><strong>{m.value===undefined?'—':m.value.toLocaleString('pt-PT')}</strong>
      <small>{m.value===undefined?'Indisponível':'Registo efetivo do bot'}</small>
    </div>)}</div>
    {data&&<>
     <div className="dashboard-top"><div className="periods">
      {([7,30,90] as const).map(p=><button key={p} onClick={()=>setPeriod(p)} className={p===period?'selected':''}>{p} dias</button>)}
     </div><small style={{color:'#bca6b7'}}>Publicações registadas por dia (UTC)</small></div>
     <div className="chart-panel"><h2>Divulgação da rede</h2>
      <p>Publicações registadas pela Shayon no intervalo selecionado.</p>
      <div style={{height:280,width:'100%'}}><ResponsiveContainer>
       <AreaChart data={chart}><CartesianGrid stroke="#372c38" vertical={false}/>
        <XAxis dataKey="day" tick={{fill:'#a895a7',fontSize:10}} axisLine={false}/>
        <YAxis allowDecimals={false} tick={{fill:'#a895a7',fontSize:10}}/>
        <Tooltip contentStyle={{background:'#231924',border:'1px solid #80526a',color:'#fff'}}/>
        <Area type="monotone" dataKey="value" name="Publicações" stroke="#d78ead" strokeWidth={2.5} fill="#d78ead" fillOpacity={.2}/>
       </AreaChart>
      </ResponsiveContainer></div>
     </div>
    </>}
   </>}
   {!overview&&<div className="content-card">
    <div className="eyebrow">INTEGRAÇÃO EM PREPARAÇÃO</div><h2>{tab}</h2>
    <p>Esta secção exige autenticação com Discord e permissões por servidor antes de apresentar ou alterar dados privados. Não são apresentados números fictícios.</p>
   </div>}
   <div className="note">Apenas agregados globais sem identificadores pessoais. Não existem ainda estatísticas históricas fiáveis de mensagens, imagens ou membros. O painel é de leitura e não altera as configurações do Discord.{data&&<> Última consulta: {new Date(data.checked_at).toLocaleString('pt-PT')}.</>}</div>
  </section>
 </main>;
}
