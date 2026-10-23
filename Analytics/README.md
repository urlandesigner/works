# Analytics

Central operacional de analytics do portfólio: um status board que sincroniza
Google Analytics 4 em background e mostra usuários, sessões, conversões e
páginas mais acessadas de cada site. Vite + React + Supabase.

O projeto já nasceu com um modo mock (`USE_MOCKS` em `src/config.ts`,
ativado quando as variáveis do Supabase não existem): sem backend
configurado, a aplicação roda inteira com dados fictícios, sessão fake
incluída. É assim que está publicada aqui — `site/` não conversa com
nenhum servidor real.

Para regerar: `npm install && VITE_BASE_PATH="/works/Analytics" npm run build`,
depois mover `dist/` para `site/`.

Autor: Urlan Dipre.
