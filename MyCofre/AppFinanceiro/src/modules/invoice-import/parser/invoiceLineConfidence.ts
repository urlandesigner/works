import { normalizeForMatch } from './invoiceLineFilters'
import type { InvoiceConfidenceLevel } from '../types'
import { hardBlockInvoicePurchaseLine } from './invoicePurchaseFilters'

export interface InvoiceLineConfidenceInput {
  /** Linha completa normalizada (texto do PDF). */
  normalizedLine: string
  amountStr: string
  description: string
  amount: number
  hadMultipleMoneyValues: boolean
  truncatedBeforeSummary: boolean
  recoverySource: 'primary' | 'fallback'
}

export interface InvoiceLineConfidenceResult {
  confidenceScore: number
  confidenceLevel: InvoiceConfidenceLevel
  confidenceReasons: string[]
}

/** 80–100 = high, 50–79 = medium, 0–49 = low */
export function getConfidenceLevel(score: number): InvoiceConfidenceLevel {
  const s = Math.max(0, Math.min(100, Math.round(score)))
  if (s >= 80) return 'high'
  if (s >= 50) return 'medium'
  return 'low'
}

export function shouldAutoSelect(score: number): boolean {
  return score >= 80
}

/** Inclui na seleção inicial (high + medium). Low fica desmarcado. */
export function shouldIncludeInDefaultSelection(score: number): boolean {
  return score >= 50
}

/**
 * Pontuação enxuta (base 50) + penalidades fortes para reduzir falsos positivos.
 * Bloqueio forte (pagamento/limite) deve zerar — idealmente a linha nem vira item.
 */
export function scoreInvoiceLine(input: InvoiceLineConfidenceInput): InvoiceLineConfidenceResult {
  const reasons: string[] = []
  const line = normalizeForMatch(input.normalizedLine)

  if (hardBlockInvoicePurchaseLine(input.normalizedLine)) {
    return {
      confidenceScore: 0,
      confidenceLevel: 'low',
      confidenceReasons: ['Bloqueio forte: limite, pagamento ou débito automático'],
    }
  }

  let score = 50

  if (/^\d{2}\/\d{2}/.test(line.trim())) {
    score += 20
    reasons.push('Data DD/MM no início (+20)')
  }

  const trimmed = input.normalizedLine.trim()
  const amt = input.amountStr.trim()
  if (amt && (trimmed.endsWith(amt) || trimmed.replace(/\s+/g, ' ').endsWith(amt))) {
    score += 20
    reasons.push('Termina com o valor da compra (+20)')
  }

  const descLen = input.description.replace(/\s+/g, ' ').trim().length
  if (descLen >= 5) {
    score += 10
    reasons.push('Descrição válida (+10)')
  }

  if (input.hadMultipleMoneyValues) {
    score -= 20
    reasons.push('Múltiplos valores monetários na linha (−20)')
  }

  const strongPenalty =
    /\btotal\b/.test(line) ||
    /proximas faturas|próximas faturas|proxima fatura|próxima fatura/.test(line) ||
    /\bparceladas\b/.test(line) ||
    /\bdemais faturas\b/.test(line)

  if (strongPenalty) {
    score -= 50
    reasons.push('Termos de resumo ou parcelamento (total, faturas, parceladas) (−50)')
  }

  const forbidden60 =
    /\blimite\b/.test(line) ||
    /\bpagamento\b/.test(line) ||
    /debito automatico/.test(line) ||
    /debito automático/.test(line) ||
    /pagamento efetuado/.test(line)

  if (forbidden60) {
    score -= 60
    reasons.push('Palavra proibida (pagamento/limite) (−60)')
  }

  const confidenceScore = Math.max(0, Math.min(100, Math.round(score)))
  const confidenceLevel = getConfidenceLevel(confidenceScore)

  return {
    confidenceScore,
    confidenceLevel,
    confidenceReasons: reasons,
  }
}
