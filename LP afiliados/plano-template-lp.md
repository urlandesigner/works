# Plano — Template reutilizável de LP de venda

Modelo de landing page para reaproveitar a cada novo produto. Gerado com `ai-first-product-planner`, seguindo o fluxo obrigatório do `CLAUDE.md`.

_Status: **implementado** em [`site/`](site/). Ver [`site/README.md`](site/README.md) para uso._

---

## Premissa central
**Não há produto ainda.** O objetivo é um modelo pronto para receber produtos futuros: trocar de produto = editar um arquivo de conteúdo, sem tocar em componente.

## Definições confirmadas
- **Escopo por página**: um produto único. Um objetivo, um CTA principal.
- **Tráfego alvo**: Google Ads / busca. Público chega com intenção ativa.
- **Checkout**: externo, na página oficial onde o produto está anunciado.
- **Métrica-chave**: CTR do CTA.
- **Stack**: Next.js 16 + Tailwind 4, export estático (`output: 'export'`).
- **Hospedagem**: própria/compartilhada — sobe o conteúdo de `site/out/`.

### Consequência da hospedagem própria (decidida na implementação)
Export estático **desliga o otimizador de imagem do `next/image`** (ele exige servidor — está na lista de features não suportadas do Next).

**Compressão de imagem vira passo manual obrigatório por produto.** Sem WebP/AVIF automático e sem `srcset` responsivo. Alvo continua: hero < 200 KB, página < 2 MB, LCP < 2,5s. Se um dia migrar para hospedagem com servidor (ex: Vercel), remover `output: 'export'` e `images.unoptimized` devolve a otimização automática.

---

## ⚠️ O que este template NÃO resolve

Ler antes de usar o modelo. Os dois itens de maior alavanca de conversão **não cabem num template**:

1. **Message match** — a headline precisa espelhar o anúncio/termo de busca que trouxe a pessoa. Depende da campanha, muda a cada produto.
2. **Diferencial real** — o que você sabe do produto que a página oficial não conta. Depende do produto e do seu uso dele.

**Consequência prática**: quando o template estiver pronto, a LP está com o esqueleto pronto e a alma vazia. Não é 80% do trabalho — é a metade que não converte sozinha. A outra metade é por-produto e não tem atalho.

## ⚠️ Risco crítico: bridge page no Google Ads

O fluxo **Google Ads → LP → checkout oficial de terceiro** é o padrão que o Google chama de *bridge page*. A política de Valor Limitado do Google Ads é restritiva com páginas cujo propósito principal é enviar o usuário para outro lugar sem conteúdo original substancial: o resultado é reprovação do anúncio ou suspensão de conta.

**Consequência direta para o template**: a seção de análise original é **estrutural e obrigatória**, nunca opcional. Um modelo sem slot forte de conteúdo original não é template de LP — é gerador de bridge pages, e cada página que sair dele nasce reprovável.

Também: produto com marca registrada → dar lance no nome da marca como afiliado costuma esbarrar em restrição de trademark, competindo com o anunciante oficial (que normalmente vence no Índice de Qualidade). Validar por produto, antes de investir em campanha.

---

## Estratégia recomendada
Tráfego de busca chega **quente e cético**: já quer o produto; falta decidir *se compra por aqui e agora*.

Isso inverte a LP clássica — a seção de Problema (empatia com a dor) tem pouco valor, porque a pessoa já sabe da dor, foi por isso que buscou. Ela pesa como enrolação entre a busca e a resposta.

A página encurta e muda de eixo: em vez de convencer da dor, **entrega julgamento** — a análise que a pessoa foi buscar. Mesma solução para os dois problemas: o conteúdo original que o Google exige é exatamente o que converte esse público.

## Estrutura da interface

Adaptada da ordem de 9 seções do `CLAUDE.md`:

