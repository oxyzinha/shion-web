import 'server-only';
import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto';
import type {NextRequest} from 'next/server';

export const CLIENT_ID='1563985507996934284';
export const BASE='https://app-a9ad77db7684.factorai.cloud';
export const REDIRECT=BASE+'/api/auth/callback/discord';
export const SESSION_COOKIE='shayon_session';
export const STATE_COOKIE='shayon_oauth_state';
export const cookieOptions={httpOnly:true,secure:true,sameSite:'lax' as const,path:'/'};
export const noStore={'Cache-Control':'no-store, max-age=0'};

type Session={id:string;username:string;avatar:string|null;access_token:string;expires:number};
export function configured(){return !!(process.env.DISCORD_CLIENT_SECRET&&process.env.SHAYON_SESSION_SECRET);}
function secretKey():Buffer{
 const s=process.env.SHAYON_SESSION_SECRET;
 if(!s||s.length<32)throw new Error('Session secret unavailable');
 return createHash('sha256').update(s).digest();
}
export function seal(data:Session):string{
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',secretKey(),iv);
 const encrypted=Buffer.concat([cipher.update(JSON.stringify(data),'utf8'),cipher.final()]);
 return Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString('base64url');
}
export function unseal(value?:string):Session|null{
 if(!value||value.length>4096)return null;
 try{
  const raw=Buffer.from(value,'base64url');
  if(raw.length<29)return null;
  const cipher=createDecipheriv('aes-256-gcm',secretKey(),raw.subarray(0,12));
  cipher.setAuthTag(raw.subarray(12,28));
  const session=JSON.parse(Buffer.concat([cipher.update(raw.subarray(28)),cipher.final()]).toString('utf8')) as Session;
  if(!session.id||!session.access_token||session.expires<Date.now())return null;
  return session;
 }catch{return null;}
}
export function session(req:NextRequest){return unseal(req.cookies.get(SESSION_COOKIE)?.value);}
