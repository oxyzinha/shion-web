import {NextRequest,NextResponse} from 'next/server';
import {read} from '@/lib/discord-auth';
export const dynamic='force-dynamic';
const HOST='https://app-a9ad77db7684.factorai.cloud';
export async function PUT(req:NextRequest,{params}:{params:Promise<{guildId:string;module:string}>}){
 const s=read(req);if(!s)return NextResponse.json({error:'Inicia sessão.'},{status:401});
 if(req.headers.get('origin')!==HOST)return NextResponse.json({error:'Origem inválida.'},{status:403});
 const {guildId,module}=await params;
 if(!/^\d{15,22}$/.test(guildId)||!['rececao','moderacao'].includes(module))
  return NextResponse.json({error:'Operação inválida.'},{status:400});
 try{
  const body=await req.json();
  const r=await fetch('https://app-582c58dcabe4.factorai.cloud/api/dashboard/'+guildId+'/modules/'+module,{
   method:'PUT',
   headers:{'Content-Type':'application/json',Authorization:'Bearer '+s.token},
   body:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(18000),
  });
  return NextResponse.json(await r.json(),{status:r.status,headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Não foi possível guardar as definições.'},{status:503});}
}
