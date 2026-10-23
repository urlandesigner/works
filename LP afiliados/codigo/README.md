# Template de LP — implementação

Next.js 16 + Tailwind 4, export estático. Arquitetura em [`../plano-template-lp.md`](../plano-template-lp.md).

## Comandos

```bash
npm run dev      # desenvolvimento em http://localhost:3000
npm run build    # gera o site estático em out/
```

Não existe `npm start`: `output: 'export'` não usa servidor Node. O deploy é subir o conteúdo de `out/` para qualquer hospedagem que sirva arquivos estáticos.

## Como usar num produto novo

**Edite só o `content.ts`.** Nenhum componente precisa mudar.

1. `product.targetSearchTerm` — o termo de busca que a campanha compra. A headline tem que espelhar ele (message match).
2. `hero.headline` — 6–12 palavras, foca no resultado.
3. `analysis` — o diferencial real, com evidência de uso. **Seção obrigatória** (ver abaixo).
4. `product.checkoutUrl` — destino de todo CTA.
5. `hero.image` — foto do resultado, comprimida à mão (ver abaixo).
6. Seções opcionais: `testimonials: []` e `comparison: null` fazem a seção sumir.
7. `seo.siteUrl` — quando o domínio existir; libera canonical e imagem de compartilhamento (Open Graph).

**O build avisa enquanto o conteúdo não estiver pronto**: URL de checkout de exemplo, imagem placeholder, headline fora de 6–12 palavras, FAQ fora de 5–7 itens. Build silencioso = passou nas réguas. Os avisos saem só no terminal — nunca no navegador do visitante.

Antes de publicar, rodar [`../checklist-landing-page.md`](../checklist-landing-page.md) inteiro.

## Duas regras que o código não consegue impor

**A seção `analysis` é estrutural.** O Google Ads reprova *bridge pages* — páginas que só empurram o visitante para outro site sem conteúdo original. Sem análise real, a LP nasce reprovável e a campanha não roda. Não é enfeite: é o que mantém a conta viva, e é também o que converte tráfego de busca.

**Imagem não é otimizada no build.** `output: 'export'` desliga o otimizador do `next/image` (exige servidor). Toda imagem em `public/` vai para o ar exatamente como está. Comprimir antes: hero < 200 KB, página < 2 MB, LCP < 2,5s.

## Decisões que têm motivo

