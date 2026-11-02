import {NextRequest,NextResponse} from 'next/server';
import {read} from '@/lib/discord-auth';

export const dynamic='force-dynamic';
const NO_STORE={'Cache-Control':'no-store, max-age=0'};

export async function GET(req:NextRequest){
 const session=read(req);
 if(!session)return NextResponse.json({error:'Inicia sessão com Discord.'},{status:401,headers:NO_STORE});
 try{
  const response=await fetch('https://app-582c58dcabe4.factorai.cloud/api/dashboard/summary',{
   headers:{Authorization:'Bearer '+session.token},
   cache:'no-store',signal:AbortSignal.timeout(18000),
  });
  const result=await response.json();
  if(!response.ok){
   const detail=typeof result.detail==='string'?result.detail:'Não foi possível consultar os servidores.';
   return NextResponse.json({error:detail},{status:response.status,headers:NO_STORE});
  }
  if(!result.verified||!Array.isArray(result.guilds)){
   throw new Error('A verificação de servidores está indisponível.');
  }
  return NextResponse.json({
   username:session.name,
   guilds:result.guilds,
   checked_at:result.checked_at,
   verified:true,
  },{headers:NO_STORE});
 }catch(e){
  return NextResponse.json({
   error:e instanceof Error&&e.message.includes('verificação')?e.message:'Não foi possível consultar a Shayon. Tenta novamente.',
  },{status:503,headers:NO_STORE});
 }
}
