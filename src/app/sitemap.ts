import type {MetadataRoute} from 'next';
export default function sitemap():MetadataRoute.Sitemap{
 const base='https://app-a9ad77db7684.factorai.cloud';
 const pages=['','/descobrir','/parcerias','/adicionar','/funcionalidades','/sobre','/privacidade','/termos'];
 return pages.map(path=>({url:base+path,changeFrequency:path==='/descobrir'?'daily':'monthly',priority:path==='/descobrir'?1:0.6}));
}