| Decisão | Motivo |
|---|---|
| Página inteira em `app/page.tsx` | Reordenar seção = mover um bloco. Teste A/B de ordem é o caso comum numa LP. |
| FAQ com `<details>` nativo | Zero JS, acessível por teclado de graça, conteúdo no HTML (SEO). |
| `StickyMobileCTA` é o único client component | CTA do hero e final funcionam sem JS; o sticky é enhancement. |
| Sem dark mode | LP de venda precisa de contraste garantido no CTA. `prefers-color-scheme` inverteria a paleta sem garantir os 4.5:1. As seções escuras são escolha de conteúdo (`tone`), não resposta ao tema do sistema. |
| Duas fontes: Anton (display) + Newsreader (corpo) | Anton só em headline, número e CTA — condensada pesada cansa em texto corrido. Newsreader é serifada: incomum na categoria de propósito, carrega autoridade de matéria jornalística (a posição que a página assume) e é mais confortável no bloco longo da análise, para um público 40+. |
| Reveal no scroll é JS, nunca CSS puro | Duas tentativas em CSS falharam de forma silenciosa: `animation-timeline: view()` resolveu range para -435% no Chrome (que SUPORTA a propriedade, então o `@supports` não protegia), deixando preço e CTA final em `opacity: 0`; e IntersectionObserver não entrega callback com a aba ocluída. Hoje o CSS deixa tudo visível, o JS só esconde o que está abaixo da dobra, e um timer de 4s revela tudo aconteça o que acontecer. |
| `rel="sponsored"` em todo CTA | Orientação do Google para link de afiliado. |
| Padding no `<summary>`, não no `<details>` | Área de toque de 48px. Com padding no pai, cai para 24px. |
| `ProofBar` carrega a própria margem | Numa div em volta, o wrapper sobrevive ao `null` e deixa 32px de buraco quando o produto não tem prova social. |
| `product.shortName` separado de `name` | O rótulo do mobile se repete em cada linha da comparação. Com nome de e-commerce (10+ palavras), o ruído somou 844px de altura. |
| Marcador do `<details>` morto no CSS global (`list-style: none` + fallback WebKit) | `marker:content-none` do Tailwind não cobre Safari. Um mecanismo, três motores. |
| Sticky some quando o CTA final entra na tela | Dois botões idênticos empilhados são ruído na seção que fecha a venda. |
| `StickyMobileCTA` recebe `href`/`label` por props | Importar o content num client component arrasta o conteúdo inteiro (análise, FAQ, depoimentos) para o bundle do navegador, duplicando o HTML estático. |
| Avisos de build no `content.ts` | O risco documentado do template é o esqueleto ir ao ar como LP pronta. O build grita antes. |
| Imagens de produto baixadas com header `Accept` explícito | O servidor de origem serve WebP otimizado só quando o `Accept` do request imita um navegador. `curl` puro sem esse header trouxe o PNG original — 8× maior (892 KB vs 108 KB no mesmo arquivo). |
| `analysis.points[].image` e `proofBar.badgeImage` são opcionais | Nem todo produto vem com foto de ingrediente ou selo de certificação. Ausente = renderiza só texto, sem buraco. |
| Azul de marca nunca entra no botão CTA | `--color-gold`/`--color-gold-bright` (nomes herdados do produto anterior; hoje guardam azul) são cor de marca — headline, ícone, número. O CTA fica só laranja. Duas cores de "destaque" competindo tira a clareza de o que é clicável. |
| `--color-gold` (`#1b4f87`) ≠ `--color-gold-bright` (`#5aace8`) | Uma cor só não cobre os dois tons sem quebrar AA. O azul escuro dá 7.21:1 sobre o papel mas só 2.44:1 sobre a tinta; o claro dá 7.74:1 sobre a tinta. Cada um serve um fundo. |
| Laranja do CTA NÃO é o da página oficial | A oficial usa `#c66d00`, que com texto branco dá 3.76:1 — reprova em AA. Mantido `#c2410c` (5.18:1). Copiar a cor exata da marca custaria acessibilidade. |
| `SectionShell tone="dark"` não herda cor de texto nos filhos | CSS cascade automático seria frágil (fácil esquecer um span). Cada filho declara a cor explicitamente — ver preço e CTA final em `page.tsx` como referência. |
| `CTAButton` tem prop `tone` só para o texto de reassurance | O botão em si (fundo laranja sólido) não muda com o fundo ao redor. Só o texto solto abaixo dele precisa virar claro sobre seção escura — `neutral-600` daria 2.3:1 sobre `#171717`. |
| `TopBar` não é `<nav>`, não tem link | Um nav de verdade abriria saída da página — contra a regra do CLAUDE.md ("sem links que dispersem"). Texto puro, decorativo. |
| Sistema de tons por classe (`.tone-light` / `.tone-dark` / `.tone-band`) | As seções alternam tinta/papel. Os filhos usam `text-heading` / `text-body` / `text-muted` / `text-accent` / `border-line` / `bg-surface` e ficam legíveis em qualquer fundo, sem saber onde estão. **Nunca declarar cor fixa dentro de uma seção** — quebra ao trocar o tom. |
| Tom claro é papel quente (`#f2eee4`), não branco | A seção de análise é o trecho mais longo de leitura da página. Off-white quente contra a tinta escura vira capa-escura/miolo-claro de revista; branco puro lia como formulário. |
| `.tone-*` sobrescreve `--color-*` direto, sem indireção | Custom property herda o valor **já computado**. Se `--color-heading` fosse `var(--tone-heading)`, resolveria no `:root` (tom claro) e o override em `.tone-dark` nunca chegaria — texto escuro sobre fundo escuro. Foi exatamente esse o bug na primeira tentativa. |
| Textura de fundo em gradiente CSS, não imagem | A oficial usa mármore (768×512 JPG) no claro e uma textura quase preta no escuro. Dois `radial-gradient` de baixo contraste dão o mesmo efeito com zero bytes e sem depender de asset de terceiro. |
| `StickyMobileCTA` é escuro, não branco | Ele é `fixed` e flutua sobre seções claras **e** escuras. Fundo branco sobre a seção de preço (escura) parecia elemento solto de outra página. |
| `CTAButton` não tem prop de tom | `text-muted` já dá 4.7:1 no claro e 7.3:1 no escuro — o tom da seção resolve. A prop existiu por uma versão e foi removida como redundante. |
| Foto de pacote no preço fica sobre **placa branca**, não recortada | As fotos oficiais (`1bottle`/`3bottle`/`6bottle`) têm frascos sangrando para fora do quadro. Sobre branco isso lê como enquadramento; recortado sobre o card escuro lê como corte errado. Tentei recorte por flood fill: tolerância baixa deixa franja clara (halo), tolerância alta **vaza para dentro do frasco** — que também é branco — e abre buracos. A placa resolve os dois de uma vez e ainda dá respiro claro no card. |
| Grade de preço usa `md:items-stretch` | Com foto no topo e altura de placa fixa, os três cards passam a alinhar nome, quantidade e preço na mesma linha. Com `items-center` (versão anterior) os preços ficavam escalonados e comparar virava caça ao número. |

