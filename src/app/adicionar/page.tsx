import Link from 'next/link';
import {ArrowUpRight,CheckCircle2,ShieldCheck,Settings2,MessageCircle} from 'lucide-react';
import {SHAYON_INVITE} from '@/lib/links';
export const metadata={title:'Adicionar Shayon ao Discord'};
export default function AddPage(){
 return <main className="wrap"><section className="subhero">
 <div className="eyebrow">INSTALAÇÃO OFICIAL</div><h1>Convida a <em>Shayon ♡</em></h1>
 <p>Adiciona a Shayon ao teu servidor e gere as funcionalidades através do site. Sem códigos estranhos, sem contas compradas e sem pedir a permissão Administrador.</p>
 <a className="button" href={SHAYON_INVITE} target="_blank" rel="noopener noreferrer">Adicionar Shayon ao servidor <ArrowUpRight size={17}/></a>
 </section><div className="page-body"><div className="steps install-steps">
 <div><span className="step-no">01</span><ShieldCheck/><h3>Escolhe o servidor</h3><p>Abre o convite oficial e inicia sessão no Discord. Seleciona um servidor teu ou onde tens permissão <b>Gerir Servidor</b>.</p></div>
 <div><span className="step-no">02</span><CheckCircle2/><h3>Autoriza a Shayon</h3><p>Confirma as permissões pedidas. O bot precisa de gerir cargos, canais, mensagens e voz para usar todos os módulos; não exige Administrador.</p></div>
 <div><span className="step-no">03</span><Settings2/><h3>Abre o painel web</h3><p>Entra com Discord no site, escolhe o servidor e personaliza os módulos. Guarda as alterações no painel de cada servidor.</p></div>
 </div><div className="detail-grid" style={{marginTop:45}}>
 <section className="content-card"><div className="eyebrow">PRIMEIRA CONFIGURAÇÃO</div><h2>Depois de adicionares</h2><p>A configuração é por servidor. Podes começar por uma única funcionalidade e ativar as restantes mais tarde.</p>
 <ol><li>Coloca o cargo da Shayon acima dos cargos que ela vai atribuir.</li>
 <li>No canal de texto, escreve <code>!shayon</code> para abrires o painel do bot.</li>
 <li>Abre <Link className="text-link" href="/dashboard">Dashboard →</Link> e seleciona o servidor.</li>
 <li>Ativa os módulos que quiseres, escolhe canais/cargos e guarda.</li>
 <li>Para publicar painéis de tickets ou cargos, utiliza os comandos correspondentes da Shayon no Discord. O servidor oficial tem uma publicação própria pelo dashboard.</li></ol>
 <p>Para chegares a pessoas de fora, configura também <b>Comunidade → Catálogo público</b> e autoriza a listagem. No modo <b>Divulgação mútua</b> a Shayon publica nos canais parceiros configurados. Não envia publicidade não solicitada por DM.</p>
 <p>O servidor oficial da Shayon tem opções próprias para a administração global. Os restantes servidores só gerem as suas configurações.</p></section>
 <aside className="content-card"><div className="eyebrow">PERMISSÕES E PROTEÇÃO</div>
 <h2>O que o convite permite?</h2><p><MessageCircle size={17}/> Enviar mensagens, embeds, anexos e entrar em canais de voz.</p>
 <p>Moderação, cargos e criação de canais ficam sujeitos às permissões e à hierarquia que definires no Discord.</p>
 <p>Não aparece o servidor na lista? Confirma que estás na conta Discord certa, que tens <b>Gerir Servidor</b> e que a Shayon está instalada. Se a autorização tiver expirado, volta a iniciar sessão no painel.</p></aside></div>
 <div className="closing" style={{paddingBottom:55}}><h2>Pronta para a conhecer?</h2>
 <a className="button" href={SHAYON_INVITE} target="_blank" rel="noopener noreferrer">Adicionar agora <ArrowUpRight size={17}/></a></div></div></main>;
}