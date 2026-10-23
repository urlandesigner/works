# LP afiliados 2

Landing page de afiliado para o Prime Perform (suplemento dietético), segunda
variação do mesmo estudo de página de alta conversão: prova social,
ingredientes e um experimento de headline em `/experimento`.

Duas pastas:

- [`codigo/`](codigo/) — o código-fonte, Next.js App Router. Para regerar o
  export: `cd codigo && EXPORT_BASE_PATH="/works/LP%20afiliados%202/site" npm run build && node scripts/fix-export-paths.mjs "/works/LP%20afiliados%202/site"`,
  depois mover `codigo/out/` para `site/`.
- [`site/`](site/) — o export estático publicado, o que o GitHub Pages serve.

`material-landing-page/` guarda o material de apoio (checklist, plano de
skills) usado para montar a página.

Autor: Urlan Dipre.
