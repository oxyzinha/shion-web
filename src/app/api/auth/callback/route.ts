import {NextRequest,NextResponse} from 'next/server';
import {DISCORD_API,DISCORD_CLIENT_ID,STATE_COOKIE,
 cookieOptions,discordRedirectUri,equalStates,setSession,publicSiteOrigin,stateCookieName} from '@/lib/server-auth';
export const runtime='nodejs';
export const dynamic='force-dynamic';

/** Erros por etapa; nunca incluir tokens, códigos OAuth ou segredos nos logs/URL. */
export async function GET(request:NextRequest){
 const fail=(reason:string)=>{
  console.warn('[SHAYON OAUTH] Login falhou na etapa:',reason);
  const url=new URL('/entrar',publicSiteOrigin(request));
  url.searchParams.set('erro',reason);
  const response=NextResponse.redirect(url);
  const currentName=stateCookieName(params.get('state')||'');
  if(currentName)response.cookies.set(currentName,'',{...cookieOptions(),maxAge:0});
  response.cookies.set(STATE_COOKIE,'',{...cookieOptions(),maxAge:0});
  response.headers.set('Cache-Control','no-store');
  return response;
 };
 const params=request.nextUrl.searchParams;
 if(params.has('error'))return fail('cancelado');
 if(params.has('iss') && params.get('iss')!=='https://discord.com')return fail('origem');
 const state=params.get('state')||'';
 const name=stateCookieName(state);
 const received=(name?request.cookies.get(name)?.value:'')
  ||request.cookies.get(STATE_COOKIE)?.value||'';
 const code=params.get('code')||'';
 if(!code || code.length>1024 || !equalStates(state,received)){
  // Nunca registar o estado ou o código; só identificar a razão.
  console.warn('[SHAYON OAUTH] Falha de estado:',
    !received?'cookie-ausente':'diferente');
  return fail(!received?'sessao-cookie':'sessao');
 }
 try{
  const credential=Buffer.from(
    DISCORD_CLIENT_ID+':'+(process.env.DISCORD_CLIENT_SECRET||''),'utf8'
  ).toString('base64');
  const body=new URLSearchParams({
   grant_type:'authorization_code',code,redirect_uri:discordRedirectUri(request),
  });
  const tokenResponse=await fetch(DISCORD_API+'/oauth2/token',{
   method:'POST',
   headers:{'Content-Type':'application/x-www-form-urlencoded',
    Authorization:'Basic '+credential},
   body,cache:'no-store',signal:AbortSignal.timeout(12000),
  });
  if(!tokenResponse.ok){
   // Não incluir o corpo da resposta: pode conter dados identificáveis.
   console.warn('[SHAYON OAUTH] Discord token HTTP',tokenResponse.status);
   return fail('discord-token');
  }
  const token=await tokenResponse.json() as {
   access_token?:string;refresh_token?:string;expires_in?:number;scope?:string;
  };
  if(!token.access_token || !token.refresh_token || !token.expires_in)
   return fail('token-incompleto');
  const granted=new Set((token.scope||'').split(/\s+/));
  if(!granted.has('identify') || !granted.has('guilds'))return fail('permissoes');
  const userResponse=await fetch(DISCORD_API+'/users/@me',{
   headers:{Authorization:'Bearer '+token.access_token},
   cache:'no-store',signal:AbortSignal.timeout(10000),
  });
  if(!userResponse.ok)return fail('perfil');
  const user=await userResponse.json() as {
   id?:string;username?:string;global_name?:string|null;avatar?:string|null;
  };
  if(!user.id || !user.username)return fail('perfil');
  const response=NextResponse.redirect(new URL('/dashboard',publicSiteOrigin(request)));
  setSession(response,{
   user:{id:user.id,username:user.username,global_name:user.global_name,avatar:user.avatar},
   access_token:token.access_token,refresh_token:token.refresh_token,
   expires_at:Date.now()+token.expires_in*1000,
  });
  const currentName=stateCookieName(params.get('state')||'');
  if(currentName)response.cookies.set(currentName,'',{...cookieOptions(),maxAge:0});
  response.cookies.set(STATE_COOKIE,'',{...cookieOptions(),maxAge:0});
  response.headers.set('Cache-Control','no-store');
  return response;
 }catch(error){
  console.warn('[SHAYON OAUTH] Ligação indisponível:',error instanceof Error?error.name:'erro');
  return fail('ligacao');
 }
}
