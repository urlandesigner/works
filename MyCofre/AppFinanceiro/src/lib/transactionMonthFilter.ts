import type { Transaction } from '../types'
import {
  MONTH_LABELS,
  getDaysInMonth,
  getEffectiveRecurrence,
  parseTransactionYMD,
} from './calendar'

/** Prefixo YYYY-MM-DD a partir de `transaction_date` (ignora hora se houver). */
export function transactionDateKeyForRange(dateStr: string): string | null {
  const m = dateStr?.trim().match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : null
}

/** `selectedMonth` no formato YYYY-MM. */
export function isTransactionInSelectedMonth(
  transactionDate: string,
  selectedMonth: string
): boolean {
  const d = transactionDateKeyForRange(transactionDate)
  if (!d) return false
  const [y, mo] = selectedMonth.split('-').map(Number)
  if (!Number.isFinite(y) || !Number.isFinite(mo) || mo < 1 || mo > 12) {
    return false
  }
  const start = `${y}-${String(mo).padStart(2, '0')}-01`
  const lastDay = new Date(y, mo, 0).getDate()
  const end = `${y}-${String(mo).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return d >= start && d <= end
}

export function formatYearMonthLabel(ym: string): string {
  const [ys, ms] = ym.split('-')
  const y = Number(ys)
  const m = Number(ms)
  if (!Number.isFinite(y) || m < 1 || m > 12) return ym
  return `${MONTH_LABELS[m - 1]} ${y}`
}

/** Meses YYYY-MM para o dropdown: todos que aparecem nas transações + mês atual + `selectedMonth`. */
export function buildTransactionMonthOptions(
  transactions: Transaction[],
  selectedMonth: string
): string[] {
  const set = new Set<string>()
  const now = new Date()
  const cur = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  set.add(cur)
  set.add(selectedMonth)
  for (const t of transactions) {
    const d = transactionDateKeyForRange(t.transaction_date)
    if (d) set.add(d.slice(0, 7))
  }
  return Array.from(set).sort((a, b) => b.localeCompare(a))
}

export function currentYearMonthString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function parseYearMonth(ym: string): { year: number; month: number } | null {
  const [ys, ms] = ym.split('-')
  const year = Number(ys)
  const month = Number(ms)
  if (!Number.isFinite(year) || month < 1 || month > 12) return null
  return { year, month }
}

function periodIndex(y: number, m: number): number {
  return y * 12 + m
}

/** Data da ocorrência no mês alvo, com dia limitado ao último dia do mês (ex.: 31 → fev). */
function occurrenceDateInMonth(
  anchorDay: number,
  selYear: number,
  selMonth: number
): string {
  const dim = getDaysInMonth(selYear, selMonth)
  const day = Math.min(anchorDay, dim)
  return `${selYear}-${String(selMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isSameOccurrenceFingerprint(
  a: Transaction,
  b: Transaction,
  dateKey: string
): boolean {
  const dk = transactionDateKeyForRange(b.transaction_date)
  return (
    dk === dateKey &&
    a.account_id === b.account_id &&
    a.category_id === b.category_id &&
    a.type === b.type &&
    Math.abs(a.amount - b.amount) < 0.005
  )
}

/**
 * Transações do mês: lançamentos com data civil no intervalo + ocorrências virtuais
 * de recorrentes (mensal/anual) que se aplicam ao mês, sem persistir no banco.
 */
export function expandTransactionsForSelectedMonth(
  transactions: Transaction[],
  selectedMonth: string
): Transaction[] {
  const sel = parseYearMonth(selectedMonth)
  if (!sel) {
    return transactions.filter((t) =>
      isTransactionInSelectedMonth(t.transaction_date, selectedMonth)
    )
  }
  const { year: sy, month: sm } = sel

  const realInMonth = transactions.filter((t) =>
    isTransactionInSelectedMonth(t.transaction_date, selectedMonth)
  )

  const virtuals: Transaction[] = []

  for (const t of transactions) {
    const rec = getEffectiveRecurrence(t)
    if (rec === 'none') continue

    const anchor = parseTransactionYMD(t.transaction_date)
    if (!anchor) continue

    const anchorPi = periodIndex(anchor.year, anchor.month)
    const selPi = periodIndex(sy, sm)

    if (rec === 'monthly') {
      if (selPi < anchorPi) continue
      if (anchor.year === sy && anchor.month === sm) continue
    }

    if (rec === 'yearly') {
      if (anchor.month !== sm) continue
      if (sy < anchor.year) continue
      if (sy === anchor.year) continue
    }

    const occDate = occurrenceDateInMonth(anchor.day, sy, sm)

    const hasEquivalentReal = realInMonth.some((r) =>
      isSameOccurrenceFingerprint(t, r, occDate)
    )
    if (hasEquivalentReal) continue

    virtuals.push({
      ...t,
      transaction_date: occDate,
    })
  }

  return [...realInMonth, ...virtuals]
}

/** Normaliza para `YYYY-MM-DD` (ignora hora em ISO). */
export function normalizeStatementDateKey(
  raw: string | undefined | null
): string | null {
  const t = raw?.trim()
  if (!t) return null
  const fromTx = transactionDateKeyForRange(t)
  if (fromTx) return fromTx
  if (t.length >= 10 && /^\d{4}-\d{2}-\d{2}$/.test(t.slice(0, 10))) {
    return t.slice(0, 10)
  }
  return null
}

function enumerateYearMonthsBetween(startKey: string, endKey: string): string[] {
  const sy = parseInt(startKey.slice(0, 4), 10)
  const sm = parseInt(startKey.slice(5, 7), 10)
  const ey = parseInt(endKey.slice(0, 4), 10)
  const em = parseInt(endKey.slice(5, 7), 10)
  if (
    ![sy, sm, ey, em].every(Number.isFinite) ||
    sm < 1 ||
    sm > 12 ||
    em < 1 ||
    em > 12
  ) {
    return []
  }
  const out: string[] = []
  let y = sy
  let m = sm
  const endPi = ey * 12 + em
  while (y * 12 + m <= endPi) {
    out.push(`${y}-${String(m).padStart(2, '0')}`)
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }
  return out
}

/**
 * Lista de transações no intervalo [rangeStart, rangeEnd] (datas civis inclusivas),
 * com ocorrências virtuais de recorrentes alinhadas à tela de transações.
 */
export function expandTransactionsForDateRange(
  transactions: Transaction[],
  rangeStart: string,
  rangeEnd: string
): Transaction[] {
  const start = normalizeStatementDateKey(rangeStart)
  const end = normalizeStatementDateKey(rangeEnd)
  if (!start || !end || start > end) return []

  const months = enumerateYearMonthsBetween(start, end)
  const byKey = new Map<string, Transaction>()

  for (const ym of months) {
    const expanded = expandTransactionsForSelectedMonth(transactions, ym)
    for (const t of expanded) {
      const dk = transactionDateKeyForRange(t.transaction_date)
      if (!dk || dk < start || dk > end) continue
      byKey.set(`${t.id}-${dk}`, t)
    }
  }

  return Array.from(byKey.values()).sort((a, b) => {
    const db = transactionDateKeyForRange(b.transaction_date) ?? ''
    const da = transactionDateKeyForRange(a.transaction_date) ?? ''
    const c = db.localeCompare(da)
    if (c !== 0) return c
    return b.id.localeCompare(a.id)
  })
}
