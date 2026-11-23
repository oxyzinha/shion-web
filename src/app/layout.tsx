import type {Metadata} from 'next';
import './globals.css';
import SiteChrome from '@/components/site-chrome';
export const metadata:Metadata={
 title:{default:'SHAYON ♡ — Descobre a tua comunidade',template:'%s | SHAYON ♡'},
 description:'Encontra servidores Discord por interesses, divulga a tua comunidade em canais parceiros autorizados e gere-a com a Shayon Dark Rose.',
 applicationName:'Shayon',
 robots:{index:true,follow:true},
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="pt-PT"><body><SiteChrome>{children}</SiteChrome></body></html>
}
