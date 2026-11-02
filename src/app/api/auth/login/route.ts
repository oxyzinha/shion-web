import {randomBytes} from 'node:crypto';
import {NextResponse} from 'next/server';
import {CLIENT_ID,REDIRECT_URI,STATE,cookieOpts,ready} from '@/lib/discord-auth';
export async function GET(){
 const origin='https://app-a9ad77db7684.factorai.cloud';
 if(!ready())return NextResponse.redirect(origin+'/entrar?erro=configuracao');
 const state=randomBytes(32).toString('base64url');
 const u=new URL('https://discord.com/oauth2/authorize');
 for(const [k,v] of Object.entries({client_id:CLIENT_ID,response_type:'code',redirect_uri:REDIRECT_URI,scope:'identify guilds',state}))u.searchParams.set(k,v);
 const response=NextResponse.redirect(u);
 response.cookies.set(STATE,state,{...cookieOpts,maxAge:600});
 return response;
}
