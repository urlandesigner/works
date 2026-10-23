/**
 * Extrai o bloco "Lançamentos: compras e saques" e interpreta linhas DATA + DESCRIÇÃO + VALOR.
 * Detecção de seção tolera PDFs com texto fragmentado (busca por palavras-chave no texto compacto).
 */

import { isSkippableInvoiceLineWhole, normalizeForMatch } from './invoiceLineFilters'
import {
  hardBlockInvoicePurchaseLine,
  rejectInvoicePurchaseLine,
  rejectInvoicePurchaseLineRelaxed,
  truncateBeforeInvoiceSummarySuffix,
} from './invoicePurchaseFilters'
import { buildCompactWithMap, findHeaderEndAfterLancamentosComprasSaques } from './pdfTextNormalize'

export type SectionExtractionMode = 'section' | 'fallback' | 'none'

export interface SectionExtractionResult {
  block: string | null
  mode: SectionExtractionMode
}

/** Fim de seção (texto compacto = letras/dígitos, sem espaços). */
const SECTION_END_COMPACT_PREFIXES: string[] = [
  'comprasparceladas',
  'lancamentosinternacionais',
  'lancamentosdesaque',
  'limitesdecredito',
  'limitedecredito',
  'encargos',
  'parcelasfuturas',
  'demonstrativodeparcelas',
  'resumodafatura',
  'resumofinanceiro',
  'proximafatura',
  'iof',
  'rotativo',
  'melhordia',
  'outrolancamento',
]

function compactOfLine(line: string): string {
  return buildCompactWithMap(line).compact
}

/** Regex legado para PDFs com linhas “normais”. */
const LEGACY_END_LINE_RES: RegExp[] = [
  /^\s*compras\s+parceladas\b/i,
  /^\s*lan[çc]amentos\s+internacionais\b/i,
  /^\s*lan[çc]amentos\s+de\s+saque\b/i,
  /^\s*limites?\s+de\s+cr[eé]dito\b/i,
  /^\s*encargos\b/i,
  /^\s*parcelas\s+futuras\b/i,
  /^\s*demonstrativo\s+de\s+parcelas\b/i,
  /^\s*resumo\s+(da\s+)?fatura\b/i,
  /^\s*resumo\s+financeiro\b/i,
  /^\s*pr[oó]xim[ao]\s+fatura\b/i,
  /^\s*iof\b/i,
  /^\s*rotativo\b/i,
  /^\s*melhor\s+dia\b/i,
  /^\s*outro\s+lan[çc]amento\b/i,
]

function isSectionEndLine(trimmedLine: string): boolean {
  const t = trimmedLine.trim()
  if (!t) return false
  const compact = compactOfLine(t)
  if (!compact) return false

  if (compact.includes('lancamentoscomprasesaques')) return false

  for (const prefix of SECTION_END_COMPACT_PREFIXES) {
    if (compact.startsWith(prefix)) return true
  }

  if (compact.startsWith('lancamentos')) {
    const rest = compact.slice('lancamentos'.length)
    if (
      rest.length > 0 &&
      !rest.startsWith('comprasesaques') &&
      !rest.startsWith('compras') &&
      rest.length < 80
    ) {
      return true
    }
  }

  const n = normalizeForMatch(t)
  for (const re of LEGACY_END_LINE_RES) {
    if (re.test(t) || re.test(n)) return true
  }

  return false
}

function extractBlockFromRawStart(rawText: string, contentStart: number): string | null {
  let rest = rawText.slice(contentStart)
  rest = rest.replace(/^\s+/, '')

  const lines = rest.split(/\r?\n/)
  const out: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (isSectionEndLine(trimmed)) break
    out.push(line)
  }

  const block = out.join('\n').trim()
  return block.length > 0 ? block : null
}

export function extractLancamentosComprasESaquesBlock(
  rawText: string
): SectionExtractionResult {
  const headerEnd = findHeaderEndAfterLancamentosComprasSaques(rawText)
  if (headerEnd != null) {
    const block = extractBlockFromRawStart(rawText, headerEnd)
    if (block) return { block, mode: 'section' }
  }

  const fallback = extractFallbackTransactionBlock(rawText)
  if (fallback) return { block: fallback, mode: 'fallback' }

  return { block: null, mode: 'none' }
}

/**
 * Fallback: linhas que já parecem compra (data + valor), útil quando o título da seção não casa.
 */
function extractFallbackTransactionBlock(raw: string): string | null {
  const hits: string[] = []
  for (const line of raw.split(/\r?\n/)) {
    const n = normalizePurchaseLineFragmentation(line)
    if (parsePurchaseLineFromSection(n)) hits.push(n)
  }
  return hits.length > 0 ? hits.join('\n') : null
}

