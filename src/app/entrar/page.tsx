import Link from 'next/link';
import {ArrowRight,LockKeyhole,ShieldCheck} from 'lucide-react';
export const metadata={title:'Entrar com Discord'};
export default async function Page({searchParams}:{searchParams:Promise<{erro?:string}>}){
 const {erro}=await searchParams;
 const text=erro==='configuracao'
 ?'O login ainda precisa das credenciais OAuth2 do site no alojamento. A Shayon no Discord continua a funcionar.'
 :erro?'Não foi possível concluir o login Discord. Experimenta novamente.':null;
 return <main className="wrap"><section className="subhero"><div className="eyebrow">SHAYON CONTROL CENTER</div>
 <h1>O teu servidor.<br/><em>As tuas regras.</em></h1>
 <p>Entra com a tua conta Discord para acederes aos servidores onde podes gerir a Shayon. Não pedimos a tua palavra-passe.</p></section>
 <div className="page-body detail-grid">
 <article className="content-card"><h2>Entrar com Discord ♡</h2>
 <p>Usamos a autorização oficial do Discord para identificar os teus servidores. Só mostramos opções de gestão onde tens a permissão <b>Gerir Servidor</b> e a Shayon está instalada.</p>
 {text&&<div className="note" role="alert">{text}</div>}
 <a className="button" href="/api/auth/login">Autorizar no Discord <ArrowRight size={17}/></a>
 <p style={{marginTop:20,fontSize:12}}>Ao entrar, autorizas apenas acesso ao teu perfil básico e à lista dos teus servidores. As alterações são verificadas no Discord antes de serem guardadas.</p>
 </article>
 <aside className="content-card"><div className="eyebrow">A TUA SEGURANÇA</div><h2>Controlo com permissões.</h2>
 <p><LockKeyhole size={16}/> Sessões protegidas no servidor, sem tokens no navegador.</p>
 <p><ShieldCheck size={16}/> Nada de acessos a servidores alheios.</p>
 <p>A Shayon ainda não está no teu servidor?</p><Link className="text-link" href="/adicionar">Ver como instalar →</Link>
 </aside></div></main>;
}