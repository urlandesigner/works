import { suggestCategoryByDescription } from '../../statement-import/services/categorySuggestion'
import type { InvoiceDraft, InvoiceItem, InvoiceParseDebug, ParsedInvoiceLine } from '../types'
import { isNonPurchaseLine } from './invoiceLineFilters'
import {
  parsePurchaseLineFromSection,
  type ParsedPurchaseLineParts,
} from './invoiceLancamentosSection'
import { buildInvoiceReconciliation } from './invoiceReconciliation'
import {
  scoreInvoiceLine,
  shouldIncludeInDefaultSelection,
  type InvoiceLineConfidenceInput,
} from './invoiceLineConfidence'
import { hardBlockInvoicePurchaseLine } from './invoicePurchaseFilters'
import { partKey, scanInvoicePurchaseLines } from './invoicePurchaseLineScanner'
import {
  extractCardNameHint,
  extractDueDateFromText,
  extractIssuerHint,
  extractReferenceMonthFromText,
  extractTotalAmountFromText,
  extractTotalLancamentosAtuaisFromText,
} from './invoiceMetadata'

function parseAmount(value: string): number {
  const normalized = value.replace(/\./g, '').replace(',', '.').trim()
  const n = Number.parseFloat(normalized)
  return Number.isFinite(n) ? Math.abs(n) : 0
}

