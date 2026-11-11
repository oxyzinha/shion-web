import {NextRequest,NextResponse} from 'next/server';
import {clearSession,getSession,setSession} from '@/lib/server-auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const result=await getSession(request);
 if(!result){
  const response=NextResponse.json({authenticated:false},{headers:{'Cache-Control':'no-store'}});
  clearSession(response);return response;
 }
 const response=NextResponse.json({authenticated:true,user:result.session.user},
  {headers:{'Cache-Control':'no-store'}});
 if(result.refreshed)setSession(response,result.session);
 return response;
}