## Testado com conteúdo extremo

O template foi submetido a dois extremos antes de existir produto:

- **Mínimo** — headline de 4 palavras, sem prova social, sem depoimentos, sem comparação, 3 FAQs. As duas seções opcionais somem sem deixar buraco; página fica em 2540px.
- **Máximo** — headline de 16 palavras, CTA de 9, 8 pontos de análise, 6 depoimentos, comparação de 8 linhas, 9 FAQs, textos longos em todo campo.

Em ambos, nos dois breakpoints: zero elementos estourando o viewport, sem scroll horizontal. Os dois defeitos que isso revelou (buraco do `ProofBar`, ruído do nome longo) estão corrigidos e na tabela acima.

**Ao trocar de produto, refaça esse teste** se o conteúdo real for muito maior que o exemplo.

## Verificado

Build estático em `out/` (1,1 MB, versão exemplo em português). Sem scroll horizontal em 375px. Alvos de toque ≥ 44px. CTA com contraste 5,18:1 (AA exige 4,5). Um `<h1>`, hierarquia de headings sem pulo, `lang` dinâmico via `seo.lang`, imagens com `alt`. Sticky verificado no ciclo completo: escondido no topo, visível no meio, escondido com o CTA final na tela. Open Graph com `og:title` e `og:locale` dinâmico via `seo.ogLocale`; imagem e canonical entram com `siteUrl`. Bundle do cliente sem o texto do content (conferido por grep nos chunks).

**Paleta dourado/preto** (adicionada depois do produto real definido, para ecoar a marca em vez de um laranja genérico): contraste medido no navegador, não só calculado.

**Auditoria de contraste do sistema de tons**: varredura de todo `h1/h2/h3/p/li/td/th/summary` da página contra o fundo efetivo de cada um (subindo a cadeia de pais até achar fundo não-transparente), aplicando os limiares AA e a exceção de texto grande — **zero violações**. Nas seções escuras: heading 19,8:1 · corpo 13,4:1 · dourado 11,4:1. Ritmo de tons conferido em ordem: escuro → claro → escuro → claro → dourado → escuro → claro → escuro.

## SEO

`app/robots.ts` e `app/sitemap.ts` geram `robots.txt` e `sitemap.xml` no build. Ambos exigem `export const dynamic = "force-static"` — sem isso o build falha com `output: 'export'`.

**A indexação é amarrada à prontidão do conteúdo.** Enquanto `pendenciasDeConteudo()` retornar algo, o `robots.txt` sai como `Disallow: /` e o sitemap sai vazio:

| Estado | robots.txt | sitemap.xml |
|---|---|---|
| Com `[PENDING]` | `Disallow: /` | vazio |
| Conteúdo pronto | `Allow: /` + link do sitemap | a URL da LP |

O motivo não é preciosismo: uma LP de afiliado indexada com texto de rascunho visível é o alvo exato do sistema de *helpful content* do Google. Ser indexado assim e corrigir depois é pior que não ser indexado — reputação de domínio demora muito mais para voltar do que indexação. Resolvidos os pendentes, o bloqueio some sozinho no próximo build.

