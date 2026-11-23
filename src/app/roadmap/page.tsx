import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
export const metadata={title:'Próximas melhorias',description:'O estado real do desenvolvimento da Shayon: disponível, a validar e por configurar.'};
const phases=[
 {label:'DISPONÍVEL',title:'Descoberta e gestão',content:'Catálogo público opt-in, recomendação por interesses, anúncios em canais parceiros autorizados, tickets, cargos, receção, AutoMod e dashboard com autenticação Discord.'},
 {label:'A VALIDAR',title:'Fiabilidade de ponta a ponta',content:'Testes com administradores reais, hierarquia de cargos, áudio em servidores diferentes e publicação de mensagens oficiais. As funções automatizadas são testadas, mas dependem das permissões de cada servidor.'},
 {label:'PENDENTE DE CONFIGURAÇÃO',title:'Estabilidade e inteligência',content:'Arranque automático do website quando o alojamento reinicia; configuração das credenciais Groq para respostas generativas; acompanhamento externo de disponibilidade.'},
 {label:'EM PLANEAMENTO',title:'Parcerias e expansão',content:'Pedidos de parceria entre administradores, medição mais rigorosa de entradas atribuídas e candidatura à App Directory quando a aplicação cumprir os requisitos. Sem data prometida.'},
];
export default function Page(){return <main className="wrap">
 <section className="subhero"><div className="eyebrow">SHAYON · DESENVOLVIMENTO</div>
  <h1>O que vem <em>a seguir.</em></h1>
  <p>Um resumo transparente: funcionalidades disponíveis, verificações que faltam e dependências externas.</p>
 </section>
 <div className="page-body timeline">{phases.map(item=><section key={item.label} className="timeline-item">
  <div className="eyebrow">{item.label}</div><h3>{item.title}</h3><p>{item.content}</p>
 </section>)}
 <Link className="text-link" href="/atualizacoes">Consultar atualizações <ArrowRight size={16}/></Link>
 </div>
 </main>}
