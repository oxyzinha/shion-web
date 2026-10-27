# SHION ♡ — Website oficial (fase 1)

Website público e protótipo visual do dashboard para o bot Discord Shion. **Nesta fase não existe autenticação, ligação ao bot ou qualquer API com dados reais.**

## Stack

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS 4 + CSS de identidade própria Dark Rose
- Lucide React para ícones e Recharts para gráficos demonstrativos
- Estrutura pronta para introduzir shadcn/ui e Motion quando os componentes interativos o justificarem

## Executar localmente

Requisitos: Node.js 20.9+ (recomendado LTS), npm e VS Code.

```bash
npm install
cp .env.example .env.local
npm run dev
```

No PowerShell: `Copy-Item .env.example .env.local`.

Abre `http://localhost:3000`.

## Imagens oficiais

Guarda `shion-icon.png` e `shion-banner.png` em `public/`. O site usa um espaço visual reservado e **não inventa personagens**; o passo seguinte é substituir esse espaço pelos assets oficiais.

## Estrutura

- `src/app/`: páginas públicas, rotas de funcionalidades e dashboard
- `src/components/`: navegação e cartões reutilizáveis
- `src/lib/content.ts`: catálogo de módulos e textos
- `src/lib/demo.ts`: dados fictícios (isolados da apresentação)
- `public/`: assets oficiais

## GitHub

```bash
git init
git add .
git commit -m "feat: initial Shion website"
git branch -M main
git remote add origin https://github.com/SEU_UTILIZADOR/shion-web.git
git push -u origin main
```

Cria previamente no GitHub um repositório vazio `shion-web`, sem README gerado pela plataforma. Substitui `SEU_UTILIZADOR` pelo teu utilizador.

## Publicar na Vercel

1. Em Vercel, escolhe **Add New → Project**.
2. Importa o repositório GitHub `shion-web`.
3. Mantém o framework Next.js detetado automaticamente.
4. Faz Deploy; as atualizações à branch principal passam a originar novos deployments.

O botão "Adicionar ao Discord" permanece indisponível até configurar `NEXT_PUBLIC_DISCORD_INVITE_URL` na Vercel. Define somente um link de instalação oficial verificado (variáveis com `NEXT_PUBLIC_` são públicas).

## Integração futura e segurança

1. Implementar OAuth2 Discord no backend e validar a sessão e autorização **no servidor**, incluindo membership e permissões atuais por guild.
2. Isolar os dados de cada servidor pelo `guild_id`; separar as permissões globais da proprietária.
3. Criar backend com PostgreSQL/Prisma para persistência; nunca expor SQLite ou tokens Python no browser.
4. Criar API interna autenticada com credenciais servidor-servidor, HTTPS, idempotência por `event_id`, validação, rate limiting e logs seguros.
5. Trocar os valores da camada `src/lib/demo.ts` por serviços tipados; apresentar apenas estatísticas recolhidas e verificadas.
6. Definir minimização, retenção, eliminação e consentimentos conforme as regras de privacidade aplicáveis antes de recolher informação de membros.
7. Confirmar no bot Python cada funcionalidade assinalada como disponível antes da publicação definitiva.

**Nunca fazer commit de `.env.local`, tokens Discord ou credenciais.**

## Estado desta primeira entrega

Inclui landing, catálogo, páginas individuais, documentação inicial, roadmap, sobre, atualizações, estado, textos provisórios de privacidade/termos e dashboard com filtros, gráfico e tabela demonstrativos. Não inclui ainda login, CRUD real, notificações nem integração operacional; não promete métricas ou uptime que não estejam verificados.

## Imagens oficiais (incluídas)

- `public/shion-icon.png` — ícone da Shion, usado no cabeçalho, rodapé e destaque principal.
- `public/shion-banner.png` — banner oficial, usado na página inicial e em Sobre.

Para trocar as imagens futuramente, substitui estes ficheiros mantendo os nomes.
