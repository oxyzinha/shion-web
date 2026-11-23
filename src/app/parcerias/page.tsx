import Link from 'next/link';
import {ArrowRight,Handshake,Globe2,MessageCircle,ShieldCheck} from 'lucide-react';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'Parcerias de divulgação | Shayon',description:'Divulga a tua comunidade numa rede opt-in de servidores Discord e no catálogo público da Shayon.',alternates:{canonical:'/parcerias'}};
export default function PartnersPage(){
 return <main className="wrap discovery-page partnerships-page">
  <section className="discovery-intro"><div className="eyebrow">SHAYON · PARCERIAS</div>
   <h1>Comunidades que <em>crescem juntas.</em></h1>
   <p>A Shayon não pode criar alcance do nada. Ajuda servidores a encontrarem novos membros através de um catálogo público e de canais parceiros que aceitaram receber anúncios.</p>
  </section>
  <div className="partnership-cards">
   <article><Globe2/><h2>Catálogo público</h2><p>Qualquer visitante pode encontrar a tua comunidade por interesse, mesmo que não pertença aos servidores onde a Shayon está instalada.</p><Link href="/descobrir">Explorar comunidades <ArrowRight size={15}/></Link></article>
   <article><Handshake/><h2>Rede de parceiros</h2><p>No modo mútuo, autorizas um canal a receber anúncios e participas na distribuição. A rede automática está disponível; pedidos de parceria entre administradores ainda não têm uma central própria.</p><Link href="/dashboard">Gerir parceria <ArrowRight size={15}/></Link></article>
   <article><MessageCircle/><h2>Convite por pedido</h2><p>Os anúncios têm um botão para receber um convite por DM. A Shayon só o envia quando alguém clicar, nunca para todos os privados abertos.</p><Link href="/adicionar">Adicionar a Shayon <ArrowRight size={15}/></Link></article>
  </div>
  <section className="partner-steps">
   <h2>Como começar</h2>
   <ol>
    <li><strong>Adiciona a Shayon</strong><span>Usa o convite oficial e escolhe um servidor que possas gerir.</span></li>
    <li><strong>Cria o anúncio</strong><span>No painel, em Comunidade → Divulgação, guarda nome, descrição e um convite válido.</span></li>
    <li><strong>Escolhe o alcance</strong><span>Em Catálogo público, ativa a listagem. Se quiseres também receber anúncios de parceiros, usa o modo Divulgação mútua e escolhe o canal.</span></li>
    <li><strong>Acompanha resultados</strong><span>Vê aberturas dos convites e publicações. Uma abertura não representa necessariamente uma entrada no servidor.</span></li>
   </ol>
   <Link href="/dashboard" className="button">Configurar o meu servidor <ArrowRight size={16}/></Link>
  </section>
  <p className="partner-safety"><ShieldCheck size={16}/> Sem publicidade em massa para desconhecidos, sem compra de membros e sem prometer entradas garantidas.</p>
 </main>;
}
