/**
 * Filtros rígidos para linhas de fatura: limite, totais, pagamentos, resumo.
 */

import { normalizeForMatch } from './invoiceLineFilters'

/**
 * Bloqueio absoluto (ETAPA 1): score 0 e não entra na lista principal.
 * Deve rodar antes de qualquer aceite (inclusive fallback).
 */
export function hardBlockInvoicePurchaseLine(line: string): boolean {
  const n = normalizeForMatch(line)
  if (!n) return false
  if (/\blimite\b/.test(n)) return true
  if (/\bpagamento\b/.test(n)) return true
  if (n.includes('debito automatico') || n.includes('debito automático')) return true
  if (n.includes('pagamento efetuado')) return true
  return false
}

/** Linha contém termos que nunca devem virar transação (ETAPA 1 + 4). */
export function rejectInvoicePurchaseLine(line: string): string | null {
  const n = normalizeForMatch(line)
  if (!n) return 'Linha vazia'

  if (/\bpagamento\b/.test(n)) return 'Contém pagamento'
  if (n.includes('debito automatico') || n.includes('débito automático'))
    return 'Débito automático'
  if (n.includes('pagamento efetuado')) return 'Pagamento efetuado'

  if (/\blimite\b/.test(n)) return 'Contém limite'
  if (n.includes('limite utilizado')) return 'Limite utilizado'
  if (n.includes('limite disponivel') || n.includes('limite disponível'))
    return 'Limite disponível'

  if (/\btotal\b/.test(n)) return 'Contém total'
  if (/\bparcelas\b/.test(n)) return 'Contém parcelas (resumo)'
  if (n.includes('proxima fatura') || n.includes('próxima fatura'))
    return 'Próxima fatura'
  if (n.includes('demais faturas')) return 'Demais faturas'
  if (/\bencargos\b/.test(n)) return 'Encargos'
  if (/\bjuros\b/.test(n)) return 'Juros'
  if (/\biof\b/.test(n)) return 'IOF'
  if (/\brotativo\b/.test(n)) return 'Rotativo'
  if (/\bsaldo\b/.test(n)) return 'Saldo'

  return null
}

/**
 * Filtro mais permissivo (fallback): não bloqueia só por "total" ou "parcelas" no meio do estabelecimento.
 * Mantém bloqueios fortes: pagamento, limite, IOF, etc.
 */
export function rejectInvoicePurchaseLineRelaxed(line: string): string | null {
  const n = normalizeForMatch(line)
  if (!n) return 'Linha vazia'

  if (/\bpagamento\b/.test(n)) return 'Contém pagamento'
  if (n.includes('debito automatico') || n.includes('débito automático'))
    return 'Débito automático'
  if (n.includes('pagamento efetuado')) return 'Pagamento efetuado'

  if (/\blimite\b/.test(n)) return 'Contém limite'
  if (n.includes('limite utilizado')) return 'Limite utilizado'
  if (n.includes('limite disponivel') || n.includes('limite disponível'))
    return 'Limite disponível'

  if (n.includes('total de lancamentos') || n.includes('total de lançamentos'))
    return 'Total de lançamentos'
  if (n.includes('total para')) return 'Total para (resumo)'
  if (n.includes('subtotal')) return 'Subtotal'
  if (n.includes('total geral')) return 'Total geral'
  if (n.includes('resumo da fatura')) return 'Resumo da fatura'
  if (n.includes('total de creditos') || n.includes('total de créditos')) return 'Total de créditos'
  if (n.includes('total de debitos') || n.includes('total de débitos')) return 'Total de débitos'

  if (n.includes('proxima fatura') || n.includes('próxima fatura'))
    return 'Próxima fatura'
  if (n.includes('demais faturas')) return 'Demais faturas'
  if (n.includes('parcelas futuras')) return 'Parcelas futuras'

  if (/\bencargos\b/.test(n)) return 'Encargos'
  if (/\bjuros\b/.test(n)) return 'Juros'
  if (/\biof\b/.test(n)) return 'IOF'
  if (/\brotativo\b/.test(n)) return 'Rotativo'
  if (/\bsaldo\b/.test(n)) return 'Saldo'

  return null
}

/**
 * Remove sufixos de resumo ("Total para próximas faturas", etc.) para não usar o valor errado.
 */
const SUMMARY_CUT_RES: RegExp[] = [
  /\s+total\s+para\s+próximas\s+faturas\b/i,
  /\s+total\s+para\s+proximas\s+faturas\b/i,
  /\s+para\s+próximas\s+faturas\b/i,
  /\s+para\s+proximas\s+faturas\b/i,
  /\s+próximas\s+faturas\b/i,
  /\s+proximas\s+faturas\b/i,
  /\s+demais\s+faturas\b/i,
  /\s+total\s+de\s+lancamentos\b/i,
  /\s+total\s+de\s+lan[çc]amentos\b/i,
  /\s+total\s+de\s+compras\b/i,
  /\s+total\s+geral\b/i,
  /\s+resumo\s+da\s+fatura\b/i,
]

export function truncateBeforeInvoiceSummarySuffix(line: string): {
  text: string
  truncated: boolean
} {
  let cut = line.length
  for (const re of SUMMARY_CUT_RES) {
    re.lastIndex = 0
    const m = re.exec(line)
    if (m && m.index !== undefined && m.index < cut) cut = m.index
  }
  const text = line.slice(0, cut).trim()
  return { text, truncated: cut < line.length }
}

/** Todos os valores BRL na string (ordem de aparição). */
export function extractAllBrlAmounts(line: string): string[] {
  const re = /\d{1,3}(?:\.\d{3})*,\d{2}/g
  return [...line.matchAll(re)].map((m) => m[0]!)
}

/**
 * Junta linhas partidas pelo PDF: só data na linha + continuação na seguinte;
 * ou linha com data sem valor + linha seguinte só com descrição e valor.
 */
export function mergeInvoiceSplitLines(rawLines: string[]): string[] {
  const lines = rawLines.map((l) => l.trim()).filter((l) => l.length > 0)
  const out: string[] = []
  let i = 0
  while (i < lines.length) {
    const current = lines[i]!
    const next = lines[i + 1] ?? ''

    if (/^\d{2}\/\d{2}(?:\/\d{2,4})?\s*$/.test(current) && next && extractAllBrlAmounts(next).length > 0) {
      out.push(`${current} ${next}`)
      i += 2
      continue
    }

    const curHasDate = /^\d{2}\/\d{2}(?:\/\d{2,4})?(\s|$)/.test(current)
    const curAmts = extractAllBrlAmounts(current)
    const nextAmts = extractAllBrlAmounts(next)
    if (
      curHasDate &&
      curAmts.length === 0 &&
      next &&
      nextAmts.length > 0 &&
      !/^\d{2}\/\d{2}/.test(next)
    ) {
      out.push(`${current} ${next}`)
      i += 2
      continue
    }

    out.push(current)
    i += 1
  }
  return out
}
