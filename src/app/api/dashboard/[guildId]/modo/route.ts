import {NextRequest,NextResponse} from 'next/server';
import {read} from '@/lib/discord-auth';
export async function PUT(req:NextRequest,{params}:{params:Promise<{guildId:string}>}){
 const host='https://app-a9ad77db7684.factorai.cloud';
 if(req.headers.get('origin')!==host)return NextResponse.json({error:'Origem não autorizada'},{status:403});
 const session=read(req);
 if(!session)return NextResponse.json({error:'Inicia sessão'},{status:401});
 const {guildId}=await params;
 if(!/^[0-9]{15,22}$/.test(guildId))return NextResponse.json({error:'Servidor inválido'},{status:400});
 try{
  const body=await req.json() as {modo?:string};
  if(body.modo!=='mutua'&&body.modo!=='so_divulgar')return NextResponse.json({error:'Modo inválido'},{status:422});
  const r=await fetch('https://app-582c58dcabe4.factorai.cloud/api/dashboard/'+guildId+'/modo',{
   method:'PUT',headers:{Authorization:'Bearer '+session.token,'Content-Type':'application/json'},
   body:JSON.stringify({modo:body.modo}),cache:'no-store',signal:AbortSignal.timeout(18000)
  });
  return NextResponse.json(await r.json(),{status:r.status,headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Não foi possível atualizar o modo'},{status:503});}
}
