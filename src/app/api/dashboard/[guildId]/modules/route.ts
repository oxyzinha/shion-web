import {NextRequest,NextResponse} from 'next/server';
import {read} from '@/lib/discord-auth';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest,{params}:{params:Promise<{guildId:string}>}){
 const s=read(req);if(!s)return NextResponse.json({error:'Inicia sessão.'},{status:401});
 const {guildId}=await params;
 if(!/^\d{15,22}$/.test(guildId))return NextResponse.json({error:'Servidor inválido.'},{status:400});
 try{
  const r=await fetch('https://app-582c58dcabe4.factorai.cloud/api/dashboard/'+guildId+'/modules',{
   headers:{Authorization:'Bearer '+s.token},cache:'no-store',signal:AbortSignal.timeout(18000),
  });
  return NextResponse.json(await r.json(),{status:r.status,headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'A Shayon está temporariamente indisponível.'},{status:503});}
}
