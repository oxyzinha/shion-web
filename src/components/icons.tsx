import {Megaphone,Heart,Users,Ticket,Shield,Music2,ChartNoAxesCombined,ArrowUpRight,Sparkles, Settings2,BookOpen,Activity} from 'lucide-react';
export function ModuleIcon({name,size=23}:{name:string,size?:number}){
 const icons:Record<string,typeof Heart> = {megaphone:Megaphone,heart:Heart,users:Users,ticket:Ticket,shield:Shield,music:Music2,chart:ChartNoAxesCombined};
 const Icon = icons[name] || Sparkles;
 return <Icon size={size} strokeWidth={1.65}/>;
}
export {ArrowUpRight,Settings2,BookOpen,Activity};
