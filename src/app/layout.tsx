import type {Metadata} from 'next';
import './globals.css';
import {Header,Footer} from '@/components/site-header';
export const metadata:Metadata={title:{default:'SHION ♡ — Your community, beautifully connected.',template:'%s | SHION ♡'},description:'Divulgação, gestão e automação. Tudo o que a tua comunidade precisa, num só lugar.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-PT"><body><Header/>{children}<Footer/></body></html>}
