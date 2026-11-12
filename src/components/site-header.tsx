'use client';
import Link from 'next/link';
import {Menu,X} from 'lucide-react';
import {useState} from 'react';
const links=[
 ['Início','/'],
 ['Funcionalidades','/funcionalidades'],
 ['Adicionar','/adicionar'],
 ['Painel','/dashboard'],
];
export function Header(){
 const [open,setOpen]=useState(false);
 return <header className="header"><div className="wrap head-inner">
  <Link href="/" className="brand" onClick={()=>setOpen(false)}>
   <img src="/shion-icon.png" alt="" className="brand-avatar"/> SHAYON <span className="brand-heart">♡</span>
  </Link>
  <nav aria-label="Navegação principal" className={'nav '+(open?'nav-open':'')}>
   {links.map(([title,href])=><Link key={href} href={href} onClick={()=>setOpen(false)}>{title}</Link>)}
  </nav>
  <Link className="button button-small header-cta" href="/dashboard">Gerir servidores</Link>
  <button className="menu-btn" aria-label={open?'Fechar menu':'Abrir menu'} aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{open?<X/>:<Menu/>}</button>
 </div></header>;
}
export function Footer(){
 return <footer className="footer"><div className="wrap footer-inner">
  <div><div className="brand"><img src="/shion-icon.png" alt="" className="brand-avatar"/> SHAYON ♡</div><p>O teu universo. A tua comunidade.</p></div>
  <div className="footer-links"><Link href="/adicionar">Adicionar bot</Link><Link href="/privacidade">Privacidade</Link></div>
  <small>© {new Date().getFullYear()} Shayon.</small>
 </div></footer>;
}