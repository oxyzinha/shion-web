import {NextRequest,NextResponse} from 'next/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const UPSTREAM=(process.env.SHAYON_BOT_API_URL||'https://app-582c58dcabe4.factorai.cloud').replace(/\/$/,'');
export async function GET(_request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[0-9]{16,21}$/.test(id))return NextResponse.json({error:'Comunidade inválida'},{status:404});
 try{
  const reply=await fetch(UPSTREAM+'/api/discover/join/'+id,{
   redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(9000),
  });
  const location=reply.headers.get('location')||'';
  const match=location.match(/^https:\/\/discord\.gg\/([A-Za-z0-9-]{2,40})$/);
  if(reply.status!==302||!match)throw new Error('Convite não disponível.');
  return NextResponse.redirect('https://discord.gg/'+match[1],{
   status:302,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'},
  });
 }catch{
  return NextResponse.redirect(new URL('/descobrir',_request.url),{
   status:303,headers:{'Cache-Control':'no-store'},
  });
 }
}
