# Auditoria de cores — AppFinanceiro

Documento de apoio para futura refatoração do design system. **Não substitui** o código; o inventário detalhado está em [`color-tokens-audit.json`](./color-tokens-audit.json).

## Onde as cores aparecem

| Fonte | Conteúdo |
|--------|-----------|
| `tailwind.config.js` | `brand.*`, `danger.*`, sombras com base `rgb(15, 23, 42)` (slate-900) |
| `src/index.css` | Variáveis `--text`, `--bg`, `--accent`, modo escuro, bordas do `#root` |
| `src/styles/globals.css` | Fundo da app `#e4e6ed`, gradientes slate-50/100, utilitários `@apply` gray-* |
| Componentes `src/**/*.tsx` | Classes Tailwind (gray, slate, emerald, red, amber, brand, danger, …), alguns hex arbitrários |
| `ReportsPage` | Array `COLORS` em hex para fatias do pie (Recharts) |

## Objeto semântico (resumo em HEX)

Valores derivados da paleta padrão Tailwind v3 onde a classe não é arbitrária; opacidades (`/90`, `/45`) usam o mesmo HEX base.

```json
{
  "background": {
    "primary": "#FFFFFF",
    "secondary": "#F9FAFB",
    "surface": "#F1F5F9"
  },
  "text": {
    "primary": "#111827",
    "secondary": "#4B5563",
    "muted": "#6B7280"
  },
  "border": {
    "default": "#E5E7EB",
    "subtle": "#F3F4F6"
  },
  "feedback": {
    "success": "#10B981",
    "error": "#EF4444",
    "warning": "#F59E0B",
    "info": "#64748B"
  },
  "brand": {
    "primary": "#18181B",
    "secondary": "#AA3BFF"
  }
}
```

Notas rápidas:

- **secondary (brand)** aqui é o roxo legacy (`--accent` em `index.css`), não confundir com `brand-100` do Tailwind.
- **feedback** no JSON acima usa um HEX **representativo por intenção**; superfícies/bordas reais usam escalas completas (50–950) — ver chave `feedback` expandida no JSON.
- **Sidebar / drawer escuros** usam `slate-950` (`#020617`), não o bloco `background` “claro” acima.

## Próximos passos sugeridos

1. Unificar gray vs slate (ver `inconsistencies` no JSON).
2. Declarar no `tailwind.config.js` todos os tons de `brand` usados no código (`400`, `800`, …).
3. Opcional: mapear `--accent` para um token `brand.accent` e alinhar ao botão primário (hoje primário ≈ preto zinc).
