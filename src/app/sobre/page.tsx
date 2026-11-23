import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
export const metadata={title:'Sobre a Shayon',description:'Conhece a identidade Dark Rose e as funcionalidades atuais da Shayon no Discord.'};
export default function Page(){return <main className="wrap">
 <section className="subhero"><div className="eyebrow">SHAYON · DARK ROSE</div>
  <h1>Uma presença. <em>Muitas histórias.</em></h1>
  <p>A Shayon é uma personagem e um bot para ajudar pessoas a descobrirem comunidades Discord e administradores a cuidarem dos seus espaços.</p>
 </section>
 <section className="page-body content-card">
  <h2>Sweet, dark & um bocadinho imprevisível. ♡</h2>
  <p>A Shayon tem um lado provocador e irónico, outro mais frio e misterioso e um lado genuinamente fofo. A personalidade convive com ferramentas práticas de moderação, receção, tickets, cargos e música.</p>
  <p>Através do catálogo público e da rede de anúncios em canais parceiros autorizados, ajuda comunidades a serem descobertas. As sugestões por mensagem privada são enviadas apenas depois de alguém as pedir.</p>
  <p>O bot funciona com Python e discord.py. O painel Next.js está integrado com a API do bot e permite gerir as configurações dos servidores com autenticação Discord. A IA generativa requer configuração adicional do fornecedor; não é anunciada como ativa sem essa configuração.</p>
  <div className="about-official-art"><img src="/shion-banner.png" alt="Banner oficial Dark Rose da Shayon" /><p>Arte oficial da Shayon ♡</p></div>
  <Link className="text-link" href="/descobrir">Descobrir comunidades <ArrowRight size={16}/></Link>
 </section>
 </main>}
