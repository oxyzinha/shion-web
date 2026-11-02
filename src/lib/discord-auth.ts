import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto';
import type {NextRequest} from 'next/server';
export const CLIENT_ID='1563985507996934284';
export const REDIRECT_URI='https://app-a9ad77db7684.factorai.cloud/api/auth/callback/discord';
export const COOKIE='shayon_auth';
export const STATE='shayon_oauth_state';
export const cookieOpts={httpOnly:true,secure:true,sameSite:'lax' as const,path:'/'};
export type Session={id:string;name:string;token:string;expiry:number};
export const ready=()=>Boolean(process.env.DISCORD_CLIENT_SECRET&&process.env.SHAYON_SESSION_SECRET);
function key(){
 const s=process.env.SHAYON_SESSION_SECRET;
 if(!s||s.length<32)throw Error('Missing session secret');
 return createHash('sha256').update(s).digest();
}
export function encrypt(obj:Session){
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(),iv);
 const body=Buffer.concat([cipher.update(JSON.stringify(obj),'utf8'),cipher.final()]);
 return Buffer.concat([iv,cipher.getAuthTag(),body]).toString('base64url');
}
export function read(req:NextRequest):Session|null{
 try{
  const cookie=req.cookies.get(COOKIE)?.value;
  if(!cookie||cookie.length>4096)return null;
  const data=Buffer.from(cookie,'base64url');
  if(data.length<29)return null;
  const decipher=createDecipheriv('aes-256-gcm',key(),data.subarray(0,12));
  decipher.setAuthTag(data.subarray(12,28));
  const obj=JSON.parse(Buffer.concat([decipher.update(data.subarray(28)),decipher.final()]).toString('utf8')) as Session;
  return obj.id&&obj.token&&obj.expiry>Date.now()?obj:null;
 }catch{return null;}
}
