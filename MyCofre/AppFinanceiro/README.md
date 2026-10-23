# AppFinanceiro

O app web do MyCofre: dashboard, transações, contas, investimentos, metas,
relatórios e configurações. Vite + React + Supabase.

`site/` é o export publicado (sem as credenciais reais do Supabase — o
cliente fica `null` por design, e as telas que dependem de login mostram que
o backend não está configurado, em vez de travar).

Para regerar: `npm install && VITE_BASE_PATH="/works/MyCofre/AppFinanceiro/site" npm run build`,
depois mover `dist/` para `site/`.

Autor: Urlan Dipre.
