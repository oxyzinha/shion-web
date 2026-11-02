import {NextResponse} from 'next/server';
import {COOKIE,STATE} from '@/lib/discord-auth';
export async function POST(){const r=NextResponse.json({ok:true});r.cookies.delete(COOKIE);r.cookies.delete(STATE);return r;}
