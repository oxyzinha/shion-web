import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
export const metadata={title:'Atualizações',description:'Evolução verificada das funcionalidades da Shayon e do website.'};
const updates=[
 {date:'23 novembro 2026',title:'Mensagens oficiais e experiência Dark Rose',
  details:'Reorganização dos textos da apresentação, ajuda, anúncios, painéis e documentação. Correção do banner oficial que faltava no alojamento do bot.'},
 {date:'19 novembro 2026',title:'Crescimento inteligente e catálogo público',
  details:'Pesquisa por interesses, prioridade a anúncios com menos exposição recente, páginas partilháveis e métricas agregadas. Nenhuma comunidade aparece publicamente sem autorização do respetivo administrador.'},
 {date:'novembro 2026',title:'Painel Discord e monitorização privada',
  details:'Edição das configurações por servidor, autenticação Discord, monitorização da Shayon e proteção das funções reservadas à proprietária.'},
];
export default function Page(){return <main className="wrap">
 <section className="subhero"><div className="eyebrow">SHAYON · CHANGELOG</div>
  <h1>Novidades da <em>Shayon.</em></h1>
  <p>O que mudou realmente no bot e no website — sem apresentar ideias futuras como funções concluídas.</p>
 </section>
 <div className="page-body timeline">{updates.map(update=><section className="timeline-item" key={update.date}>
  <div className="eyebrow">{update.date}</div><h3>{update.title}</h3><p>{update.details}</p>
 </section>)}
 <Link href="/roadmap" className="text-link">O que ainda está por fazer <ArrowRight size={16}/></Link></div>
 </main>}
