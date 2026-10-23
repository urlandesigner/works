# Proposta de tokens de cor consolidados

Documento de consolidação baseado em [`color-tokens-audit.json`](./color-tokens-audit.json). **Nenhum arquivo de aplicação foi alterado.**

Artefatos:

- [`color-tokens-proposal.json`](./color-tokens-proposal.json) — objeto semântico + notas de mapeamento Tailwind
- [`color-tokens-proposal.variables.css`](./color-tokens-proposal.variables.css) — variáveis CSS para `:root` (claro + rascunho escuro)

---

## 1. Análise resumida do inventário

- Duas rampas neutras (**gray** em cards/globals/header e **slate** em formulários, calendário, listas) geram duplicatas perceptivas próximas (#111827 vs #020617, #E5E7EB vs #E5E4E7, #6B7280 vs #6B6375).
- **Brand** no Tailwind é uma escala zinc escura (ações); o **roxo** vive em `index.css` como `--accent`, sem integração no theme.
- **Sucesso** usa emerald na UI; o gráfico de pizza usa **green-500** (#22C55E), ligeiramente diferente de **emerald-500** (#10B981).
- **Aviso** mistura **amber-50** e hex **#FFF4E5** para o mesmo papel “fundo suave”.

---

## 2. Direções de consolidação

### Neutros (gray vs slate)

- **Direção:** um único conjunto **semântico** (`text.primary`, `border.default`, `bg.muted`, …) com HEX escolhidos para **coincidir com o que já domina** na UI clara: texto principal **#111827** (equivalente gray-900), bordas **#E5E7EB** (gray-200), superfícies suaves **#F9FAFB** / **#F3F4F6**.
- **Na refatoração:** gerar utilitários Tailwind a partir dos tokens (ex. `text-foreground`, `border-border`) em vez de alternar `gray-*` e `slate-*` no JSX. Valores numéricos permanecem alinhados à escala Tailwind para **compatibilidade visual** imediata.

### brand.primary vs brand.accent

- **primary (#09090B → hover #000000):** ações principais (equivalente ao uso atual de `brand-600` / `brand-700` em botões e foco “forte”). Mantém a hierarquia visual atual.
- **accent (#AA3BFF, escuro #C084FC):** cor de marca secundária / destaque legado; não substitui o botão primário. `accentMuted` cobre fundos tipo checkbox/metas com opacidade controlada.

### Success principal

- **Canônico:** escala **emerald** com **accent #10B981** (barras, métricas positivas, alinhamento futuro com gráficos).
- **Fase 2:** trocar o primeiro slot do pie de **#22C55E** para **#10B981** (já previsto em `token.data.chart` no JSON).

### Warning soft

- **Um único fundo suave:** **#FFFBEB** (amber-50), borda **#FDE68A**, texto **#B45309** / forte **#92400E**. Elimina a necessidade de **#FFF4E5** como segundo tom “quase igual”.

---

## 3. O que foi enxugado

- Fundos de alerta custom (#F4FBF7, #FFF7ED, #FEF7F7) colapsam na prática em **feedback.{success|warning|error}.bg** + eventual **bgSolid** só onde hoje há necessidade de mais contraste (espelha padrão Tailwind 50/100).
- Duplicata **white / #FFFFFF** → apenas **background.elevated**.
- **danger** e **red** no código futuro podem mapear para os mesmos tokens **feedback.error.\***.

---

## 4. Compatibilidade com a UI atual

- Nenhum token principal força salto grande de contraste em relação às classes mais usadas hoje.
- Modo escuro no `.variables.css` é **rascunho** (alinhado ao espírito do `index.css` atual); feedback colorido pode exigir ajuste fino em QA quando a migração ocorrer.

---

## 5. Próximo passo (quando for implementar)

1. Injetar variáveis em `index.css` ou `globals.css`.
2. Estender `tailwind.config.js` com `colors` que referenciam `var(--color-*)` onde o Tailwind permitir, ou espelhar HEX.
3. Substituir gradualmente classes `gray-*` / `slate-*` por utilitários semânticos (`bg-canvas`, `text-muted`, …).
