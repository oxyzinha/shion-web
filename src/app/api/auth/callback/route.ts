import {NextRequest,NextResponse} from 'next/server';
import {COOKIE_NAME,DISCORD_API,DISCORD_CLIENT_ID,STATE_COOKIE,
 cookieOptions,discordRedirectUri,equalStates,setSession} from '@/lib/server-auth';
export const runtime='nodejs';
export async function GET(request:NextRequest){
 const error=()=>NextResponse.redirect(new URL('/entrar?erro=discord',request.url));
 const state=request.nextUrl.searchParams.get('state')||'';
 const received=request.cookies.get(STATE_COOKIE)?.value||'';
 const code=request.nextUrl.searchParams.get('code')||'';
 if(!code || code.length>1024 || !equalStates(state,received))return error();
 try{
  const body=new URLSearchParams({
   client_id:DISCORD_CLIENT_ID,
   client_secret:process.env.DISCORD_CLIENT_SECRET||'',
   grant_type:'authorization_code',code,redirect_uri:discordRedirectUri(request),
  });
  const tokenResponse=await fetch(DISCORD_API+'/oauth2/token',{
   method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
   body,cache:'no-store',signal:AbortSignal.timeout(12000),
  });
  if(!tokenResponse.ok)return error();
  const token=await tokenResponse.json() as {
   access_token?:string;refresh_token?:string;expires_in?:number;scope?:string;
  };
  if(!token.access_token || !token.refresh_token || !token.expires_in ||
    !token.scope?.split(' ').includes('guilds') ||
    !token.scope?.split(' ').includes('identify'))return error();
  const meResponse=await fetch(DISCORD_API+'/users/@me',{
   headers:{Authorization:'Bearer '+token.access_token},
   cache:'no-store',signal:AbortSignal.timeout(10000),
  });
  if(!meResponse.ok)return error();
  const user=await meResponse.json() as {id?:string;username?:string;global_name?:string|null;avatar?:string|null};
  if(!user.id || !user.username)return error();
  const response=NextResponse.redirect(new URL('/dashboard',request.url));
  setSession(response,{user:{id:user.id,username:user.username,global_name:user.global_name,avatar:user.avatar},
   access_token:token.access_token,refresh_token:token.refresh_token,
   expires_at:Date.now()+token.expires_in*1000});
  response.cookies.set(STATE_COOKIE,'',{...cookieOptions(),maxAge:0});
  response.headers.set('Cache-Control','no-store');
  return response;
 }catch{return error();}
}