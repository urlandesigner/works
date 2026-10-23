# Material — Landing Page de Alta Conversão

Pacote de apoio para rodar o projeto de landing page pelo Claude Code.

## Conteúdo da pasta
- `README.md` — este arquivo (setup e comandos de instalação)
- `CLAUDE.md` — contexto do projeto para o Claude Code carregar automaticamente
- `plano-skills-landing-page-conversao.md` — o time de skills por etapa e o fluxo de trabalho
- `checklist-landing-page.md` — checklist prático de conversão
- `referencia-artigo-aela.md` — resumo dos princípios (fonte: artigo da Aela)

---

## Skills a instalar (3)

### 1. Plugin `marketing` (copy de venda, SEO, campanha)
Via marketplace de plugins do Claude Code:
```
/plugin marketplace add knowledge-work-plugins
/plugin install marketing
```
> Sem restrição de licença comercial.

### 2. Skill `landing-page-design` (estrutura + above-the-fold + CTA)
```
npx skills add inference-sh/skills@landing-page-design
```
> O conhecimento (fórmulas e tabelas) funciona sem o CLI `belt`.
> Só os comandos de geração de imagem/pesquisa exigem conta na inference.sh.

### 3. Skill `theme-factory` (temas de cor/fonte para LP em HTML)
Skill standalone — adicione pela sua interface de skills / Configurações do Claude.

---

## Skills que você já tem (não precisa instalar)
- `ai-first-product-planner` — planejamento de arquitetura/estrutura
- `design:ux-copy` — microcopy e CTA
- `ui-ux-pro-max` — guia visual (estilos, paletas, fontes)
- `frontend-implementation-director` — implementação React/Tailwind
- `design-system-guardian` — consistência de tokens/componentes
- `screenshot-feedback-loop` — revisão visual
- `design:design-critique` — usabilidade e hierarquia
- `design:accessibility-review` — WCAG / contraste
- `design:design-handoff` — spec para engenharia
- `design:user-research` + `design:research-synthesis` — pesquisa de público

---

## Fluxo de uso
`ai-first-product-planner` → `marketing` + `design:ux-copy` (copy) → `landing-page-design` (estrutura) → `ui-ux-pro-max` + `theme-factory` (visual) → `frontend-implementation-director` (build) → `screenshot-feedback-loop` + `design:accessibility-review` + `design:design-critique` (QA) → `design:design-handoff` (entrega)

## Descartado
- `landing-page-builder` (majestic) — licença não-comercial (Polyform 1.0.0) e redundante com o plugin `marketing`.
