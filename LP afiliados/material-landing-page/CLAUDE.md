# CLAUDE.md — Projeto Landing Page de Conversão

Contexto para o Claude Code seguir ao trabalhar neste projeto de landing page.

## Objetivo
Construir landing pages de alta conversão. Cada LP tem UM objetivo e UM CTA principal.

## Fluxo obrigatório
1. **Planejar antes de codar.** Use `ai-first-product-planner` para definir arquitetura, seções e hierarquia. Nunca gere frontend direto — entregue o plano primeiro e só implemente após aprovação.
2. **Copy antes do visual.** Escreva headline, subtítulo, CTAs e prova social (skill `marketing` + `design:ux-copy`) antes de estilizar.
3. **Estrutura guiada por conversão.** Siga a ordem de seções e a fórmula above-the-fold (ver abaixo).
4. **Build limpo.** React/Tailwind componentizado e consistente (`frontend-implementation-director`, `design-system-guardian`).
5. **QA sempre.** Antes de finalizar: `screenshot-feedback-loop`, `design:accessibility-review`, `design:design-critique`.

## Fórmula above-the-fold (visível antes de rolar)
Comunicar valor em ~5 segundos:
- **Headline**: 6–12 palavras, foca no RESULTADO (ex: "Ship docs em minutos, não dias")
- **Subtítulo**: 15–25 palavras, explica o como
- **Imagem hero**: mostra o RESULTADO, não um print do produto
- **CTA primário**: verbo de ação + valor ("Começar meu teste grátis"), nunca "Enviar"/"Saiba mais"
- **Prova social**: logos, contagem ou micro-depoimento

## Ordem de seções recomendada
1. Hero (headline + imagem + CTA)
2. Prova social (logos/números)
3. Problema (empatia com a dor)
4. Solução / features (3 principais)
5. Como funciona (3 passos)
6. Depoimentos (2–3 específicos)
7. Preço (tiers claros, destaque o recomendado)
8. FAQ (5–7 objeções)
9. CTA final (repete o primário, com urgência)

## Regras de conversão (não negociáveis)
- Um CTA principal por página (evitar paralisia de análise). Secundário no máximo um.
- Benefícios ganham de características — traduza specs em ganhos.
- Formulário curto: nome + e-mail no máximo (cada campo derruba ~conversão). Coluna única. Validação inline.
- CTA em alto contraste, tamanho mínimo 44px, repetido após cada seção principal, com espaço em branco ao redor.
- Reduzir receio perto do CTA ("Cancele quando quiser", "14 dias grátis").
- Texto escaneável: parágrafos de 3–4 linhas, subtítulos a cada 2 parágrafos (79% escaneiam, só 16% leem tudo).
- Mobile-first: CTA full-width, sticky no scroll, sem scroll horizontal, fonte mínima 16px, tap targets 48x48px.
- Velocidade: LCP < 2,5s, hero < 200 KB, página < 2 MB, lazy load abaixo da dobra.
- Evitar "falso fim de página" — usar dicas visuais que motivem a rolar.

## Gatilhos de persuasão (usar quando fizer sentido)
Urgência (tempo), escassez (quantidade), autoridade (números/especialistas), confiabilidade (depoimentos, dados, selos de segurança), brindes (frete grátis, cupom).

## Otimização
Não adivinhar: usar heatmap, testes A/B e eye tracking para iterar.
