/** Convite oficial gerado com o ID público da Shayon e permissões sem Administrador. */
export const SHAYON_CLIENT_ID='1563985507996934284';
export const SHAYON_PERMISSIONS='1374661241942';
export const SHAYON_INVITE='https://discord.com/oauth2/authorize?client_id='+
 SHAYON_CLIENT_ID+'&scope=bot&permissions='+SHAYON_PERMISSIONS;
export function inviteTo(guildId?:string){
 if(!guildId || !/^[0-9]{16,21}$/.test(guildId))return SHAYON_INVITE;
 return SHAYON_INVITE+'&guild_id='+encodeURIComponent(guildId);
}
