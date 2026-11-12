import Link from 'next/link';
import {ArrowRight,LockKeyhole} from 'lucide-react';
export const metadata={title:'Entrar com Discord'};
const errors:Record<string,string>={
 configuracao:'O login ainda não está disponível. Contacta o suporte da Shayon.',
 cancelado:'A autorização foi cancelada. Podes tentar novamente.',
 sessao:'A sessão de autorização expirou ou o navegador bloqueou o cookie. Abre o site diretamente e tenta novamente.',
 origem:'A origem do pedido não corresponde ao Discord. Inicia sessão novamente.',
 'discord-token':'O Discord não conseguiu confirmar a autorização. Tenta novamente com uma sessão nova.',
 'token-incompleto':'O Discord devolveu uma autorização incompleta. Tenta novamente.',
 permissoes:'É necessário autorizar o acesso ao perfil e à lista de servidores.',
 perfil:'Não conseguimos obter o teu perfil Discord. Tenta novamente.',
 ligacao:'Não foi possível contactar o Discord. Tenta novamente dentro de momentos.',
 discord:'O login não foi concluído. Tenta novamente.',
};
export default async function Entrar({searchParams}:{searchParams:Promise<{erro?:string}>}){
 const {erro}=await searchParams;
 return <main className="auth-screen"><section className="auth-panel">
 <div className="eyebrow">SHAYON ♡</div>
 <h1>Entrar no <em>painel.</em></h1>
 <p>Gere os teus servidores com a Shayon.</p>
 {erro&&<div className="auth-error" role="alert">{errors[erro]||errors.discord}
  <span className="auth-error-code">Código: {Object.hasOwn(errors,erro)?erro:'discord'}</span>
 </div>}
 <a href="/api/auth/login" className="button auth-button"><LockKeyhole size={18}/> Continuar com Discord <ArrowRight size={18}/></a>
 <small>Não pedimos a tua palavra-passe. Apenas servidores que podes gerir.</small>
 <Link href="/adicionar" className="auth-help">Ainda não tens a Shayon? Adicionar ao servidor</Link>
 </section></main>;
}