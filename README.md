# SHAYON ♡ — website e painel de administração

Website oficial da personagem/bot Discord **Shayon**, com identidade Dark Rose. Projeto Next.js 15, React 19 e TypeScript.

## Abrir a Shayon

- Website: https://app-a9ad77db7684.factorai.cloud
- Guia para instalar o bot: https://app-a9ad77db7684.factorai.cloud/adicionar
- Dashboard: https://app-a9ad77db7684.factorai.cloud/dashboard
- [Convite oficial da Shayon](https://discord.com/oauth2/authorize?client_id=1563985507996934284&scope=bot&permissions=1374661241942)

Para instalar: entra no Discord, escolhe um servidor que tenhas permissão **Gerir Servidor**, confirma as permissões e escreve `!shayon` num canal de texto. O cargo do bot deve ficar acima dos cargos que vais querer atribuir.

## Dashboard autenticado

O acesso funciona por OAuth2 do Discord com os âmbitos `identify guilds`. O servidor web guarda a sessão numa cookie encriptada, HttpOnly e Secure. **Nunca** colocamos o token Discord no JavaScript do browser. O backend do bot verifica, para cada consulta e alteração, as permissões administrativas atuais e se a Shayon está no servidor. Cada configuração é isolada por `guild_id`.

O painel disponibiliza, por servidor:

- Divulgação: participação, modo, anúncio, convite verificado e canal de receção.
- Moderação: spam, links, palavras bloqueadas, logs, timeout e punições progressivas (algumas punições precisam de testes em servidor real).
- Receção: canais, textos, menções, ativação de boas-vindas e despedidas.
- Cargo automático e cargos interativos: escolher **cargos existentes** abaixo do bot na hierarquia.
- Tickets: categoria, canais, cargos de suporte e estado da central.
- Personalidade: automática, fria, provocadora ou fofa. IA gratuita só após chave Groq ser configurada no alojamento do bot.
- Analytics: ativação voluntária, contagens agregadas e retenção até 90 dias.
- Música: volume inicial das **novas sessões**. Comandos de reprodução e fila continuam no Discord.
- Servidor oficial: títulos, descrição e canal das quatro páginas oficiais; publicação e atualização mediante confirmação no site. Mantém os banners e componentes originais.

A rede de divulgação global é acessível **só à proprietária da aplicação Discord**, verificada diretamente no Discord. Os outros administradores gerem exclusivamente os seus servidores.

**Operações ainda feitas com comandos Discord:** publicação/atualização de painéis de tickets e cargos interativos; controlo da fila musical em tempo real; ações de moderação em membros individuais. O website mostra estes limites, sem inventar botões de sucesso.

## Configuração OAuth2

No [Discord Developer Portal](https://discord.com/developers/applications/1563985507996934284/oauth2), acrescenta o Redirect URI exato:

```text
https://app-a9ad77db7684.factorai.cloud/api/auth/callback/discord
```

As configurações privadas do servidor web incluem:

```dotenv
DISCORD_CLIENT_ID=1563985507996934284
DISCORD_CLIENT_SECRET=DEFINIR_NO_ALOJAMENTO_NUNCA_NO_GITHUB
SHAYON_SESSION_SECRET=CRIAR_ALEATORIO_MIN_32_CARACTERES
SHAYON_SITE_URL=https://app-a9ad77db7684.factorai.cloud
SHAYON_BOT_API_URL=https://app-582c58dcabe4.factorai.cloud
```

**Não guardar uma chave real em `.env.example`, código-fonte, tickets ou prints.** As variáveis `DISCORD_CLIENT_SECRET` e `SHAYON_SESSION_SECRET` são exclusivas do servidor Next.js.

O bot continua no workload **179** com SQLite persistente em `/data/shion.db`; o site está no workload **180**. O site usa endpoints FastAPI autenticados com OAuth em `/api/dashboard/`. Não expor a base SQLite nem o token do bot ao browser.

## Desenvolvimento local

```bash
npm ci --include=dev
cp .env.example .env.local
npm run dev
```

No PowerShell, substitui `cp` por `Copy-Item`. Para build de produção:

```bash
npm run build
npm run start
```

O código principal é mantido no repositório GitHub. A instalação em container do Gaudencio precisa de arranque apropriado do processo Next.js após recriar/reiniciar o container; **estar online agora não equivale a deploy automático e persistente**. Para publicação permanente, configurar o comando de arranque do serviço ou utilizar Vercel ligada ao GitHub.

## Privacidade e limites

O site solicita autorização apenas para identificar a conta e os servidores administráveis. Cada operação valida novamente as permissões no Discord. A IA generativa, se ativada, processa os textos enviados voluntariamente ao comando `!shayon falar`; o plano gratuito do Groq tem limites. Informar os membros antes de ativar IA externa ou Analytics. A política de privacidade jurídica completa ainda precisa dos dados formais da entidade responsável.

Imagens oficiais existentes: `public/shion-icon.png` e `public/shion-banner.png`.
