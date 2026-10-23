import type { ParsedFinanceAction } from '../types'
import { normalizeDescription } from '../utils/normalizeDescription'

function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function parseBrlAmount(s: string): number {
  return Number.parseFloat(s.replace(/\./g, '').replace(',', '.').trim())
}

/**
 * Extrai valor monetário (BRL e inteiros comuns). Heurística local — trocável por modelo depois.
 */
function extractAmount(text: string): number | null {
  const normalized = text.replace(/\s+/g, ' ').trim()

  const beforeDia = normalized.match(/\b(\d{2,6})\s+dia\s+\d{1,2}\b/i)
  if (beforeDia) return Number.parseInt(beforeDia[1]!, 10)

  const brlFull = normalized.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/)
  if (brlFull) return parseBrlAmount(brlFull[1]!)

  const commaDec = normalized.match(/\b(\d{1,3}),(\d{2})\b/)
  if (commaDec) return Number.parseFloat(`${commaDec[1]}.${commaDec[2]}`)

  const big = normalized.match(/\b(\d{4,})\b/)
  if (big) return Number.parseInt(big[1]!, 10)

  const afterVerb = normalized.match(
    /\b(?:gastei|paguei|recebi|ganhei|comprei|r\$)\s*(\d{1,6})\b/i
  )
  if (afterVerb) return Number.parseInt(afterVerb[1]!, 10)

  const noWord = normalized.match(/\b(\d{1,3})\s+no\s+/i)
  if (noWord) return Number.parseInt(noWord[1]!, 10)

  const trailing = normalized.match(/\b(\d{2,6})\s*$/i)
  if (trailing && !/\bdia\s+\d{1,2}\s*$/i.test(normalized)) {
    return Number.parseInt(trailing[1]!, 10)
  }

  const lead = normalized.match(/^(\d{1,4})\s+/)
  if (lead) return Number.parseInt(lead[1]!, 10)

  return null
}

function extractDate(text: string): { iso: string; assumed: boolean } {
  const t = text.toLowerCase()
  const now = new Date()

  if (/\bhoje\b/.test(t)) return { iso: toIso(now), assumed: false }
  if (/\bontem\b/.test(t)) return { iso: toIso(addDays(now, -1)), assumed: false }
  if (/\banteontem\b/.test(t)) return { iso: toIso(addDays(now, -2)), assumed: false }

  const br = t.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/)
  if (br) {
    const d = Number.parseInt(br[1]!, 10)
    const m = Number.parseInt(br[2]!, 10) - 1
    let y = now.getFullYear()
    if (br[3]) {
      const yy = br[3].length === 2 ? 2000 + Number.parseInt(br[3], 10) : Number.parseInt(br[3], 10)
      y = yy
    }
    return { iso: toIso(new Date(y, m, d)), assumed: false }
  }

  const dia = t.match(/\bdia\s+(\d{1,2})\b/)
  if (dia) {
    const d = Number.parseInt(dia[1]!, 10)
    const dt = new Date(now.getFullYear(), now.getMonth(), d)
    return { iso: toIso(dt), assumed: false }
  }

  return { iso: toIso(now), assumed: true }
}

function suggestCategory(text: string): string | null {
  const t = text.toLowerCase()
  if (/ifood|restaurante|food|lanche|pizza|burger|mercado|supermercado|padaria/.test(t))
    return 'Alimentação'
  if (/uber|99|taxi|transporte|ônibus|onibus|metro|combustivel|gasolina/.test(t))
    return 'Transporte'
  if (/farmácia|farmacia|drogaria|saúde|saude|médico|medico|hospital/.test(t)) return 'Saúde'
  if (/salário|salario|freelance|renda|bônus|bonus|pix recebido|depósito|deposito/.test(t))
    return 'Renda'
  return null
}

function extractDescription(original: string, amount: number | null): string {
  let s = original.trim()
  if (amount != null) {
    const strAmt = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    s = s.replace(strAmt, ' ')
    s = s.replace(String(amount), ' ')
  }
  s = s.replace(/\d{1,3}(?:\.\d{3})*,\d{2}/g, ' ')
  s = s.replace(/\b\d+,\d{2}\b/g, ' ')
  s = s.replace(/\b\d{4,}\b/g, ' ')
  s = s.replace(/\bhoje\b|\bontem\b|\banteontem\b/gi, ' ')
  s = s.replace(/\bdia\s+\d{1,2}\b/gi, ' ')
  s = s.replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g, ' ')
  s = s.replace(/\bgastei|paguei|recebi|ganhei|comprei|no\b/gi, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  return s.length >= 2 ? s : 'Movimentação'
}

function detectIntent(text: string): { type: 'income' | 'expense'; confidence: number } {
  const t = text.toLowerCase()
  let inc = 0
  let exp = 0

  if (/\brecebi\b|\bganhei\b|\bsalário\b|\bsalario\b|\bentrada\b|\bfreelance\b|\bdep[oó]sito\b|\bpix recebido\b/.test(t))
    inc += 3
  if (/\bgastei\b|\bpaguei\b|\bcomprei\b|\bdespesa\b/.test(t)) exp += 3
  if (/ifood|mercado|uber|farmácia|farmacia|supermercado/.test(t)) exp += 1
  if (/salário|salario|freelance|renda/.test(t)) inc += 2

  if (inc > exp) return { type: 'income', confidence: Math.min(0.95, 0.5 + inc * 0.1) }
  if (exp > inc) return { type: 'expense', confidence: Math.min(0.95, 0.5 + exp * 0.1) }
  if (/\brecebi|\bganhei|\bsalário|\bsalario/.test(t)) return { type: 'income', confidence: 0.55 }
  if (/\bgastei|\bpaguei|\bcomprei/.test(t)) return { type: 'expense', confidence: 0.55 }
  return { type: 'expense', confidence: 0.45 }
}

/**
 * Interpreta texto livre com regras locais (sem serviço externo).
 * Pode ser trocada por um modelo no futuro mantendo o mesmo retorno.
 */
export function parseFinanceMessage(input: string): ParsedFinanceAction {
  const raw = input.trim()
  if (!raw) {
    return {
      intent: 'unknown',
      confidence: 0,
      data: {},
      missingFields: ['valor', 'descrição', 'tipo'],
    }
  }

  const amount = extractAmount(raw)
  const { iso: dateIso, assumed: dateAssumed } = extractDate(raw)
  const { type, confidence: intentConf } = detectIntent(raw)
  const description = normalizeDescription(extractDescription(raw, amount))
  const category = suggestCategory(raw + ' ' + description)

  const missingFields: string[] = []
  if (amount == null || amount <= 0) missingFields.push('valor')
  if (!description || description.length < 2) missingFields.push('descrição')
  if (dateAssumed) missingFields.push('data explícita')

  let intent: ParsedFinanceAction['intent'] = type
  if (amount == null) intent = 'unknown'

  const baseConf = intent === 'unknown' ? 0.25 : intentConf
  const penalty = missingFields.length * 0.12
  const confidence = Math.max(0.15, Math.min(0.98, baseConf - penalty))

  return {
    intent,
    confidence,
    data: {
      type,
      amount: amount ?? undefined,
      description,
      date: dateIso,
      category,
      dateAssumed: dateAssumed,
    },
    missingFields,
  }
}
