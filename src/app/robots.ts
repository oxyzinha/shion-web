import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots{
 return {rules:{userAgent:'*',allow:['/','/descobrir','/parcerias','/adicionar'],disallow:['/dashboard','/api/','/entrar','/servidores']},
 sitemap:'https://app-a9ad77db7684.factorai.cloud/sitemap.xml'};
}
