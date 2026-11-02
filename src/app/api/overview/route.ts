import {NextResponse} from 'next/server';
export const dynamic='force-dynamic';
export const revalidate=0;
export async function GET(){
  try {
    const response=await fetch('https://app-582c58dcabe4.factorai.cloud/api/public/overview',{
      cache:'no-store',signal:AbortSignal.timeout(8000),
    });
    if(!response.ok)throw new Error('upstream '+response.status);
    const data=await response.json();
    return NextResponse.json(data,{headers:{'Cache-Control':'no-store, max-age=0'}});
  }catch{
    return NextResponse.json({error:'Dados em tempo real indisponíveis'},{status:503,headers:{'Cache-Control':'no-store'}});
  }
}