function normalizeDescription(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function buildConfidenceInput(parts: ParsedPurchaseLineParts): InvoiceLineConfidenceInput {
  const normalizedLine =
    parts.sourceNormalizedLine ??
    `${parts.dateToken} ${parts.description} ${parts.amountStr}`.replace(/\s+/g, ' ')
  const amount = parseAmount(parts.amountStr)
  const meta = parts.parseMeta
  return {
    normalizedLine,
    amountStr: parts.amountStr,
    description: parts.description,
    amount,
    hadMultipleMoneyValues: meta?.hadMultipleMoneyValues === true,
    truncatedBeforeSummary: meta?.truncatedBeforeSummary === true,
    recoverySource: meta?.recoverySource === 'fallback' ? 'fallback' : 'primary',
  }
}

/** DD/MM/AA(AA) ou DD/MM + referência da fatura para montar ISO. */
function parsePurchaseDateToIso(
  dateToken: string,
  referenceMonth: string | null,
  dueDate: string | null
): string {
  const parts = dateToken.split('/').filter(Boolean)
  if (parts.length === 3) {
    const [d, m, yRaw] = parts
    const y = yRaw!.length === 2 ? `20${yRaw}` : yRaw
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  if (parts.length === 2) {
    const [d, m] = parts
    let year: string | null = null
    const ref = referenceMonth?.match(/^(\d{2})\/(\d{4})$/)
    if (ref) year = ref[2]!
    if (!year && dueDate) year = dueDate.slice(0, 4)
    if (!year) year = String(new Date().getFullYear())
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return dateToken
}

function lineToParsed(
  parts: ParsedPurchaseLineParts,
  referenceMonth: string | null,
  dueDate: string | null
): ParsedInvoiceLine | null {
  const fullLine =
    parts.sourceNormalizedLine ??
    `${parts.dateToken} ${parts.description} ${parts.amountStr}`.replace(/\s+/g, ' ')
  if (hardBlockInvoicePurchaseLine(fullLine)) return null

  const description = normalizeDescription(parts.description)
  if (!description) return null
  const fromFallback = parts.parseMeta?.recoverySource === 'fallback'
  if (!fromFallback && isNonPurchaseLine(description)) return null

  const amount = parseAmount(parts.amountStr)
  if (amount <= 0) return null

  const installments = parts.installment

  const conf = scoreInvoiceLine(buildConfidenceInput(parts))
  const reviewStatus =
    conf.confidenceLevel === 'high' ? 'pending' : 'needs_review'

  return {
    date: parsePurchaseDateToIso(parts.dateToken, referenceMonth, dueDate),
    description,
    amount,
    installments,
    suggestedCategory: suggestCategoryByDescription(description),
    reviewStatus,
    confidenceScore: conf.confidenceScore,
    confidenceLevel: conf.confidenceLevel,
    confidenceReasons: conf.confidenceReasons,
    hadMultipleMoneyValues: parts.parseMeta?.hadMultipleMoneyValues === true,
  }
}

export interface ParseInvoicePdfResult {
  draft: Omit<InvoiceDraft, 'items'> & { items: InvoiceItem[] }
}

function sumsMatchReference(sum: number, ref: number | null): boolean {
  if (ref == null || ref <= 0) return false
  const tol = Math.max(2, ref * 0.02)
  return Math.abs(ref - sum) <= tol
}

export function parseGenericInvoicePdfText(
  fileName: string,
  rawText: string
): ParseInvoicePdfResult {
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  const issuer = extractIssuerHint(rawText)
  const cardName = extractCardNameHint(rawText)
  const referenceMonth = extractReferenceMonthFromText(rawText)
  const dueDate = extractDueDateFromText(rawText)
  const totalAmount = extractTotalAmountFromText(rawText)
  const totalLancamentosAtuais = extractTotalLancamentosAtuaisFromText(rawText)

  const { accepted, debug: scanDebug } = scanInvoicePurchaseLines(rawText)

  const parsedLines: ParsedInvoiceLine[] = []
  const confidenceByPartKey = new Map<
    string,
    Pick<ParsedInvoiceLine, 'confidenceScore' | 'confidenceLevel' | 'confidenceReasons'>
  >()

  for (const parts of accepted) {
    const lineParsed = lineToParsed(parts, referenceMonth, dueDate)
    if (!lineParsed) continue
    parsedLines.push(lineParsed)
    confidenceByPartKey.set(partKey(parts), {
      confidenceScore: lineParsed.confidenceScore,
      confidenceLevel: lineParsed.confidenceLevel,
      confidenceReasons: lineParsed.confidenceReasons,
    })
  }

  const linesWithConfidence: InvoiceParseDebug['lines'] = scanDebug.lines.map((rec) => {
    if (rec.outcome !== 'accepted' || !rec.normalized) return rec
    const reparsed = parsePurchaseLineFromSection(rec.normalized, {
      relaxedReject: !!rec.recoveredFromFallback,
      minDescChars: rec.recoveredFromFallback ? 3 : undefined,
      recoverySource: rec.recoveredFromFallback ? 'fallback' : 'primary',
    })
    if (!reparsed) return rec
    const conf = confidenceByPartKey.get(partKey(reparsed))
    return conf ? { ...rec, ...conf } : rec
  })

  const sumParsed = parsedLines.reduce((s, i) => s + i.amount, 0)

  const refForValidation = totalLancamentosAtuais ?? totalAmount

  const reconciliation = buildInvoiceReconciliation(
    scanDebug.lines,
    parsedLines.map((l) => l.amount),
    refForValidation
  )

  const coverageComplete = reconciliation.coverage === 'complete'
  const trustParser =
    coverageComplete || sumsMatchReference(sumParsed, refForValidation)

  let parseHint: string | null = null

  if (parsedLines.length === 0) {
    parseHint =
      'Nenhum lançamento com padrão data + descrição + valor. Confira texto selecionável no PDF ou tente outro leitor.'
  } else if (refForValidation != null && refForValidation > 0) {
    if (coverageComplete) {
      parseHint = `Parsing completo: soma (${sumParsed.toFixed(2)}) dentro de ±5% do total (${refForValidation.toFixed(2)}).`
    } else if (reconciliation.coverage === 'partial') {
      const pct = (Math.abs(reconciliation.percentDiff ?? 0) * 100).toFixed(1)
      parseHint = `Parsing parcial: soma ${sumParsed.toFixed(2)} vs total ${refForValidation.toFixed(2)} (${pct}% de diferença).`
      if (Math.abs(sumParsed - refForValidation) / refForValidation > 0.2) {
        parseHint += ` Diferença > 20% — revise lançamentos ou linhas descartadas no debug.`
      }
    } else if (!trustParser) {
      parseHint = `Soma (${sumParsed.toFixed(2)}) vs total de referência (${refForValidation.toFixed(2)}).`
    }
  }

  let parseQuality: 'high' | 'low' | 'unknown' = 'unknown'

  if (parsedLines.length > 0 && refForValidation != null && refForValidation > 0) {
    parseQuality = trustParser || coverageComplete ? 'high' : 'low'
  } else if (parsedLines.length > 0 && (refForValidation == null || refForValidation <= 0)) {
    parseQuality = 'unknown'
  } else if (parsedLines.length === 0) {
    parseQuality = 'low'
  }

  const parseDebug: InvoiceParseDebug = {
    ...scanDebug,
    lines: linesWithConfidence,
    acceptedCount: parsedLines.length,
    totalDetected: totalAmount,
    totalLancamentosAtuais,
    reconciliation,
  }

  const items: InvoiceItem[] = parsedLines.map((line) => ({
    id: crypto.randomUUID(),
    date: line.date,
    description: line.description,
    amount: line.amount,
    installments: line.installments,
    suggestedCategory: line.suggestedCategory,
    selected: shouldIncludeInDefaultSelection(line.confidenceScore),
    reviewStatus: line.reviewStatus,
    parserTrusted: trustParser,
    confidenceScore: line.confidenceScore,
    confidenceLevel: line.confidenceLevel,
    confidenceReasons: line.confidenceReasons,
    hadMultipleMoneyValues: line.hadMultipleMoneyValues,
    reviewConfirmedByUser: line.confidenceLevel === 'high',
  }))

  return {
    draft: {
      id,
      fileName,
      rawText,
      createdAt,
      issuer,
      cardName,
      referenceMonth,
      dueDate,
      totalAmount,
      totalLancamentosAtuais,
      parseHint,
      parseQuality,
      parseDebug,
      items,
    },
  }
}