| # | Seção | Obrigatória? |
|---|-------|--------------|
| 1 | **Hero** — headline (message match) + imagem do resultado + CTA + prova social | Sim |
| 2 | **Veredito curto** — para quem é, para quem não é | Sim |
| 3 | **Análise / o que você ganha** — benefícios traduzidos de specs, evidência real de uso | **Sim — estrutural (anti-bridge-page)** |
| 4 | **Prova social** — depoimentos, dados, números | Opcional (ausente no 1º produto) |
| 5 | **Comparação honesta** — alternativas e trade-offs | Opcional |
| 6 | **Preço e o que está incluso** | Sim |
| 7 | **FAQ** — 5–7 objeções: frete, garantia, devolução, prazo | Sim |
| 8 | **CTA final** — repete o primário + redutor de receio | Sim |

**Alterações vs. ordem padrão do CLAUDE.md:**
- Cortado "Como funciona em 3 passos" — redundante para público que já conhece o produto.
- "Problema" → "Veredito" — a dor já é conhecida.

**Prioridade visual**: CTA > headline > imagem do resultado > prova social.

**Divulgação de afiliado**: obrigatória e visível (CONAR/CDC). Slot fixo no template, não removível por produto.

## Camada de conteúdo (o coração do template)

Todo o texto e configuração em **um arquivo tipado** (`content.ts`). Componentes burros, lendo por props. Trocar de produto = editar só esse arquivo.

Forma esperada:
- Identidade do produto: nome, termo de busca alvo, URL do checkout oficial
- Textos por seção: headline, subtítulo, veredito, análise, preço, FAQ
- Coleções opcionais: depoimentos, linhas de comparação
- Flags de seção: liga/desliga as opcionais

Seções opcionais vazias **não quebram e não deixam buraco** — somem por completo. Estado de primeira classe, não bug.

## Componentes reutilizáveis
`CTAButton` (variantes primário/sticky, slot de redutor de receio) · `SectionShell` (título + espaçamento padrão) · `TestimonialCard` · `FAQItem` (accordion) · `ProofBar` (logos/números) · `ComparisonTable` · `StickyMobileCTA` · `AffiliateDisclosure`

Oito componentes cobrem a página inteira. Um nono muito específico = sinal de overdesign.

## Estratégia mobile
Google Ads em mobile é a maioria do tráfego → **mobile é o design principal**.
- CTA full-width e sticky a partir do fim do hero
- Tap targets 48×48, fonte base 16px
- Tabela de comparação vira lista empilhada (nunca scroll horizontal)
- FAQ fechado por padrão

Teste real: dá para decidir e clicar com uma mão só?

## Estados necessários
Sem formulário, a página tem poucos estados — vantagem, não lacuna.
- Imagens: lazy load abaixo da dobra + placeholder (evitar layout shift)
- Sticky CTA entrando/saindo
- FAQ aberto/fechado
- **Seções opcionais ausentes** — caso normal no primeiro produto, não erro
- **Link de afiliado quebrado ou produto fora de estoque** — pior estado possível: a página parece funcionar e não converte

## Riscos detectados
- **Bridge page no Google Ads** (crítico — ver acima)
- **Abstração prematura**: o template está sendo desenhado sem nenhum caso concreto — jeito clássico de errar a abstração. Mitigação: manter o modelo deliberadamente enxuto, resistir a prever variações. O primeiro produto real é o teste de fogo; esticar depois, com informação
- **Falsa sensação de pronto**: template completo ≠ LP pronta (ver "O que este template NÃO resolve")
- **Divulgação de afiliado**: relação comercial declarada de forma visível. Esconder = risco jurídico e de confiança
- **UX**: a página virar resenha longa e perder o CTA de vista
- **Conversão**: descasamento entre o preço mostrado aqui e o do checkout oficial — mata a venda no último passo e está fora do seu controle
- **Técnico**: LCP. Hero < 200 KB, alvo < 2,5s

## Melhor estratégia de implementação
- Next.js com export estático + Tailwind
- `next/image`: hero com `priority`, resto lazy
- Sem dependência de JS para o conteúdo principal — legível e clicável antes da hidratação
- Mobile primeiro, desktop como progressive enhancement
- Sem biblioteca de animação nesta fase
- Preencher o `content.ts` com dados de exemplo realistas (não "Lorem ipsum") para o template ser verificável

