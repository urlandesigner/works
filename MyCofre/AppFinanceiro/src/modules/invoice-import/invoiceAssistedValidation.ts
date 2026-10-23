import { normalizeForMatch } from './parser/invoiceLineFilters'
import type { InvoiceDraft, InvoiceItem } from './types'

export type InvoiceImportStatusKind = 'confiavel' | 'parcial' | 'inconsistente'

const SUM_TOLERANCE = 0.05

/** Termos que bloqueiam consolidação se aparecerem na descrição selecionada. */
export function invoiceItemHasForbiddenTerms(item: InvoiceItem): boolean {
  const n = normalizeForMatch(item.description)
  if (!n) return false
  if (/\bpagamento\b/.test(n)) return true
  if (/\blimite\b/.test(n)) return true
  if (/\bresumo\b/.test(n)) return true
  return false
}

function reviewConfirmedForItem(i: InvoiceItem): boolean {
  if (i.confidenceLevel !== 'medium' && i.confidenceLevel !== 'low') return true
  return i.reviewConfirmedByUser === true
}

export interface InvoiceAssistedValidationResult {
  referenceTotal: number | null
  selectedSum: number
  diffToReference: number | null
  percentDiff: number | null
  countsHigh: number
  countsMedium: number
  countsLow: number
  countAcceptedSuggest: number
  countSuspiciousSuggest: number
  countDiscardedSuggest: number
  criticalAlerts: string[]
  canGenerate: boolean
  importStatus: InvoiceImportStatusKind
}

/**
 * Validação para importação assistida: consolidação só quando não há bloqueios críticos.
 */
export function computeInvoiceAssistedValidation(
  draft: InvoiceDraft | null,
  items: InvoiceItem[]
): InvoiceAssistedValidationResult {
  const referenceTotal =
    draft?.totalLancamentosAtuais != null && draft.totalLancamentosAtuais > 0
      ? draft.totalLancamentosAtuais
      : draft?.totalAmount != null && draft.totalAmount > 0
        ? draft.totalAmount
        : null

  const selected = items.filter((i) => i.selected && i.reviewStatus !== 'ignored')
  const selectedSum = selected.reduce((s, i) => s + i.amount, 0)

  let diffToReference: number | null = null
  let percentDiff: number | null = null
  if (referenceTotal != null && referenceTotal > 0) {
    diffToReference = selectedSum - referenceTotal
    percentDiff = diffToReference / referenceTotal
  }

  let countsHigh = 0
  let countsMedium = 0
  let countsLow = 0
  for (const i of items) {
    if (i.reviewStatus === 'ignored') continue
    if (i.confidenceLevel === 'high') countsHigh++
    else if (i.confidenceLevel === 'medium') countsMedium++
    else if (i.confidenceLevel === 'low') countsLow++
  }

  const active = items.filter((i) => i.reviewStatus !== 'ignored')
  const countAcceptedSuggest = active.filter((i) => i.confidenceLevel === 'high').length
  const countSuspiciousSuggest = active.filter(
    (i) =>
      i.confidenceLevel === 'medium' ||
      i.confidenceLevel === 'low' ||
      i.hadMultipleMoneyValues ||
      (i.reviewStatus === 'needs_review' && i.confidenceLevel !== 'high')
  ).length
  const countDiscardedSuggest = items.filter(
    (i) => i.reviewStatus === 'ignored' || !i.selected
  ).length

  const criticalAlerts: string[] = []

  if (selected.length === 0) {
    criticalAlerts.push('Selecione ao menos um lançamento e revise antes de consolidar.')
  }

  const needsReview = selected.filter(
    (i) => i.confidenceLevel === 'medium' && !reviewConfirmedForItem(i)
  )
  if (needsReview.length > 0) {
    criticalAlerts.push(
      `${needsReview.length} item(ns) com confiança média exige(m) confirmação na coluna «Revisei».`
    )
  }

  const lowSelected = selected.filter((i) => i.confidenceLevel === 'low')
  if (lowSelected.length > 0) {
    criticalAlerts.push(
      'Não é permitido consolidar itens com confiança baixa — desmarque ou ajuste antes de gerar.'
    )
  }

  for (const i of selected) {
    if (invoiceItemHasForbiddenTerms(i)) {
      criticalAlerts.push(
        `Descrição com termo proibido (pagamento, limite ou resumo): “${i.description.slice(0, 48)}${i.description.length > 48 ? '…' : ''}”.`
      )
      break
    }
  }

  const multiSelected = selected.filter((i) => i.hadMultipleMoneyValues)
  if (multiSelected.length > 0) {
    criticalAlerts.push(
      'Há lançamento(s) com múltiplos valores no PDF — confira o valor antes de consolidar.'
    )
  }

  if (
    referenceTotal != null &&
    referenceTotal > 0 &&
    Math.abs((selectedSum - referenceTotal) / referenceTotal) > SUM_TOLERANCE
  ) {
    criticalAlerts.push(
      `A soma dos selecionados difere mais de ${SUM_TOLERANCE * 100}% do total da fatura no PDF.`
    )
  }

  const hasBlocking =
    selected.length === 0 ||
    needsReview.length > 0 ||
    lowSelected.length > 0 ||
    selected.some((i) => invoiceItemHasForbiddenTerms(i)) ||
    multiSelected.length > 0 ||
    (referenceTotal != null &&
      referenceTotal > 0 &&
      Math.abs((selectedSum - referenceTotal) / referenceTotal) > SUM_TOLERANCE)

  const canGenerate = !hasBlocking

  let importStatus: InvoiceImportStatusKind
  if (!canGenerate) {
    importStatus = 'inconsistente'
  } else if (
    referenceTotal != null &&
    referenceTotal > 0 &&
    Math.abs((selectedSum - referenceTotal) / referenceTotal) <= SUM_TOLERANCE
  ) {
    importStatus = 'confiavel'
  } else {
    importStatus = 'parcial'
  }

  return {
    referenceTotal,
    selectedSum,
    diffToReference,
    percentDiff,
    countsHigh,
    countsMedium,
    countsLow,
    countAcceptedSuggest,
    countSuspiciousSuggest,
    countDiscardedSuggest,
    criticalAlerts,
    canGenerate,
    importStatus,
  }
}
