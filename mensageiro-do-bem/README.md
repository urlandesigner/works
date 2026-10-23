# mensageiro-do-bem

Microproduto de validação: o usuário paga um valor baixo via Pix e recebe uma
mensagem inspiradora, parte doada. Next.js App Router + Supabase + Asaas.

`site/` é o export estático publicado, **sem as rotas de API**
(`src/app/api/`): elas dependem de servidor e de credenciais do Asaas e do
Supabase, incompatíveis com `output: export`. Nesta versão, o fluxo de
pagamento não completa — a navegação e as telas estão todas aqui, o
backend não.

Para regerar: copie o projeto para fora, remova `src/app/api/`, adicione
`export const dynamic = "force-static"` no topo de `robots.ts`, `sitemap.ts`
e `opengraph-image.tsx`, depois `EXPORT_BASE_PATH="/works/mensageiro-do-bem/site" npm run build`
e mova `out/` para `site/`.

Autor: Urlan Dipre.
