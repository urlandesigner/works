/**
 * Varredura linha a linha por compras (data + descrição + valor), sem depender do título da seção.
 * Inclui merge de linhas partidas e segunda passagem (fallback) para linhas rejeitadas.
 */

import type { InvoiceParseDebug } from '../types'
import {
  extractAllBrlAmounts,
  hardBlockInvoicePurchaseLine,
  mergeInvoiceSplitLines,
  rejectInvoicePurchaseLine,
  truncateBeforeInvoiceSummarySuffix,
} from './invoicePurchaseFilters'
import {
  isNonPurchaseLine,
  isSkippableInvoiceLineWhole,
  normalizeForMatch,
} from './invoiceLineFilters'
import {
  normalizePurchaseLineFragmentation,
  parsePurchaseLineFromSection,
  type ParsedPurchaseLineParts,
} from './invoiceLancamentosSection'

/** Data DD/MM obrigatória no início (após normalizar). */
const LOOKS_LIKE_STRICT_DATE = /^\s*\d{2}\/\d{2}/

const FALLBACK_MIN_AMOUNT = 5
const FALLBACK_MAX_AMOUNT = 20000

function brlToNumber(s: string): number {
  const n = Number.parseFloat(s.replace(/\./g, '').replace(',', '.').trim())
  return Number.isFinite(n) ? Math.abs(n) : 0
}

function preprocessLine(line: string): string {
  let s = line.replace(/\s+/g, ' ').trim()
  s = normalizePurchaseLineFragmentation(s)
  return s
}

export function partKey(p: ParsedPurchaseLineParts): string {
  return `${p.dateToken}|${p.amountStr}|${normalizeForMatch(p.description)}`
}

/**
 * Passagem principal: filtros rígidos + isNonPurchaseLine na descrição.
 */
function tryAcceptPrimary(
  normalized: string
): { parts: ParsedPurchaseLineParts } | { reason: string } {
  if (isSkippableInvoiceLineWhole(normalized)) {
    return { reason: 'Institucional, rodapé, SAC ou aviso' }
  }

  if (hardBlockInvoicePurchaseLine(normalized)) {
    return { reason: 'Bloqueio forte (pagamento/limite/débito automático)' }
  }

  const blocked = rejectInvoicePurchaseLine(normalized)
  if (blocked) {
    return { reason: blocked }
  }

  const parts = parsePurchaseLineFromSection(normalized)
  if (!parts) {
    if (!LOOKS_LIKE_STRICT_DATE.test(normalized)) {
      return { reason: 'Sem data DD/MM no início' }
    }
    const { text: w } = truncateBeforeInvoiceSummarySuffix(normalized)
    const amts = extractAllBrlAmounts(w)
    if (amts.length === 0) {
      return { reason: 'Sem valor monetário (0,00) reconhecível' }
    }
    return { reason: 'Descrição curta, parcela ou formato inválido após data' }
  }

  const desc = normalizeForMatch(parts.description)
  if (!desc || desc.length < 4) {
    return { reason: 'Descrição com menos de 4 caracteres' }
  }
  if (isNonPurchaseLine(parts.description)) {
    return { reason: 'Descrição parece resumo/institucional' }
  }
  return { parts }
}

/**
 * Recuperação: filtro relaxado, sem isNonPurchaseLine (evita perder nomes com “total”, etc.).
 */
function tryAcceptFallback(normalized: string): ParsedPurchaseLineParts | null {
  if (isSkippableInvoiceLineWhole(normalized)) return null
  if (hardBlockInvoicePurchaseLine(normalized)) return null
  if (!LOOKS_LIKE_STRICT_DATE.test(normalized)) return null

  const parts = parsePurchaseLineFromSection(normalized, {
    relaxedReject: true,
    minDescChars: 3,
    recoverySource: 'fallback',
  })
  if (!parts) return null

  const amt = brlToNumber(parts.amountStr)
  if (amt < FALLBACK_MIN_AMOUNT || amt > FALLBACK_MAX_AMOUNT) return null

  return parts
}

export function scanInvoicePurchaseLines(rawText: string): {
  accepted: ParsedPurchaseLineParts[]
  debug: Pick<
    InvoiceParseDebug,
    'linesScanned' | 'acceptedCount' | 'lines'
  >
} {
  const rawLines = rawText.split(/\r?\n/)
  const merged = mergeInvoiceSplitLines(rawLines)

  const primaryAccepted: ParsedPurchaseLineParts[] = []
  const seenKeys = new Set<string>()
  const records: InvoiceParseDebug['lines'] = []

  for (const raw of merged) {
    const trimmed = raw.trim()
    if (!trimmed) {
      records.push({ raw: trimmed, normalized: '', outcome: 'rejected', reason: 'Linha vazia' })
      continue
    }

    const normalized = preprocessLine(trimmed)
    const result = tryAcceptPrimary(normalized)

    if ('parts' in result) {
      result.parts.sourceNormalizedLine = normalized
      const k = partKey(result.parts)
      const amt = brlToNumber(result.parts.amountStr)
      if (!seenKeys.has(k)) {
        seenKeys.add(k)
        primaryAccepted.push(result.parts)
        records.push({
          raw: trimmed.slice(0, 200),
          normalized: normalized.slice(0, 200),
          outcome: 'accepted',
          extractedAmount: amt,
          hadMultipleMoneyValues: result.parts.parseMeta?.hadMultipleMoneyValues === true,
          recoveredFromFallback: false,
        })
      } else {
        records.push({
          raw: trimmed.slice(0, 200),
          normalized: normalized.slice(0, 200),
          outcome: 'rejected',
          reason: 'Duplicata (mesmo lançamento)',
        })
      }
    } else {
      records.push({
        raw: trimmed.slice(0, 200),
        normalized: normalized.slice(0, 200),
        outcome: 'rejected',
        reason: result.reason,
      })
    }
  }

  const fallbackAccepted: ParsedPurchaseLineParts[] = []

  for (let i = 0; i < merged.length; i++) {
    const rec = records[i]
    if (!rec || rec.outcome === 'accepted') continue

    const trimmed = merged[i]!.trim()
    const normalized = preprocessLine(trimmed)
    const fb = tryAcceptFallback(normalized)
    if (!fb) continue
    fb.sourceNormalizedLine = normalized

    const k = partKey(fb)
    if (seenKeys.has(k)) continue

    seenKeys.add(k)
    fallbackAccepted.push(fb)
    const amt = brlToNumber(fb.amountStr)
    records[i] = {
      raw: trimmed.slice(0, 200),
      normalized: normalized.slice(0, 200),
      outcome: 'accepted',
      reason: 'Recuperado (fallback)',
      extractedAmount: amt,
      hadMultipleMoneyValues: fb.parseMeta?.hadMultipleMoneyValues === true,
      recoveredFromFallback: true,
    }
  }

  const accepted = [...primaryAccepted, ...fallbackAccepted]

  return {
    accepted,
    debug: {
      linesScanned: rawLines.length,
      acceptedCount: accepted.length,
      lines: records,
    },
  }
}
