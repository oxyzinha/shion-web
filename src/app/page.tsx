import Link from 'next/link';
import {ArrowRight,ArrowUpRight,Headphones,HeartHandshake,ShieldCheck} from 'lucide-react';
import {SHAYON_INVITE} from '@/lib/links';
export default function Home(){
 return <main className="public-home">
  <section className="wrap public-hero">
   <div className="public-hero-copy">
    <span className="eyebrow">SHAYON · DARK ROSE</span>
    <h1>Uma presença.<br/><em>Todo um universo.</em></h1>
    <p>Uma personagem com personalidade, música e ferramentas para cuidar da tua comunidade no Discord.</p>
    <div className="public-actions">
     <a href={SHAYON_INVITE} target="_blank" rel="noopener noreferrer" className="button">Adicionar ao Discord <ArrowUpRight size={17}/></a>
     <Link href="/dashboard" className="button button-outline">Gerir servidor <ArrowRight size={17}/></Link>
    </div>
   </div>
   <div className="public-portrait"><img src="/shion-icon.png" alt="Arte oficial da personagem Shayon" /></div>
  </section>
  <section className="wrap public-essentials">
   <div className="eyebrow">O ESSENCIAL</div><h2>Menos complicação.<br/><em>Mais comunidade.</em></h2>
   <div className="public-benefits">
    <div><ShieldCheck size={21}/><h3>Gestão</h3><p>Moderação, cargos e tickets num só painel.</p></div>
    <div><HeartHandshake size={21}/><h3>Comunidade</h3><p>Boas-vindas e divulgação à tua maneira.</p></div>
    <div><Headphones size={21}/><h3>Extras</h3><p>Música, estatísticas e personalidade Dark Rose.</p></div>
   </div>
  </section>
  <section className="wrap public-start">
   <div><div className="eyebrow">COMEÇAR É SIMPLES</div><h2>Três passos.<br/><em>O teu servidor.</em></h2></div>
   <div className="public-steps">
    <p><strong>01</strong> Adiciona a Shayon pelo convite oficial.</p>
    <p><strong>02</strong> Entra no painel com Discord.</p>
    <p><strong>03</strong> Escolhe o servidor e configura o que precisares.</p>
    <Link href="/adicionar" className="text-link">Ver o guia de instalação <ArrowRight size={16}/></Link>
   </div>
  </section>
 </main>;
}