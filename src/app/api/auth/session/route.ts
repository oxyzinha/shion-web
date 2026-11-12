import {NextRequest,NextResponse} from 'next/server';
import {clearSession,getVerifiedSession,setSession} from '@/lib/server-auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const result=await getVerifiedSession(request);
 if(result.status==='unavailable'){
  return NextResponse.json(
   {error:'O Discord está temporariamente indisponível. Experimenta atualizar.'},
   {status:503,headers:{'Cache-Control':'no-store'}}
  );
 }
 if(result.status==='anonymous'){
  const response=NextResponse.json(
   {authenticated:false},
   {headers:{'Cache-Control':'no-store'}}
  );
  clearSession(response);
  return response;
 }
 const response=NextResponse.json(
  {authenticated:true,user:result.session.user},
  {headers:{'Cache-Control':'no-store'}}
 );
 if(result.refreshed)setSession(response,result.session);
 return response;
}
