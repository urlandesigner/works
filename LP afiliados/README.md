# LP afiliados

Landing page de afiliado para o ProDentim (probiótico oral), feita como
estudo de página de alta conversão: prova social, comparação, FAQ e um
experimento de headline em `/experimento`. Link de afiliado e domínio ainda
em placeholder, por isso o robots.txt do build bloqueia indexação de
propósito.

Duas pastas:

- [`codigo/`](codigo/) — o código-fonte, Next.js App Router. Para regerar o
  export: `cd codigo && EXPORT_BASE_PATH="/works/LP%20afiliados/site" npm run build && node scripts/fix-export-paths.mjs "/works/LP%20afiliados/site"`,
  depois mover `codigo/out/` para `site/`.
- [`site/`](site/) — o export estático publicado, o que o GitHub Pages serve.

`material-landing-page/` guarda o material de apoio (checklist, plano de
skills) usado para montar a página.

Autor: Urlan Dipre.
