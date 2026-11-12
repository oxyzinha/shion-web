import {redirect} from 'next/navigation';
export default async function GuildPanel({params}:{params:Promise<{guildId:string}>}){
 const {guildId}=await params;
 const candidate=/^[0-9]{16,21}$/.test(guildId)?'?guild='+encodeURIComponent(guildId):'';
 redirect('/dashboard'+candidate);
}
