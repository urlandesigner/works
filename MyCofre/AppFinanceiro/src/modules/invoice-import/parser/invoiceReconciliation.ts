import type { InvoiceParseDebug, InvoiceReconciliationDebug } from '../types'
import { extractAllBrlAmounts, truncateBeforeInvoiceSummarySuffix } from './invoicePurchaseFilters'

function brlStringToNumber(s: string): number {
  const n = Number.parseFloat(s.replace(/\./g, '').replace(',', '.').trim())
  return Number.isFinite(n) ? Math.abs(n) : 0
}

/** Último valor monetário na parte útil da linha (após truncar resumo). */
export function lastMonetaryValueInLine(normalized: string): number | null {
  const { text } = truncateBeforeInvoiceSummarySuffix(normalized)
  const amts = extractAllBrlAmounts(text)
  if (amts.length === 0) return null
  return brlStringToNumber(amts[amts.length - 1]!)
}

const COVERAGE_THRESHOLD = 0.05

export function buildInvoiceReconciliation(
  lineRecords: InvoiceParseDebug['lines'],
  acceptedAmounts: number[],
  referenceTotal: number | null
): InvoiceReconciliationDebug {
  const discardedWithMoney: InvoiceReconciliationDebug['discardedWithMoney'] = []
  let sumDiscarded = 0

  for (const r of lineRecords) {
    if (r.outcome !== 'rejected' || !r.normalized) continue
    const last = lastMonetaryValueInLine(r.normalized)
    if (last == null || last <= 0) continue
    discardedWithMoney.push({
      raw: r.raw,
      normalized: r.normalized,
      lastAmount: last,
      reason: r.reason,
    })
    sumDiscarded += last
  }

  const sumAccepted = acceptedAmounts.reduce((a, b) => a + b, 0)
  const sumAcceptedPlusDiscarded = sumAccepted + sumDiscarded

  let diffToReference: number | null = null
  let percentDiff: number | null = null
  let coverage: InvoiceReconciliationDebug['coverage'] = 'unknown'

  if (referenceTotal != null && referenceTotal > 0) {
    diffToReference = sumAccepted - referenceTotal
    percentDiff = diffToReference / referenceTotal
    const ad = Math.abs(percentDiff)
    coverage = ad <= COVERAGE_THRESHOLD ? 'complete' : 'partial'
  }

  return {
    referenceTotal,
    sumAccepted,
    sumDiscardedMonetary: sumDiscarded,
    diffToReference,
    percentDiff,
    acceptedValues: [...acceptedAmounts],
    discardedWithMoney,
    sumAcceptedPlusDiscarded,
    coverage,
  }
}
