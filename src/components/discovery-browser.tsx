'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Search,SlidersHorizontal,UsersRound} from 'lucide-react';

export type Community={
 id:string;name:string;description:string;category:string;category_label:string;
 language:string;language_label:string;tags:string[];partner:boolean;
};
export const CATEGORY_LABELS:Record<string,string>={
 jogos:'Jogos',tecnologia:'Tecnologia',roleplay:'Roleplay',
 anime:'Anime',conversa:'Conversa e amizades',arte:'Arte e criatividade',
 musica:'Música',outros:'Outros',
};
export const LANGUAGE_LABELS:Record<string,string>={
 'pt-PT':'Português (Portugal)','pt-BR':'Português (Brasil)',
 en:'English',es:'Español',outro:'Outro',
};
export function DiscoveryBrowser({communities}:{communities:Community[]}){
 const [search,setSearch]=useState('');
 const [category,setCategory]=useState('');
 const [language,setLanguage]=useState('');
 const [partner,setPartner]=useState(false);
 const visible=useMemo(()=>{
  const q=search.trim().toLocaleLowerCase('pt-PT');
  return communities.filter(item=>
   (!category||item.category===category)
   &&(!language||item.language===language)
   &&(!partner||item.partner)
   &&(!q||[item.name,item.description,...item.tags].join(' ').toLocaleLowerCase('pt-PT').includes(q))
  );
 },[communities,search,category,language,partner]);
 return <div className="discovery-explore">
  <div className="discovery-filters">
   <label className="discovery-search"><Search size={17}/><span className="sr-only">Pesquisar comunidades</span>
    <input value={search} onChange={e=>setSearch(e.target.value)} maxLength={80} placeholder="Pesquisar comunidades ou interesses..."/>
   </label>
   <label><span className="sr-only">Categoria</span><select value={category} onChange={e=>setCategory(e.target.value)}>
    <option value="">Todas as categorias</option>
    {Object.entries(CATEGORY_LABELS).map(([id,text])=><option key={id} value={id}>{text}</option>)}
   </select></label>
   <label><span className="sr-only">Idioma</span><select value={language} onChange={e=>setLanguage(e.target.value)}>
    <option value="">Todos os idiomas</option>
    {Object.entries(LANGUAGE_LABELS).map(([id,text])=><option value={id} key={id}>{text}</option>)}
   </select></label>
   <label className="discovery-partners"><input type="checkbox" checked={partner} onChange={e=>setPartner(e.target.checked)}/> Só parceiros</label>
  </div>
  <p className="discovery-count"><SlidersHorizontal size={14}/>{visible.length} {visible.length===1?'comunidade encontrada':'comunidades encontradas'} · Inscrição voluntária</p>
  {visible.length>0?<div className="discovery-grid">{visible.map((item)=><article className="discovery-card" key={item.id}>
   <div className="discovery-card-symbol" aria-hidden="true">{item.name.slice(0,1).toUpperCase()}</div>
   <div className="discovery-card-meta"><span>{item.category_label}</span><span>{item.language_label}</span>{item.partner&&<span>Parceira</span>}</div>
   <h3><Link href={'/descobrir/'+encodeURIComponent(item.id)}>{item.name}</Link></h3><p>{item.description}</p>
   {item.tags.length>0&&<div className="discovery-tags">{item.tags.map(tag=><span key={tag}>{tag}</span>)}</div>}
   <a className="discovery-join" href={'/api/descobrir/entrar/'+encodeURIComponent(item.id)} target="_blank" rel="noopener noreferrer">
    Entrar na comunidade <ArrowUpRight size={16}/>
   </a>
  </article>)}</div>
  :<div className="discovery-empty"><UsersRound size={26}/>
   <h3>{communities.length===0?'As primeiras comunidades estão a chegar':'Não encontrámos resultados com estes filtros'}</h3>
   <p>{communities.length===0?'Os administradores decidem quando querem aparecer no catálogo. Volta a visitar-nos ou adiciona a tua comunidade.':'Experimenta outra categoria ou pesquisa.'}</p>
   {communities.length>0&&<button type="button" className="button button-outline button-small" onClick={()=>{setSearch('');setCategory('');setLanguage('');setPartner(false);}}>Limpar filtros</button>}
  </div>}
 </div>;
}
