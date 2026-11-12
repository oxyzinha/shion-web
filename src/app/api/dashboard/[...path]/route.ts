import {NextRequest,NextResponse} from 'next/server';
import {clearSession,getSession,sameOrigin,setSession} from '@/lib/server-auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const upstream=(process.env.SHAYON_BOT_API_URL||'https://app-582c58dcabe4.factorai.cloud').replace(/\/+$/,'');
const allowed=[
 /^summary$/,
 /^[0-9]{16,21}\/full$/,
 /^[0-9]{16,21}\/editor$/,
 /^[0-9]{16,21}\/editor\/(divulgacao|moderacao|rececao|cargos_automaticos|cargos_interativos|tickets|personalidade|analytics|oficial)$/,
 /^[0-9]{16,21}\/editor\/oficial\/publish$/,
 /^[0-9]{16,21}\/editor\/jobs\/[0-9]{1,10}$/,
 /^owner\/monitor$/,
 /^owner\/status$/,
 /^owner\/global$/,
];
function validate(path:string){
 return path.length<=120 && allowed.some(pattern=>pattern.test(path));
}
async function proxy(request:NextRequest,parts:string[],method:'GET'|'PUT'|'POST'){
 const path=parts.join('/');
 if(!validate(path))return NextResponse.json({error:'Rota não autorizada'},{status:404});
 if(method!=='GET' && (!sameOrigin(request) || !request.headers.get('content-type')?.startsWith('application/json')))
  return NextResponse.json({error:'Pedido inválido ou origem diferente'},{status:403});
 const session=await getSession(request);
 if(!session){
  const response=NextResponse.json({error:'Inicia sessão no Discord'},{status:401});
  clearSession(response);return response;
 }
 let body: string|undefined;
 if(method!=='GET'){
  body=await request.text();
  if(body.length>15000)return NextResponse.json({error:'Configuração demasiado grande'},{status:413});
  try{const obj=JSON.parse(body);if(!obj || typeof obj!=='object' || Array.isArray(obj))throw new Error();}
  catch{return NextResponse.json({error:'JSON inválido'},{status:400});}
 }
 try{
  const response=await fetch(upstream+'/api/dashboard/'+path,{
   method,cache:'no-store',signal:AbortSignal.timeout(13000),
   headers:{Authorization:'Bearer '+session.session.access_token,
    ...(method==='PUT'?{'Content-Type':'application/json'}:{})},
   ...(body!==undefined?{body}:{}),
  });
  const raw=await response.text();
  let value:unknown;
  try{value=JSON.parse(raw);}catch{value={error:'Resposta inválida do serviço da Shayon'};}
  const outgoing=NextResponse.json(value,{status:response.status,
   headers:{'Cache-Control':'no-store'}});
  if(session.refreshed)setSession(outgoing,session.session);
  return outgoing;
 }catch{
  return NextResponse.json({error:'Não foi possível contactar o bot. Tenta novamente.'},{status:503});
 }
}
export async function GET(request:NextRequest,context:{params:Promise<{path:string[]}>}){
 return proxy(request,(await context.params).path,'GET');
}
export async function PUT(request:NextRequest,context:{params:Promise<{path:string[]}>}){
 return proxy(request,(await context.params).path,'PUT');
}
export async function POST(request:NextRequest,context:{params:Promise<{path:string[]}>}){
 return proxy(request,(await context.params).path,'POST');
}
