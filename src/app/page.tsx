import Link from 'next/link';
import {ArrowRight,ArrowUpRight,Headphones,HeartHandshake,ShieldCheck,Compass,Globe2} from 'lucide-react';
import {SHAYON_INVITE} from '@/lib/links';
export default function Home(){
 return <main className="public-home">
  <section className="wrap public-hero">
   <div className="public-hero-copy">
    <span className="eyebrow">SHAYON · DARK ROSE</span>
    <h1>Descobre pessoas.<br/><em>Encontra o teu lugar.</em></h1>
    <p>A Shayon aproxima comunidades Discord: descobre servidores por interesses, cria parcerias de divulgação e gere o teu espaço num único painel.</p>
    <div className="public-actions">
     <Link href="/descobrir" className="button">Descobrir comunidades <Compass size={17}/></Link>
     <a href={SHAYON_INVITE} target="_blank" rel="noopener noreferrer" className="button button-outline">Adicionar Shayon <ArrowUpRight size={17}/></a>
    </div>
   </div>
   <div className="public-portrait"><img src="/shion-icon.png" alt="Arte oficial da personagem Shayon" /></div>
  </section>
  <section className="wrap public-essentials">
   <div className="eyebrow">O QUE A SHAYON FAZ</div><h2>O teu universo.<br/><em>Mais perto dos outros.</em></h2>
   <div className="public-benefits">
    <div><Compass size={21}/><h3>Descobrir</h3><p>Explora servidores públicos de jogos, RP, anime e muitos outros temas.</p></div>
    <div><HeartHandshake size={21}/><h3>Divulgar</h3><p>Anúncios em canais parceiros que aceitaram participar, sem spam por DM.</p></div>
    <div><ShieldCheck size={21}/><h3>Gerir</h3><p>Tickets, moderação, cargos, música e estatísticas no painel do servidor.</p></div>
   </div>
  </section>
  <section className="wrap public-start">
   <div><div className="eyebrow">PARA ADMINISTRADORES</div><h2>Participa na rede.<br/><em>Ao teu ritmo.</em></h2></div>
   <div className="public-steps">
    <p><strong>01</strong> Adiciona a Shayon ao Discord.</p>
    <p><strong>02</strong> Guarda o anúncio da tua comunidade no painel.</p>
    <p><strong>03</strong> Decide se queres aparecer no catálogo público e/ou receber anúncios de parceiros.</p>
    <Link href="/parcerias" className="text-link">Como funciona a divulgação <ArrowRight size={16}/></Link>
   </div>
  </section>
 </main>;
}