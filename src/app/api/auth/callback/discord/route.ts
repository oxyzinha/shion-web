import {timingSafeEqual} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {CLIENT_ID,REDIRECT_URI,COOKIE,STATE,cookieOpts,ready,encrypt} from '@/lib/discord-auth';
const origin='https://app-a9ad77db7684.factorai.cloud';
export async function GET(req:NextRequest){
 const u=new URL(req.url);
 const state=u.searchParams.get('state')||'',expected=req.cookies.get(STATE)?.value||'',code=u.searchParams.get('code')||'';
 const fail=(reason:string)=>{const r=NextResponse.redirect(origin+'/entrar?erro='+reason);r.cookies.delete(STATE);return r;};
 const a=Buffer.from(state),b=Buffer.from(expected);
 if(!ready())return fail('configuracao');
 if(!code||code.length>256||a.length===0||a.length!==b.length||!timingSafeEqual(a,b))return fail('estado');
 try{
  const params=new URLSearchParams({client_id:CLIENT_ID,client_secret:process.env.DISCORD_CLIENT_SECRET!,grant_type:'authorization_code',code,redirect_uri:REDIRECT_URI});
  const tokenRes=await fetch('https://discord.com/api/v10/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:params,signal:AbortSignal.timeout(8000),cache:'no-store'});
  if(!tokenRes.ok)return fail('autorizacao');
  const token=await tokenRes.json() as {access_token:string;expires_in:number};
  if(!token.access_token||!token.expires_in)return fail('token');
  const userRes=await fetch('https://discord.com/api/v10/users/@me',{headers:{Authorization:'Bearer '+token.access_token},signal:AbortSignal.timeout(8000),cache:'no-store'});
  if(!userRes.ok)return fail('perfil');
  const user=await userRes.json() as {id:string;username:string};
  if(!user.id||!user.username)return fail('perfil');
  const ttl=Math.min(Math.max(Math.floor(token.expires_in)-90,60),21600);
  const encrypted=encrypt({id:user.id,name:user.username,token:token.access_token,expiry:Date.now()+ttl*1000});
  const response=NextResponse.redirect(origin+'/servidores');
  response.cookies.delete(STATE);
  response.cookies.set(COOKIE,encrypted,{...cookieOpts,maxAge:ttl});
  return response;
 }catch{return fail('ligacao');}
}
