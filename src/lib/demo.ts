/** DEMO ONLY. Never pass off as live Discord metrics. Replace via a server-side service. */
export const demoSeries = {
 '7d': [18,27,22,37,32,43,51],
 '30d':[14,23,20,28,34,31,40,46,43,55,59,65],
 '90d':[10,18,16,23,22,28,31,39,43,50,56,68]
} as const;
export const demoStats = [
 {label:'Membros totais',value:'2 840',delta:'+8,2%'},
 {label:'Novos membros',value:'186',delta:'+12,5%'},
 {label:'Saídas',value:'34',delta:'−2,1%'},
 {label:'Crescimento líquido',value:'+152',delta:'+10,4%'},
 {label:'Mensagens',value:'12 486',delta:'+18,7%'},
 {label:'Imagens',value:'728',delta:'+6,3%'},
 {label:'Tickets abertos',value:'14',delta:'—'},
 {label:'Tickets encerrados',value:'96',delta:'+4,3%'},
 {label:'Anúncios enviados',value:'352',delta:'+7,2%'},
 {label:'Anúncios recebidos',value:'339',delta:'+5,8%'}
];
export const demoMembers = [
 {name:'lunarose',messages:1240,images:78,joined:'02/09/2026'},
 {name:'velvetmoon',messages:982,images:42,joined:'18/09/2026'},
 {name:'nocturne',messages:744,images:63,joined:'05/10/2026'},
 {name:'violet',messages:621,images:24,joined:'11/10/2026'}
];
