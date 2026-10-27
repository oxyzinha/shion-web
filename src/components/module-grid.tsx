import Link from 'next/link';
import {modules} from '@/lib/content';
import {ModuleIcon} from './icons';
import {ArrowUpRight} from 'lucide-react';
export function ModuleGrid({limit}:{limit?:number}){return <div className="module-grid">{modules.slice(0,limit).map(m=><Link href={'/funcionalidades/'+m.slug} className="module-card" key={m.slug}><div className="module-card-top"><span className="icon-tile"><ModuleIcon name={m.icon}/></span><ArrowUpRight size={19} className="muted"/></div><div className="eyebrow">{m.eyebrow}</div><h3>{m.title}</h3><p>{m.description}</p><span className={'status '+(m.status==='planned'?'status-planned':'')}>{m.status==='planned'?'Em desenvolvimento':'Disponível no bot'}</span></Link>)}</div>}
