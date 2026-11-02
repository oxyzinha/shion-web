import {NextRequest,NextResponse} from 'next/server';
import {read} from '@/lib/discord-auth';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest,{params}:{params:Promise<{guildId:string}>}){
 const session=read(req);
 if(!session)return NextResponse.json({error:'Inicia sessão com Discord'},{status:401});
 const {guildId}=await params;
 if(!/^[0-9]{15,22}$/.test(guildId))return NextResponse.json({error:'Servidor inválido'},{status:400});
 try{
  const r=await fetch('https://app-582c58dcabe4.factorai.cloud/api/dashboard/'+guildId,{
   headers:{Authorization:'Bearer '+session.token},cache:'no-store',signal:AbortSignal.timeout(18000)
  });
  const value=await r.json();
  return NextResponse.json(value,{status:r.status,headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Serviço temporariamente indisponível'},{status:503});}
}
