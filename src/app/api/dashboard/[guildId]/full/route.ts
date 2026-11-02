import {NextRequest,NextResponse} from 'next/server';
import {read} from '@/lib/discord-auth';

export const dynamic='force-dynamic';
const noStore={'Cache-Control':'no-store, max-age=0'};

export async function GET(req:NextRequest,{params}:{params:Promise<{guildId:string}>}){
 const session=read(req);
 if(!session)return NextResponse.json({error:'Inicia sessão com Discord.'},{status:401,headers:noStore});
 const {guildId}=await params;
 if(!/^\d{15,22}$/.test(guildId))
  return NextResponse.json({error:'Servidor inválido.'},{status:400,headers:noStore});
 try{
  const response=await fetch('https://app-582c58dcabe4.factorai.cloud/api/dashboard/'+guildId+'/full',{
   headers:{Authorization:'Bearer '+session.token},
   cache:'no-store',signal:AbortSignal.timeout(18000),
  });
  const body=await response.json();
  return NextResponse.json(body,{status:response.status,headers:noStore});
 }catch{
  return NextResponse.json({error:'Não foi possível contactar a Shayon. Tenta novamente.'},
    {status:503,headers:noStore});
 }
}