As páginas legais (`/privacy`, `/terms`, `/contact`) **não** entram em `Disallow`: são linkadas do rodapé e o revisor de política do Google Ads precisa alcançá-las. Ficam de fora do **sitemap**, isso sim — sitemap é a lista do que se quer ranqueando, e não é o caso delas.

> **Hoje o `robots.txt` está `Disallow: /`.** Não é defeito: `legal.siteName` e `legal.contactEmail` ainda são `[PENDING]`, e a guarda trata placeholder em página legal com o mesmo rigor de placeholder em headline. Preencher os dois destrava sozinho no build seguinte.

## Páginas legais e rodapé

`/privacy`, `/terms` e `/contact`, linkadas por um rodapé discreto (`components/SiteFooter.tsx`), com moldura compartilhada em `components/LegalShell.tsx`.

**Isto tensiona a regra "sem links que dispersem" do `CLAUDE.md`, de propósito.** A regra segue valendo no corpo da página; estes três são a exceção padrão, por três motivos concretos:

1. Landing Page Experience (componente do Quality Score) premia transparência. Afiliado de suplemento é categoria vigiada, e página sem identidade nem contato é o perfil clássico de reprovação.
2. Com o gtag ativo a página grava cookie — política de privacidade vira exigência legal (CCPA/CPRA no tráfego dos EUA).
3. Quem procura essas páginas já está avaliando confiança. Não achar custa mais conversão do que o link custa em dispersão.

Mitigações: tipografia pequena, sem destaque, depois do CTA final e da divulgação; nenhum link externo no rodapé; e as páginas legais não têm CTA nem sticky — botão de compra dentro de política de privacidade é exatamente o sinal de má-fé que o Google Ads procura.

| Decisão | Por quê |
|---|---|
| Texto escrito para o que a página REALMENTE faz | Não é modelo genérico. A política afirma que não há formulário nem coleta — se um dia entrar formulário ou outro script, o texto muda junto. Política descrevendo coleta inexistente é tão ruim quanto política ausente: as duas mostram que ninguém leu. |
| `/contact` sem formulário, só `mailto:` | Formulário implicaria coletar dados, e a política afirma que o site não coleta nada. O `mailto:` mantém as duas páginas verdadeiras ao mesmo tempo. |
| Metade de `/contact` e de `/terms` é "não somos o vendedor" | A maioria de quem escreve para site de afiliado quer falar de pedido, garantia ou devolução — e quem resolve isso é o comerciante. Dizer isso explicitamente evita expectativa errada e é o que o revisor procura. |
| `legal.siteName` / `legal.contactEmail` na guarda de pendências | Publicar política de privacidade com contato falso é pior do que não ter política nenhuma. |

**Aviso da DSHEA** (`content.healthDisclaimer`): obrigatório nos EUA em qualquer página com alegação de estrutura/função sobre suplemento — e esta faz ("supports your body's natural muscle-building response"). Fica junto da divulgação de afiliado, depois do CTA final: os dois são exigência legal (FTC e DSHEA) e nenhum pode ficar escondido. A redação é a padronizada pela FDA e **não deve ser reescrita para soar melhor** — é a redação que cumpre a exigência.

## Google Ads — o que a página emite

**SEO e Google Ads são sistemas separados.** Ranking orgânico não entra no leilão; o que decide CPC e posição é o Quality Score (Expected CTR + Ad Relevance + **Landing Page Experience**). Otimizar "SEO" não melhora campanha paga — o que melhora é relevância, transparência, velocidade e **sinal de conversão**.

### Conversão: clique de saída, não venda

A venda acontece no checkout do Digistore24, fora do domínio. O Google Ads nunca a vê. Sem sinal nenhum, Smart Bidding não tem o que otimizar e sobra CPC manual mirando clique — a métrica errada.

O sinal possível é o **clique no CTA**. `lib/ads.ts` + `components/GoogleAdsTag.tsx` + `components/CheckoutClickTracker.tsx` fazem isso, ligados por duas variáveis:

```
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-1234567890
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=AbC-D1efGhIjKl2M3n
```

