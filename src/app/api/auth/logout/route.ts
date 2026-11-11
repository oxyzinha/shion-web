import {NextRequest,NextResponse} from 'next/server';
import {clearSession,sameOrigin} from '@/lib/server-auth';
export const runtime='nodejs';
export async function POST(request:NextRequest){
 if(!sameOrigin(request))return NextResponse.json({error:'Origem inválida'},{status:403});
 const response=NextResponse.json({ok:true});
 clearSession(response);
 return response;
}