import {NextRequest,NextResponse} from 'next/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const API=(process.env.SHAYON_BOT_API_URL||
 'https://app-582c58dcabe4.factorai.cloud').replace(/\/$/,'');
export async function GET(request:NextRequest){
 const interests=request.nextUrl.searchParams.get('interests')||'';
 if(interests.length>100 || interests.split(',').filter(Boolean).length>3){
  return NextResponse.json({error:'Escolhe até três interesses.'},{status:422});
 }
 try{
  const params=new URLSearchParams();
  if(interests)params.set('interests',interests);
  const response=await fetch(API+'/api/discover?'+params.toString(),{
   cache:'no-store',signal:AbortSignal.timeout(8500),
  });
  if(!response.ok)return NextResponse.json(
   {error:'Não foi possível encontrar recomendações.'},
   {status:response.status===422?422:503}
  );
  const result=await response.json();
  return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch{
  return NextResponse.json({error:'Catálogo indisponível neste momento.'},{status:503});
 }
}
