# Condominio

Estudo inicial de um painel de gestão de condomínio: comunicados, chamados,
reservas de área comum, encomendas, visitantes e mensagens com a portaria.
Next.js App Router + Prisma (schema em `prisma/schema.prisma`, sem backend
ligado ainda — todas as telas rodam com dados mockados em `src/lib/mock/`).

`site/` é o export estático publicado. As rotas de API (`src/app/api/`)
estão vazias no projeto original — nada para excluir.

`src/generated/` (o client do Prisma, ~9 MB) não foi copiado: é artefato
regenerável. Para regerar: `npx prisma generate`.

Para regerar o export: `npm install && EXPORT_BASE_PATH="/works/Condominio/site" npm run build`,
depois mover `out/` para `site/`.

Autor: Urlan Dipre.
