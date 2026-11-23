import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {docs} from '@/lib/content';
export const metadata={title:'Centro de ajuda',description:'Instalação, catálogo público, mensagens de divulgação, permissões e dashboard Discord da Shayon.'};
const common=[
 {title:'O anúncio vai chegar a pessoas fora do meu servidor?',answer:'Sim, se houver canais de parceiros ativos ou visitantes do catálogo público. A presença no catálogo não garante novas entradas. Partilhar a ficha pública do teu servidor ajuda a trazer visitantes de fora.'},
 {title:'A Shayon envia publicidade a quem tem os privados abertos?',answer:'Não. Apenas envia convites por DM quando a pessoa pede recomendações através de !shayon descobrir ou carrega no botão de um anúncio.'},
 {title:'Porque é que o meu servidor não aparece no catálogo?',answer:'Primeiro configura a divulgação, guarda um convite válido e ativa a listagem em Comunidade → Catálogo público. A opção começa desativada por defeito, mesmo que a rede esteja ativa.'},
 {title:'O meu painel não mostra um servidor ou não guarda alterações.',answer:'Confirma que iniciaste sessão com a conta Discord com a permissão Gerir Servidor. Atualiza a página; se a autorização expirar, entra novamente. O bot tem de estar no servidor e as opções dependem das permissões reais do Discord.'},
 {title:'Porque é que a Shayon não consegue enviar mensagens ou atribuir cargos?',answer:'Confirma Ver Canal, Enviar Mensagens, Incorporar Links e Anexar Ficheiros nos canais utilizados. Para atribuir cargos, o cargo da Shayon deve estar acima deles na hierarquia do Discord.'},
 {title:'Os cliques representam novos membros?',answer:'Não. Contabilizamos aberturas de links por dia e comunidade; não são visitantes únicos nem adesões confirmadas. A origem indicada no link também não é uma prova de atribuição.'},
];
export default function Page(){return <main className="wrap">
 <section className="subhero"><div className="eyebrow">SHAYON · AJUDA</div>
  <h1>O essencial, <em>sem complicações.</em></h1>
  <p>Instala, configura e faz a tua comunidade crescer ao teu ritmo.</p>
  <Link href="/adicionar" className="button">Adicionar a Shayon <ArrowRight size={16}/></Link>
 </section>
 <div className="page-body">
  {docs.map((item,i)=><section className="content-card" key={item.title} id={'guia-'+(i+1)}>
   <div className="eyebrow">PASSO {String(i+1).padStart(2,'0')}</div>
   <h2>{item.title}</h2><p>{item.text}</p>
  </section>)}
  <section className="content-card"><div className="eyebrow">DÚVIDAS COMUNS</div>
   <h2>Respostas rápidas</h2>
   {common.map(item=><div key={item.title} className="shayon-faq">
    <h3>{item.title}</h3><p>{item.answer}</p>
   </div>)}
  </section>
  <div className="note">O dashboard altera configurações autorizadas. Algumas ações, como publicar painéis e testar canais de voz, dependem de comandos e permissões no servidor Discord. Para verificar a disponibilidade, consulta <Link href="/estado">Estado do serviço</Link>.</div>
 </div></main>}