---

## Ao usar o template num produto real
1. Definir o termo de busca da campanha → headline espelha ele
2. Escrever o diferencial real → alimenta a seção de análise
3. Confirmar URL do checkout oficial e política de preço
4. Validar risco de trademark/bridge page antes de investir em campanha
5. Rodar `checklist-landing-page.md` inteiro antes de publicar

---

## Primeiro produto real: Prime Perform (Digistore24)

Suplemento de vitalidade/libido masculina, EUA, inglês. Decisões tomadas nesta rodada:

- **Mercado**: EUA / inglês (a página oficial já é em inglês)
- **Canal**: Google Ads, **mesmo após risco explicado** — decisão do usuário, ciente
- **Afiliação**: já aprovada no Digistore24 (link real ainda não fornecido — `checkoutUrl` é placeholder)

### Risco novo, específico deste produto: categoria de saúde sexual

Diferente do risco genérico de bridge page do template, este produto esbarra em **bloqueio de categoria** do Google Ads, confirmado com fonte:

> Ads aren't promoted in a way that focuses on sexual pleasure or enhancement, and ads don't use sexually suggestive elements and themes. — [Sexual health and wellness policy](https://support.google.com/adspolicy/answer/15275138?hl=en)

A página oficial do Prime Perform é construída inteira sobre esse eixo proibido (headline, bônus de "Forbidden Package", claim de "ereção em 7 dias"). **Suavizar a LP não resolve sozinho**: o CTA leva ao checkout oficial, que é explícito, e o Google avalia o funil até a conversão. Mitigação aplicada nesta LP: framing em "energia/vitalidade", nunca "prazer sexual/ereção" — reduz risco, não elimina.

**Risco adicional de trademark, mais concreto que o genérico do template**: "Prime Perform" é provavelmente marca do vendor. Além do risco de Índice de Qualidade já documentado, a maioria dos vendors Digistore24/ClickBank **proíbe contratualmente** o afiliado de dar lance no nome da marca nos "termos de afiliado"/"PPC guidelines" do programa — violar isso pode zerar a comissão, independente da política do Google. `targetSearchTerm` no `content.ts` foi definido por categoria ("natural male vitality supplement"), não pela marca, exatamente para não tropeçar nisso por padrão — mas precisa ser confirmado contra os termos reais do programa antes de subir campanha.

### Gaps que o guard de build sinaliza (não fabricados de propósito)

- **`product.checkoutUrl`** — link de afiliado real do Digistore24 ainda não fornecido
- **`pricing.price`** — a seção de preço da página oficial carrega via JS e não populou no fetch; preço muda com frequência de qualquer forma
- **`analysis.intro`/`points`** — contexto de categoria sobre os ingredientes (Tongkat Ali, Saw Palmetto, Boron), **não teste pessoal do produto**. Fabricar "usei por X meses" seria inventar experiência que ninguém teve — isso anula o próprio propósito anti-bridge-page da seção. Trocar pela experiência real de quem testou antes de publicar.
- **`comparison`** — deixado `null` de propósito: uma comparação honesta esbarraria perto de conselho médico, que não é o lugar de um LLM decidir sem mais cuidado.

### Generalização do template motivada por este caso

Primeiro produto em idioma diferente do português expôs texto que estava hardcoded nos componentes/página em vez de vir do `content.ts` (títulos de seção, rótulo de divulgação). Corrigido: `seo.lang`, `seo.ogLocale`, `verdict.forWhomTitle`/`notForWhomTitle`, `testimonialsTitle`, `faqTitle`, `affiliateDisclosure` viraram `{label, text}`. Consistente com o princípio já registrado acima — "o primeiro produto real é o teste de fogo, esticar depois, com informação": só generalizei o que o segundo caso real provou que precisava, nada preventivo.
