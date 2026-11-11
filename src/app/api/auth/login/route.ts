import {NextRequest,NextResponse} from 'next/server';
import {randomBytes} from 'node:crypto';
import {DISCORD_CLIENT_ID,STATE_COOKIE,cookieOptions,discordRedirectUri} from '@/lib/server-auth';
export const runtime='nodejs';
export async function GET(request:NextRequest){
 try{
  if(!process.env.DISCORD_CLIENT_SECRET || !process.env.SHAYON_SESSION_SECRET){
   return NextResponse.redirect(new URL('/entrar?erro=configuracao',request.url));
  }
  const state=randomBytes(24).toString('base64url');
  const redirect=discordRedirectUri(request);
  const url=new URL('https://discord.com/oauth2/authorize');
  for(const [key,value] of Object.entries({
   client_id:DISCORD_CLIENT_ID,response_type:'code',redirect_uri:redirect,
   scope:'identify guilds',state,prompt:'consent',
  }))url.searchParams.set(key,value);
  const response=NextResponse.redirect(url);
  response.cookies.set(STATE_COOKIE,state,{...cookieOptions(),maxAge:600});
  return response;
 }catch{
  return NextResponse.redirect(new URL('/entrar?erro=configuracao',request.url));
 }
}