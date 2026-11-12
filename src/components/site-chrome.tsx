'use client';
import {usePathname} from 'next/navigation';
import {Header,Footer} from '@/components/site-header';
export default function SiteChrome({children}:{children:React.ReactNode}){
 const pathname=usePathname();
 const dashboard=pathname.startsWith('/dashboard')||pathname.startsWith('/servidores');
 const auth=pathname.startsWith('/entrar');
 if(dashboard||auth)return <>{children}</>;
 return <><Header/>{children}<Footer/></>;
}
