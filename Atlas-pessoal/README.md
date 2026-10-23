# Atlas-pessoal

Ferramenta pessoal de gestão de freelance: CRM de leads, propostas, projetos
(pessoal, profissional e de cliente) e indicadores de receita. Next.js App
Router + Supabase.

`site/` é o export estático publicado, com três ajustes em relação ao
código-fonte:

- **Sem `src/app/api/`** (rotas de API) e **sem `src/proposta/`** (página
  pública de proposta, que usa `force-dynamic` e busca dado real): nenhuma
  das duas roda sem servidor.
- **Sem `src/proxy.ts`**: a proteção de rota por sessão não existe em export
  estático. Sem backend configurado, toda a navegação fica aberta.
- **`/crm/[id]`, `/p/[id]` e `/projects/[workspace]/[projectId]`** viraram um
  componente de servidor fino (`generateStaticParams`) por cima do client
  component original, exportando só um path de exemplo (`placeholder`): são
  páginas que leem `localStorage`, então o conteúdo real depende de cada
  visitante, não do servidor.

Para regerar: copie o projeto, remova `api/`, `proposta/` e `proxy.ts`, separe
cada uma das três páginas acima em `<Nome>Client.tsx` + um `page.tsx` com
`generateStaticParams` retornando ao menos um path, depois
`EXPORT_BASE_PATH="/works/Atlas-pessoal/site" npm run build` e mova `out/`
para `site/`.

Autor: Urlan Dipre.