| Decisão | Por quê |
|---|---|
| Some por completo sem as variáveis | Sem conta de anúncios, **nenhum script de terceiro entra no HTML** — verificado: `grep -c googletagmanager out/index.html` = 0. Peso e LCP intactos enquanto a campanha não existe. |
| Ação de conversão categoria "Outros", nunca "Compra" | Não há compra confirmada aqui. Marcar como Purchase mistura clique com receita e envenena o tROAS. A receita real continua vindo do relatório do Digistore24. |
| Clique capturado por **delegação no documento**, não `onClick` | `CTAButton` importa `content`. Virar client component arrastaria headline, FAQ e análise inteiros para o bundle do navegador. O tracker não importa `content` — só escuta `a[data-cta="checkout"]`. Verificado: nenhum chunk da LP contém o texto do content. |
| Sem `event_callback` segurando a navegação | O CTA abre em nova aba, então a página segue viva e o beacon completa sozinho. Callback só adicionaria atraso e risco de travar o visitante se o gtag falhar. |
| `afterInteractive` | `beforeInteractive` atrasaria o conteúdo por um script de medição; `lazyOnload` perderia o clique de um visitante rápido. |

O gtag também grava o `gclid` do auto-tagging no cookie primário `_gcl_aw` na chegada — sem ele, a conversão dispara mas o Ads não liga o clique ao anúncio de origem.

**Verificado ponta a ponta** no build estático com IDs de teste: gtag carregado, clique no CTA disparando `gtag('event','conversion',{send_to:'AW-…/…'})` uma vez.

### Ainda em aberto para a campanha

- **Consent Mode v2** não implementado. Só é exigido para tráfego EEA/Reino Unido. Tráfego 100% EUA não precisa; se a campanha abrir para a Europa, precisa antes de rodar.
- **Página de privacidade** passa a ser necessária assim que o gtag entrar (cookie + CCPA/CPRA), além de contar como sinal de transparência no Landing Page Experience.

### Structured data: deliberadamente ausente

| Tipo | Por que não |
|---|---|
| `FAQPage` | **Descontinuado.** O Google encerrou o rich result de FAQ em 7 de maio de 2026 (docs removidas em junho); hoje só aparece para sites de governo e saúde. Marcar não gera resultado nenhum. |
| `Product` / `AggregateRating` | Não somos o vendedor, o preço é do checkout de terceiro e **não há avaliação real** — `testimonials` está vazio. Inventar `aggregateRating` viola as diretrizes do Google e rende ação manual. |
| `Review` | O caminho legítimo — **quando a análise de uso real existir**. Hoje a seção declara escopo de ingredientes ("not a personal test"), então não há review de produto para marcar. |

### Baseline verificado

Title 57 caracteres (alvo 50–60), description 158 (alvo 150–160), um `<h1>`, hierarquia de headings sem pulo, viewport responsivo, `lang` dinâmico, 5 imagens todas com `alt`, 4 em lazy load (o hero é `priority`, correto), 5 links externos todos com `rel="sponsored"`.

## Peso real por rota (não confundir com o total de `out/`)

> Números abaixo são da versão anterior (Prime Perform, 5 imagens). A LP
> atual pesa **335 KB** gzipado — HTML + JS + CSS + 5 imagens + fontes
> (as 3 fotos de pacote no preço somam 29 KB, todas em lazy load).

`du -sh out/` soma TUDO no diretório — inclui rotas que um visitante da LP nunca carrega. Next faz code-splitting por rota, então o que importa é o que cada página referencia:

- **`/` (a LP)**: ~1,06 MB — 613 KB JS + 376 KB de imagens (produto + selo + 3 ingredientes) + 47 KB fonte + 44 KB HTML. Dentro do orçamento de 2 MB.
- **`/privacy`, `/terms`, `/contact`**: só texto, reaproveitam os mesmos chunks e a mesma fonte da LP. Peso irrelevante e, principalmente, **não carregado por quem chega pelo anúncio** — só por quem clica no rodapé.

Ao medir o peso da LP publicada, medir a página, não o diretório inteiro.

**`/experimento` foi removida** (rota de teste com Framer Motion). Sozinha ela puxava um chunk de 139 KB e uma cópia do texto da LP, no mesmo domínio para onde os anúncios apontam — peso morto e superfície extra para revisão de política, sem contrapartida.
