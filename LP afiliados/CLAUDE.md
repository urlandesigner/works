# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

— Projeto Landing Page de Conversão

Contexto para o Claude Code seguir ao trabalhar neste projeto de landing page.

## Estado atual do repositório
**Não há código ainda.** O projeto é só material de apoio em Markdown; nenhum app foi criado, então não existem comandos de build/lint/test. A stack alvo é React/Tailwind (ver Fluxo obrigatório). Ao criar o app, scaffolde antes de implementar seções.

Arquivos e quando ler cada um:
- `CLAUDE.md` — este arquivo: as regras que valem durante o trabalho
- `checklist-landing-page.md` — checklist de verificação **antes de publicar**
- `plano-skills-landing-page-conversao.md` — qual skill usar em cada etapa
- `referencia-artigo-aela.md` — os princípios e o porquê (fonte: artigo da Aela)
- `README.md` — instalação das skills
- `material-landing-page/` — cópia idêntica dos arquivos acima, extraída de `ziXuyg3F` (zip). Duplicata: editar sempre a raiz.

## Comunicação — skill `caveman` ativa neste projeto
Usar a skill `caveman` (nível `full`) em todas as respostas deste projeto. Sem filler, sem preâmbulo, fragmentos OK, substância técnica intacta. Preservar o português.

**Fronteira — caveman vale só para a conversa, nunca para os artefatos:**
- Conversa comigo → caveman
- **Copy da LP (headline, CTA, FAQ, depoimentos), arquivos `.md`, mensagens de commit, código → português normal e bem escrito.** Este projeto vende por meio de texto persuasivo; copy em caveman destrói a conversão.

Desativar com "stop caveman" / "modo normal".

## Objetivo
Construir landing pages de alta conversão. Cada LP tem UM objetivo e UM CTA principal.

## Tipo de LP — definir antes de tudo
A estrutura muda conforme o tipo. Pergunte qual é antes de planejar:
- **Geração de leads** — captura nome/e-mail via formulário. Deixar explícito o que a pessoa recebe em troca (guia, planilha, manual).
- **Ação clicável** — sem formulário; o CTA leva a checkout/agendamento. Comum em e-commerce e afiliados.

Métrica-chave do CTA: **CTR** (de quantos viram, quantos clicaram).

## Fluxo obrigatório
1. **Planejar antes de codar.** Use `ai-first-product-planner` para definir arquitetura, seções e hierarquia. Nunca gere frontend direto — entregue o plano primeiro e só implemente após aprovação.
2. **Copy antes do visual.** Escreva headline, subtítulo, CTAs e prova social (skill `marketing` + `design:ux-copy`) antes de estilizar.
3. **Estrutura guiada por conversão.** Siga a ordem de seções e a fórmula above-the-fold (ver abaixo).
4. **Build limpo.** React/Tailwind componentizado e consistente (`frontend-implementation-director`, `design-system-guardian`).
5. **QA sempre.** Antes de finalizar: `screenshot-feedback-loop`, `design:accessibility-review`, `design:design-critique`. Rode o `checklist-landing-page.md` inteiro antes de publicar.

Três skills desse fluxo podem não estar instaladas ainda — `marketing` (plugin), `landing-page-design` (inference-sh) e `theme-factory`. Ver `README.md` para instalar. Se faltarem, siga as regras deste arquivo em vez de assumir que a skill existe.

## Fórmula above-the-fold (visível antes de rolar)
Comunicar valor em ~5 segundos:
- **Headline**: 6–12 palavras, foca no RESULTADO (ex: "Ship docs em minutos, não dias")
- **Subtítulo**: 15–25 palavras, explica o como
- **Imagem hero**: mostra o RESULTADO, não um print do produto
- **CTA primário**: verbo de ação + valor, em primeira pessoa — o texto completa "Eu quero…" ("Começar meu teste grátis"). Nunca "Enviar"/"Saiba mais".
- **Prova social**: logos, contagem ou micro-depoimento
- **Message match**: a headline precisa espelhar o anúncio/fonte de tráfego que trouxe a pessoa. Se a promessa mudar entre anúncio e LP, a conversão cai — pergunte qual é o criativo de origem antes de escrever a headline.

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
- Formulário curto: nome + e-mail no máximo (cada campo extra derruba ~11% da conversão). Coluna única. Validação inline. Botão com texto de ação ("Criar conta", nunca "Enviar").
- Sem links que dispersem — menos saídas = mais conversão. LP é autônoma, separada do site.
- Antecipar dúvidas de compra perto do CTA: preço, frete, garantia, devolução.
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
