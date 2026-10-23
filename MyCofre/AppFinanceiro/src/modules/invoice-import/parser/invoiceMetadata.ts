/**
 * Extrai metadados comuns de texto bruto de fatura (heurísticas genéricas BR).
 * Total da fatura: prioriza rótulos de fatura e evita limite de crédito / pagamento mínimo.
 */

import { buildCompactWithMap } from './pdfTextNormalize'

const BRL_AMOUNT = /(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/gi

export function parseBrlAmountString(match: string): number {
  const normalized = match
    .replace(/r\$\s*/gi, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim()
  const n = Number.parseFloat(normalized)
  return Number.isFinite(n) ? n : 0
}

/**
 * Palavras-chave no texto compacto (sem espaços) que indicam onde NÃO está o total da fatura.
 */
const NEGATIVE_CONTEXT_COMPACT: string[] = [
  'limitedecredito',
  'limitetotal',
  'limitedisponivel',
  'limiteglobal',
  'limiteparcelado',
  'pagamentominimo',
  'totalfinanciado',
  'limitemaximo',
  'saquesnocredito',
]

/**
 * Ordem de prioridade: total da fatura (não limite).
 */
const POSITIVE_TOTAL_KEYWORDS_COMPACT: string[] = [
  'totaldestafatura',
  'ototaldasuafaturae',
  'ototaldasuafatura',
  'totaldasuafatura',
  'totaldestasfatura',
  'totalapagar',
  'valordestafatura',
  'valordafatura',
  'totalgeralapagar',
  'totaldafaturaatual',
  'totalnafatura',
]

/** Fallback quando compact não acha (PDF sem fragmentação extrema). */
const POSITIVE_LINE_REGEXES: RegExp[] = [
  /total\s+desta\s+fatura[^\d]{0,90}(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i,
  /total\s+da\s+sua\s+fatura[^\d]{0,90}(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i,
  /o\s+total\s+da\s+sua\s+fatura\s+é[^\d]{0,40}(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i,
  /valor\s+da\s+fatura[^\d]{0,90}(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i,
  /total\s+a\s+pagar[^\d]{0,90}(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i,
  /resumo\s+da\s+fatura[^\d]{0,120}(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i,
]

function compactOf(slice: string): string {
  return buildCompactWithMap(slice).compact
}

function sliceLooksNegativeForTotal(slice: string): boolean {
  const c = compactOf(slice)
  for (const neg of NEGATIVE_CONTEXT_COMPACT) {
    if (c.includes(neg)) return true
  }
  return false
}

function firstBrlInRawSlice(slice: string): number | null {
  const m = slice.match(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i)
  if (!m?.[1]) return null
  const v = parseBrlAmountString(m[1])
  return v > 0 ? v : null
}

/**
 * Extrai valor após keyword no texto compacto, usando posição no original.
 */
function extractTotalViaCompactKeywords(raw: string): number | null {
  const { compact, indexMap } = buildCompactWithMap(raw)
  if (!compact.length) return null

  for (const kw of POSITIVE_TOTAL_KEYWORDS_COMPACT) {
    let pos = 0
    while (pos < compact.length) {
      const idx = compact.indexOf(kw, pos)
      if (idx < 0) break
      const lastCharIdx = idx + kw.length - 1
      const rawEndOfKw = indexMap[lastCharIdx]
      if (rawEndOfKw === undefined) {
        pos = idx + 1
        continue
      }
      const slice = raw.slice(rawEndOfKw + 1, Math.min(raw.length, rawEndOfKw + 1 + 420))
      if (!sliceLooksNegativeForTotal(slice)) {
        const v = firstBrlInRawSlice(slice)
        if (v != null) return v
      }
      pos = idx + 1
    }
  }

  return null
}

function extractTotalViaLineRegexes(text: string): number | null {
  const lines = text.split(/\n/)
  for (const line of lines) {
    if (sliceLooksNegativeForTotal(line)) continue
    for (const re of POSITIVE_LINE_REGEXES) {
      const m = line.match(re)
      if (m?.[1]) {
        const v = parseBrlAmountString(m[1])
        if (v > 0) return v
      }
    }
  }
  return null
}

/**
 * Total a pagar / total desta fatura — nunca o maior valor da página.
 */
export function extractTotalAmountFromText(text: string): number | null {
  const a = extractTotalViaCompactKeywords(text)
  if (a != null) return a

  const b = extractTotalViaLineRegexes(text)
  if (b != null) return b

  /** Último recurso: linha com "total" + "fatura" sem contexto de limite. */
  const lines = text.split(/\n/)
  for (const line of lines) {
    const l = line.toLowerCase()
    if (!l.includes('total') || !l.includes('fatura')) continue
    if (
      l.includes('limite') ||
      l.includes('crédito') ||
      l.includes('credito') ||
      l.includes('disponível') ||
      l.includes('disponivel') ||
      l.includes('parcelado') ||
      l.includes('financiado')
    ) {
      continue
    }
    BRL_AMOUNT.lastIndex = 0
    const m = BRL_AMOUNT.exec(line)
    if (m?.[1]) {
      const v = parseBrlAmountString(m[1])
      if (v > 0) return v
    }
  }

  return null
}

/** Total da lista principal de compras (rótulo comum em faturas). */
export function extractTotalLancamentosAtuaisFromText(text: string): number | null {
  const { compact, indexMap } = buildCompactWithMap(text)
  const kwList = [
    'totaldelancamentosatuais',
    'totallancamentosatuais',
    'totaldoslancamentos',
  ]

  for (const kw of kwList) {
    let pos = 0
    while (pos < compact.length) {
      const idx = compact.indexOf(kw, pos)
      if (idx < 0) break
      const lastCharIdx = idx + kw.length - 1
      const rawEnd = indexMap[lastCharIdx]
      if (rawEnd === undefined) {
        pos = idx + 1
        continue
      }
      const slice = text.slice(rawEnd + 1, Math.min(text.length, rawEnd + 1 + 320))
      const v = firstBrlInRawSlice(slice)
      if (v != null) return v
      pos = idx + 1
    }
  }

  const patterns = [
    /total\s+de\s+lancamentos\s+atuais[^\d]{0,50}(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i,
    /total\s+de\s+lan[çc]amentos\s+atuais[^\d]{0,50}(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i,
    /total\s+lancamentos\s+atuais[^\d]{0,50}(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i,
    /total\s+lan[çc]amentos\s+atuais[^\d]{0,50}(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/i,
  ]

  for (const re of patterns) {
    const m = text.match(re)
    if (m?.[1]) {
      const v = parseBrlAmountString(m[1])
      if (v > 0) return v
    }
  }

  return null
}

/** Data de vencimento DD/MM/AAAA próxima a palavras-chave. */
export function extractDueDateFromText(text: string): string | null {
  const re =
    /(?:vencimento|venc\.?|data\s+de\s+vencimento)[^\d]{0,30}(\d{2}\/\d{2}\/\d{4})/i
  const m = text.match(re)
  if (m?.[1]) return toIsoDate(m[1])
  return null
}

/** Mês de referência: MM/AAAA ou texto "referência". */
export function extractReferenceMonthFromText(text: string): string | null {
  const re =
    /(?:referencia|referência|ref\.?|competencia|competência)[^\d]{0,25}(\d{2}\/\d{4}|\d{2}\/\d{2}\/\d{4})/i
  const m = text.match(re)
  if (m?.[1]) {
    const raw = m[1]
    if (raw.length === 7) return raw
    const parts = raw.split('/')
    if (parts.length === 3) return `${parts[1]}/${parts[2]}`
  }
  const m2 = text.match(/\b(\d{2}\/\d{4})\b/)
  if (m2?.[1]) return m2[1]
  return null
}

function toIsoDate(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split('/')
  return `${y}-${m}-${d}`
}

const ISSUER_HINTS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bitau\b|\bitaú\b/i, label: 'Itaú' },
  { pattern: /\bnubank\b/i, label: 'Nubank' },
  { pattern: /\bbradesco\b/i, label: 'Bradesco' },
  { pattern: /\bbanco do brasil\b|\bbb\b/i, label: 'Banco do Brasil' },
  { pattern: /\bsantander\b/i, label: 'Santander' },
  { pattern: /\bc6 bank\b|\bc6\b/i, label: 'C6 Bank' },
  { pattern: /\binter\b/i, label: 'Inter' },
  { pattern: /\bmastercard\b/i, label: 'Mastercard' },
  { pattern: /\bvisa\b/i, label: 'Visa' },
  { pattern: /\belo\b/i, label: 'Elo' },
]

export function extractIssuerHint(text: string): string | null {
  const head = text.slice(0, 4000)
  for (const { pattern, label } of ISSUER_HINTS) {
    if (pattern.test(head)) return label
  }
  return null
}

export function extractCardNameHint(text: string): string | null {
  const m = text.match(
    /(?:cartao|cartão)\s+[^:\n]{0,40}:\s*([^\n]+)/i
  )
  if (m?.[1]) return m[1].trim().slice(0, 80)
  return null
}
