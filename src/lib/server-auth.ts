import {createCipheriv,createDecipheriv,createHash,randomBytes,timingSafeEqual} from 'node:crypto';
import type {NextRequest,NextResponse} from 'next/server';

export const DISCORD_CLIENT_ID=process.env.DISCORD_CLIENT_ID || '1563985507996934284';
export const COOKIE_NAME='shayon_session';
export const STATE_COOKIE='shayon_oauth_state';
export const DISCORD_API='https://discord.com/api/v10';

export type DiscordUser={id:string;username:string;global_name?:string|null;avatar?:string|null};
export type Session={user:DiscordUser;access_token:string;refresh_token:string;expires_at:number};

function secretKey(){
 const secret=process.env.SHAYON_SESSION_SECRET;
 if(!secret || secret.length<32)throw new Error('SHAYON_SESSION_SECRET não configurado (mínimo 32 caracteres).');
 return createHash('sha256').update(secret,'utf8').digest();
}
export function encryptSession(payload:Session):string{
 const iv=randomBytes(12);
 const cipher=createCipheriv('aes-256-gcm',secretKey(),iv);
 const data=Buffer.concat([cipher.update(JSON.stringify(payload),'utf8'),cipher.final()]);
 return Buffer.concat([iv,cipher.getAuthTag(),data]).toString('base64url');
}
export function decryptSession(value?:string):Session|null{
 if(!value || value.length>6000)return null;
 try{
  const raw=Buffer.from(value,'base64url');
  if(raw.length<30)return null;
  const decipher=createDecipheriv('aes-256-gcm',secretKey(),raw.subarray(0,12));
  decipher.setAuthTag(raw.subarray(12,28));
  const result=JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)),decipher.final()]).toString('utf8')) as Partial<Session>;
  if(!result.user?.id || !result.access_token || !result.refresh_token || !Number.isFinite(result.expires_at))return null;
  return result as Session;
 }catch{return null;}
}
export function discordRedirectUri(request:NextRequest):string{
 const configured=process.env.SHAYON_SITE_URL;
 if(configured){
  const origin=new URL(configured);
  if(process.env.NODE_ENV==='production' && origin.protocol!=='https:')throw new Error('SHAYON_SITE_URL requer HTTPS.');
  return origin.origin+'/api/auth/callback';
 }
 if(process.env.NODE_ENV==='production')throw new Error('Configura SHAYON_SITE_URL para ativar o login Discord.');
 return request.nextUrl.origin+'/api/auth/callback';
}
export function installUrl(guildId?:string){
 const url=new URL('https://discord.com/oauth2/authorize');
 url.searchParams.set('client_id',DISCORD_CLIENT_ID);
 url.searchParams.set('scope','bot');
 url.searchParams.set('permissions','1374661241942');
 if(guildId && /^[0-9]{16,21}$/.test(guildId))url.searchParams.set('guild_id',guildId);
 return url.toString();
}
export function cookieOptions(){
 return {httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/',maxAge:60*60*24*7};
}
export function setSession(response:NextResponse,session:Session){
 response.cookies.set(COOKIE_NAME,encryptSession(session),cookieOptions());
}
export function clearSession(response:NextResponse){
 response.cookies.set(COOKIE_NAME,'',{...cookieOptions(),maxAge:0});
}
async function refresh(session:Session):Promise<Session|null>{
 const clientSecret=process.env.DISCORD_CLIENT_SECRET;
 if(!clientSecret)return null;
 const body=new URLSearchParams({
  client_id:DISCORD_CLIENT_ID,client_secret:clientSecret,
  grant_type:'refresh_token',refresh_token:session.refresh_token,
 });
 try{
  const result=await fetch(DISCORD_API+'/oauth2/token',{method:'POST',
   headers:{'Content-Type':'application/x-www-form-urlencoded'},body,cache:'no-store',signal:AbortSignal.timeout(9000)});
  if(!result.ok)return null;
  const value=await result.json() as {access_token?:string;refresh_token?:string;expires_in?:number};
  if(!value.access_token || !value.refresh_token || !value.expires_in)return null;
  return {...session,access_token:value.access_token,refresh_token:value.refresh_token,
   expires_at:Date.now()+value.expires_in*1000};
 }catch{return null;}
}
export async function getSession(request:NextRequest):Promise<{session:Session;refreshed:boolean}|null>{
 const existing=decryptSession(request.cookies.get(COOKIE_NAME)?.value);
 if(!existing)return null;
 if(existing.expires_at>Date.now()+60_000)return {session:existing,refreshed:false};
 const renewed=await refresh(existing);
 return renewed?{session:renewed,refreshed:true}:null;
}
export function sameOrigin(request:NextRequest):boolean{
 const origin=request.headers.get('origin');
 if(!origin)return false;
 try{return new URL(origin).origin===request.nextUrl.origin;}catch{return false;}
}
export function equalStates(a:string,b:string):boolean{
 const aa=Buffer.from(a),bb=Buffer.from(b);
 return aa.length===bb.length && aa.length>=24 && timingSafeEqual(aa,bb);
}
