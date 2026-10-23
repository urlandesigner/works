# Plano de Skills — Landing Page de Alta Conversão

Time de skills organizado pelo fluxo de trabalho, para tirar o melhor resultado possível de uma landing page focada em conversão.

Legenda: ✅ já instalada · ⬇️ instalar

---

## 1. Estratégia e planejamento
- ✅ `ai-first-product-planner` — arquitetura, estrutura e seções antes de qualquer código
- ✅ `design:user-research` + `design:research-synthesis` — entender o público (card sorting / tree testing)

## 2. Copy que vende
- ⬇️ Plugin `marketing` (knowledge-work-plugins) — headlines, copy de venda, SEO, campanha, e-mail de nutrição · sem restrição de licença
- ✅ `design:ux-copy` — microcopy, CTA, mensagens de formulário

## 3. Estrutura e boas práticas de conversão
- ⬇️ Skill `landing-page-design` (inference-sh) — fórmula above-the-fold, ordem de seções, prova social, erros comuns
  - O conhecimento funciona sem o CLI `belt`; só os comandos de imagem/pesquisa dependem da conta inference.sh
  - Instalação: `npx skills add inference-sh/skills@landing-page-design`

## 4. Design visual
- ✅ `ui-ux-pro-max` — estilos, paletas, tipografia, hierarquia
- ⬇️ `theme-factory` — aplica tema pronto de cor/fonte a landing pages HTML

## 5. Implementação
- ✅ `frontend-implementation-director` — React/Tailwind saudável e componentizado
- ✅ `design-system-guardian` — consistência de tokens e componentes

## 6. QA (onde a conversão se decide)
- ✅ `screenshot-feedback-loop` — revisão visual da tela
- ✅ `design:design-critique` — usabilidade e hierarquia
- ✅ `design:accessibility-review` — contraste, alvos de toque, WCAG

## 7. Entrega
- ✅ `design:design-handoff` — spec para engenharia

---

## Resumo do que instalar
Apenas três: o plugin **`marketing`**, a skill **`landing-page-design` (inference-sh)** e a **`theme-factory`**. O resto já está disponível.

## Descartado e por quê
- `landing-page-builder` (majestic) — licença **não-comercial** (Polyform 1.0.0), problema para trabalho de cliente, e redundante com o plugin `marketing`.
- Skills de Figma / Notion / Slack — dependem de autorização nos conectores.

---

## Fluxo recomendado (ordem de uso)
`ai-first-product-planner` → `marketing` + `design:ux-copy` (copy) → `landing-page-design` (estrutura) → `ui-ux-pro-max` + `theme-factory` (visual) → `frontend-implementation-director` (build) → `screenshot-feedback-loop` + `design:accessibility-review` + `design:design-critique` (QA) → `design:design-handoff` (entrega)

---

## Princípios de conversão de referência (do artigo da Aela + skills)
- Foco único: uma LP, um objetivo, um CTA principal (evitar paralisia de análise)
- Above-the-fold comunica valor em ~5s: headline (6–12 palavras, resultado) + subtítulo + imagem do resultado + CTA + prova social
- Benefícios ganham de características
- Formulário curto (cada campo derruba ~11% da conversão): nome + e-mail no máximo
- Gatilhos: urgência, escassez, autoridade, confiabilidade, brindes
- CTA: verbo de ação + valor, primeira pessoa ("Começar meu teste grátis"), alto contraste, repetido após cada seção
- Velocidade: carregar em 0–2s; LCP < 2,5s
- Mobile-first e responsivo
- Otimização contínua por testes (heatmap, A/B, eye tracking)

_Salvo em: julho/2026._
