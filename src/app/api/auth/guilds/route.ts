import {NextRequest,NextResponse} from 'next/server';
import {read} from '@/lib/discord-auth';
export const dynamic='force-dynamic';

type Guild={id:string;name:string;owner:boolean;permissions:string};
export async function GET(req:NextRequest){
 const session=read(req);
 if(!session)return NextResponse.json({error:'Login necessário'},{status:401,headers:{'Cache-Control':'no-store'}});
 try{
  const r=await fetch('https://discord.com/api/v10/users/@me/guilds',{
   headers:{Authorization:'Bearer '+session.token},
   cache:'no-store',signal:AbortSignal.timeout(10000),
  });
  if(r.status===401||r.status===403)
   return NextResponse.json({error:'Sessão Discord expirada. Entra novamente.'},{status:401,headers:{'Cache-Control':'no-store'}});
  if(!r.ok)throw Error('Discord unavailable');
  const guilds=await r.json() as Guild[];
  if(!Array.isArray(guilds))throw Error('Invalid guild list');
  const permitted=guilds.filter(g=>{
   try{return Boolean(g.owner||(BigInt(g.permissions||'0')&(BigInt(8)|BigInt(32)))!==BigInt(0));}
   catch{return Boolean(g.owner);}
  });
  let verified=false;
  const installed=new Set<string>();
  try{
   const response=await fetch('https://app-582c58dcabe4.factorai.cloud/api/dashboard/installed',{
    headers:{Authorization:'Bearer '+session.token},
    cache:'no-store',signal:AbortSignal.timeout(15000),
   });
   if(response.ok){
    const result=await response.json() as {verified:boolean;installed_guild_ids:string[]};
    if(result.verified&&Array.isArray(result.installed_guild_ids)){
     for(const id of result.installed_guild_ids)installed.add(String(id));
     verified=true;
    }
   }
  }catch{/* Keep installation as unverified instead of incorrectly absent. */}
  return NextResponse.json({
   username:session.name,
   verified,
   guilds:permitted.map(g=>({id:g.id,name:g.name,owner:g.owner,installed:verified?installed.has(g.id):null}))
    .sort((a,b)=>a.name.localeCompare(b.name,'pt-PT'))
  },{headers:{'Cache-Control':'no-store'}});
 }catch{
  return NextResponse.json({error:'Não foi possível consultar os servidores. Tenta novamente.'},
   {status:503,headers:{'Cache-Control':'no-store'}});
 }
}
