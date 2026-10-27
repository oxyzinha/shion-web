export type ModuleStatus = 'available' | 'planned';
export type ShionModule = {slug:string;title:string;eyebrow:string;description:string;status:ModuleStatus;details:string[];icon:string};
export const modules: ShionModule[] = [
 {slug:'divulgacao',title:'Divulgação automática',eyebrow:'CRESCIMENTO',description:'Conecta comunidades através de uma rede de divulgação inteligente e configurável.',status:'available',icon:'megaphone',details:['Modo Apenas divulgar e Divulgação mútua','Intervalos de publicação controlados','Configuração de anúncios e painéis','Estatísticas de anúncios enviados e recebidos']},
 {slug:'boas-vindas',title:'Boas-vindas e despedidas',eyebrow:'COMUNIDADE',description:'Recebe novos membros com mensagens personalizadas que refletem a identidade do servidor.',status:'available',icon:'heart',details:['Mensagens e canais personalizáveis','Variáveis de membros e servidores','Pré-visualização e banner','Ativação independente de entradas e saídas']},
 {slug:'cargos',title:'Cargos automáticos',eyebrow:'AUTOMAÇÃO',description:'Facilita a organização dos membros desde o primeiro momento.',status:'available',icon:'users',details:['Atribuição automática de cargos','Respeito pela hierarquia do Discord','Integração com a verificação de membros']},
 {slug:'tickets',title:'Sistema de tickets',eyebrow:'SUPORTE',description:'Organiza pedidos de suporte, parcerias e denúncias num fluxo privado.',status:'available',icon:'ticket',details:['Categorias de suporte, erros, parcerias e denúncias','Canais privados e equipas autorizadas','Registos, transcrições e encerramento']},
 {slug:'servidor-oficial',title:'Servidor oficial',eyebrow:'GESTÃO',description:'Centraliza regras, apresentações interativas e painéis oficiais.',status:'available',icon:'shield',details:['Publicação de regras','Apresentação interativa','Atualização de mensagens e painéis existentes']},
 {slug:'automod',title:'AutoMod',eyebrow:'SEGURANÇA',description:'Ferramentas de moderação para proteger os espaços da tua comunidade.',status:'planned',icon:'shield',details:['Anti-spam e controlo de links','Proteção contra convites não autorizados','Avisos, sanções progressivas e logs']},
 {slug:'musica',title:'Música',eyebrow:'ENTRETENIMENTO',description:'Controlos de música e filas de reprodução em canais de voz.',status:'planned',icon:'music',details:['Reprodução de fontes autorizadas','Fila e controlos de áudio','Painel musical interativo']},
 {slug:'analytics',title:'Analytics',eyebrow:'INSIGHTS',description:'Compreende o crescimento e a atividade da tua comunidade.',status:'planned',icon:'chart',details:['Entradas, saídas e evolução de membros','Mensagens, imagens e canais mais ativos','Métricas de tickets e moderação']},
];
export const docs = [
 {title:'Instalação',text:'Quando o convite oficial estiver disponível, adiciona a Shion com as permissões apropriadas e escolhe os módulos que queres utilizar.'},
 {title:'Primeiros passos',text:'Abre o painel do bot no Discord e consulta as opções disponibilizadas para o teu servidor.'},
 {title:'Divulgação',text:'Seleciona o modo de participação e configura os anúncios e os canais da rede de divulgação.'},
 {title:'Boas-vindas',text:'Define os canais, ativa as mensagens pretendidas e personaliza o texto de entradas e saídas.'},
 {title:'Cargos automáticos',text:'Confirma que o cargo da Shion está acima dos cargos que deverá atribuir.'},
 {title:'Tickets',text:'Escolhe as categorias e os cargos responsáveis pelo atendimento, respeitando a privacidade dos pedidos.'},
];
