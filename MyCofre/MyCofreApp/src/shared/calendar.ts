import type { Transaction, TransactionRecurrence } from './types/transaction'

/**
 * Ano e mês civil da transação (1–12), a partir de `transaction_date`.
 */
export function getTransactionYearMonth(
  dateStr: string
): { year: number; month: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null
  const d = dateStr.trim()
  const iso = d.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?(?:[T\s]|$)/)
  if (iso) {
    const year = parseInt(iso[1], 10)
    const month = parseInt(iso[2], 10)
    if (month >= 1 && month <= 12) return { year, month }
  }
  const parsed = new Date(d)
  if (!Number.isNaN(parsed.getTime())) {
    return { year: parsed.getFullYear(), month: parsed.getMonth() + 1 }
  }
  return null
}

function monthIndex(year: number, month: number): number {
  return year * 12 + (month - 1)
}

function parseMonthAndDay(dateStr: string): { month: number; day: number } | null {
  const d = dateStr.trim()
  const iso = d.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) {
    return { month: parseInt(iso[2], 10), day: parseInt(iso[3], 10) }
  }
  const parsed = new Date(d)
  if (!Number.isNaN(parsed.getTime())) {
    return { month: parsed.getMonth() + 1, day: parsed.getDate() }
  }
  return null
}

/**
 * Mesma regra do calendário da home (web): recorrência mensal/anual conta no mês
 * de competência, não só na data gravada.
 */
export function transactionMatchesCalendarMonthView(
  t: Transaction,
  year: number,
  month: number
): boolean {
  const recurrence: TransactionRecurrence =
    t.recurrence ?? (t.recurring ? 'monthly' : 'none')

  if (recurrence === 'none') {
    const ym = getTransactionYearMonth(t.transaction_date)
    return ym !== null && ym.year === year && ym.month === month
  }

  const anchor = getTransactionYearMonth(t.transaction_date)
  if (!anchor) return false
  const anchorIdx = monthIndex(anchor.year, anchor.month)
  const viewIdx = monthIndex(year, month)

  if (recurrence === 'monthly') {
    return viewIdx >= anchorIdx
  }

  if (recurrence === 'yearly') {
    const md = parseMonthAndDay(t.transaction_date)
    if (!md || md.month !== month) return false
    return viewIdx >= anchorIdx
  }

  return false
}
