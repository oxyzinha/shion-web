import {NextRequest,NextResponse} from 'next/server';
import {read} from '@/lib/discord-auth';
export async function GET(req:NextRequest){
 const s=read(req);
 return NextResponse.json(s?{authenticated:true,username:s.name}:{authenticated:false},{status:s?200:401,headers:{'Cache-Control':'no-store'}});
}