/** Reduz quebras no meio de datas, colapsa espaços e força DD/MM no início. */
export function normalizePurchaseLineFragmentation(line: string): string {
  let s = line.replace(/\s+/g, ' ').trim()
  s = s.replace(
    /^\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{2,4})\b/,
    (_, d: string, m: string, y: string) =>
      `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
  )
  s = s.replace(
    /^\s*(\d{1,2})\s*\/\s*(\d{1,2})\b(?!\s*\/)/,
    (_, d: string, m: string) => `${d.padStart(2, '0')}/${m.padStart(2, '0')}`
  )
  return s
}

const MIN_DESCRIPTION_CHARS = 4
const MIN_DESCRIPTION_CHARS_RELAXED = 3

export interface ParsePurchaseLineOptions {
  /** Usa filtro relaxado (ex.: não bloqueia só por "total" no nome do estabelecimento). */
  relaxedReject?: boolean
  minDescChars?: number
  /** Origem para rastreio (recuperação). */
  recoverySource?: 'primary' | 'fallback'
}

/** Linha inteira claramente não é compra (totais, pagamentos, saldo). */
function isSkippableSectionLine(trimmed: string): boolean {
  const n = normalizeForMatch(trimmed)
  if (!n) return true

  if (/^\s*total\b/i.test(trimmed)) return true
  if (/^\s*subtotal\b/i.test(trimmed)) return true
  if (/^\s*pagamento\b/i.test(trimmed)) return true
  if (/^\s*saldo\b/i.test(trimmed)) return true
  if (/^\s*cr[eé]ditos?\b/i.test(trimmed) && !/\d{2}\/\d{2}/.test(trimmed)) return true
  if (/^\s*d[eé]bitos?\b/i.test(trimmed) && !/\d{2}\/\d{2}/.test(trimmed)) return true

  if (n.includes('pagamento de fatura')) return true
  if (n.includes('pagamento recebido')) return true
  if (n.includes('credito de pagamento')) return true
  if (n.includes('crédito de pagamento')) return true

  return false
}

export interface ParsedPurchaseLineParts {
  dateToken: string
  description: string
  installment: string | null
  amountStr: string
  /** Preenchido pelo scanner para pontuação de confiança. */
  sourceNormalizedLine?: string
  parseMeta?: {
    hadMultipleMoneyValues: boolean
    truncatedBeforeSummary: boolean
    recoverySource?: 'primary' | 'fallback'
  }
}

/**
 * Linha de compra: DD/MM obrigatório no início, valor = último BRL na parte útil
 * (após cortar sufixos tipo "Total para próximas faturas").
 */
export function parsePurchaseLineFromSection(
  line: string,
  options?: ParsePurchaseLineOptions
): ParsedPurchaseLineParts | null {
  const prepared = normalizePurchaseLineFragmentation(line)
  const trimmed = prepared.trim()
  if (!trimmed || isSkippableSectionLine(trimmed) || isSkippableInvoiceLineWhole(trimmed))
    return null

  if (hardBlockInvoicePurchaseLine(trimmed)) return null

  const rejectFn = options?.relaxedReject
    ? rejectInvoicePurchaseLineRelaxed
    : rejectInvoicePurchaseLine
  if (rejectFn(trimmed)) return null

  const { text: working, truncated } = truncateBeforeInvoiceSummarySuffix(trimmed)

  if (!/^\d{2}\/\d{2}/.test(working)) return null

  const allBrl = [...working.matchAll(/\d{1,3}(?:\.\d{3})*,\d{2}/g)]
  if (allBrl.length === 0) return null

  /** Primeiro valor na linha (compra) — o último costuma ser resumo/total colado. */
  const first = allBrl[0]!
  const amountStr = first[0]!
  const firstIdx = first.index!
  const hadMultipleMoneyValues = allBrl.length > 1

  const beforeAmount = working.slice(0, firstIdx).trim()

  const dateHead = beforeAmount.match(/^(\d{2}\/\d{2}(?:\/\d{2,4})?)\s+(.+)$/)
  if (!dateHead?.[1] || !dateHead[2]) return null

  const dateToken = dateHead[1]
  let middle = dateHead[2].trim()

  let installment: string | null = null
  const instM = middle.match(/\s+(\d{1,2}\s*\/\s*\d{1,2})\s*$/)
  if (instM?.[1]) {
    const a = Number.parseInt(instM[1].split('/')[0]!, 10)
    const b = Number.parseInt(instM[1].split('/')[1]!, 10)
    if (a >= 1 && a <= 12 && b >= 1 && b <= 48) {
      installment = instM[1].replace(/\s/g, '')
      middle = middle.slice(0, middle.length - instM[0].length).trim()
    }
  }

  const description = middle.replace(/\s+/g, ' ').trim()
  const minDesc =
    options?.minDescChars ??
    (options?.relaxedReject ? MIN_DESCRIPTION_CHARS_RELAXED : MIN_DESCRIPTION_CHARS)
  if (description.length < minDesc) return null

  const recoverySource = options?.recoverySource ?? 'primary'

  return {
    dateToken,
    description,
    installment,
    amountStr,
    parseMeta: {
      hadMultipleMoneyValues,
      truncatedBeforeSummary: truncated,
      recoverySource,
    },
  }
}
