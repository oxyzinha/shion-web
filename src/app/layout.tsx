import type {Metadata} from 'next';
import './globals.css';
import SiteChrome from '@/components/site-chrome';
export const metadata:Metadata={title:{default:'SHAYON ♡ — Your community, beautifully connected.',template:'%s | SHAYON ♡'},description:'Divulgação, gestão e automação. Tudo o que a tua comunidade precisa, num só lugar.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-PT"><body><SiteChrome>{children}</SiteChrome></body></html>}
