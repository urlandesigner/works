# AGENTS.md — Contexto do projeto

Landing page de conversão do **MyCofre** (app de finanças pessoais / patrimônio líquido).
Objetivo do site: **vender o acesso ao sistema** — levar o visitante a criar conta (`SIGN_UP_URL`).

## Stack

- Vite + React + TypeScript (sem router, single page).
- Estilo: CSS puro com design tokens em `src/index.css` (`:root`). **Não** há Tailwind/CSS-in-JS.
- Todo o markup vive em `src/App.tsx`; todo o estilo em `src/index.css`.

## Princípios ao editar

- **Reaproveite os tokens** (`--color-*`, `--space-*`, `--radius-*`, `--ease-out`). Cores derivam de
  `--color-accent` (rosa), `--color-highlight` (dourado) e `--color-positive` (verde) via `color-mix()`.
- Tema escuro, alto contraste (WCAG AA+). Fonte: Instrument Sans.
- Mobile-first: o breakpoint principal é `@media (max-width: 720px)`; grids de 2–3 colunas
  colapsam para 1. Há ajuste intermediário em `721px–980px` para o hero.
- Conteúdo de negócio (preços, depoimentos, copy) fica em arrays no topo de `src/App.tsx`.
- Microinterações seguem o guia de craft: `:active { transform: scale(0.97) }`, easing custom,
  animações de entrada com `IntersectionObserver` (`.feat-anim` → `.in-view`).

## Estrutura de conversão

Hero → Trust bar → Problema → Recursos → Como funciona → Depoimentos → Preços → FAQ → CTA final → Footer.
(Detalhes e IDs de âncora no `README.md`.)

## ⚠️ Placeholders a substituir antes do lançamento

- `plans` em `src/App.tsx`: **preços ilustrativos** (Grátis R$0, Pro R$19/mês ou R$14/mês anual).
- `testimonials` em `src/App.tsx`: **depoimentos fictícios** — trocar por reais (publicidade enganosa).
- `SIGN_UP_URL`, links de Privacidade/Termos no footer: confirmar URLs reais.

## Verificação

- `npx tsc --noEmit -p tsconfig.app.json` para checar tipos.
- Dev server roda em `npm run dev` (porta 5173 por padrão).
- Nota: o screenshot do preview embutido fica preto quando há scroll > 0 e os cards `.feat-anim`
  só animam em browser real — limitação da ferramenta, não bug do site. Verifique no navegador.
