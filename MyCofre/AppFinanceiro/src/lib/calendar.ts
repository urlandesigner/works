import type { Transaction, TransactionRecurrence } from '../types'

/** Recorrência efetiva: usa recurrence se definido, senão recurring true → monthly. */
export function getEffectiveRecurrence(t: Transaction): TransactionRecurrence {
  if (t.recurrence && t.recurrence !== 'none') return t.recurrence
  if (t.recurring) return 'monthly'
  return 'none'
}

/** Retorna o número de dias no mês (1-31). */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/** Dia da semana do primeiro dia do mês (0 = domingo). */
export function getFirstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay()
}

/**
 * Ano, mês (1–12) e dia civil a partir de `transaction_date`
 * (YYYY-MM-DD ou string parseável por `Date`, ex. ISO com hora).
 */
export function parseTransactionYMD(
  dateStr: string
): { year: number; month: number; day: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null
  const d = dateStr.trim()
  const iso = d.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) {
    const year = parseInt(iso[1], 10)
    const month = parseInt(iso[2], 10)
    const day = parseInt(iso[3], 10)
    if (
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31 &&
      Number.isFinite(year)
    ) {
      return { year, month, day }
    }
  }
  const parsed = new Date(d)
  if (!Number.isNaN(parsed.getTime())) {
    return {
      year: parsed.getFullYear(),
      month: parsed.getMonth() + 1,
      day: parsed.getDate(),
    }
  }
  return null
}

/**
 * Mesma regra do calendário da home: ocorrências mensais/anuais aparecem em todo mês
 * (ou todo ano no mesmo mês), não só no mês da data gravada.
 */
export function transactionMatchesCalendarMonthView(
  t: Transaction,
  year: number,
  month: number
): boolean {
  const ymd = parseTransactionYMD(t.transaction_date)
  if (!ymd) return false
  const rec = getEffectiveRecurrence(t)
  if (rec === 'none') {
    return ymd.year === year && ymd.month === month
  }
  if (rec === 'monthly') {
    return true
  }
  if (rec === 'yearly') {
    return ymd.month === month
  }
  return false
}

/**
 * Para um mês (year, month 1-12) e lista de transações, retorna:
 * - daysWithTransactions: Set com dias (1-31) que têm ao menos uma transação
 * - transactionsByDate: Map YYYY-MM-DD → Transaction[] para esse mês
 */
export function getTransactionDaysInMonth(
  year: number,
  month: number,
  transactions: Transaction[]
): { daysWithTransactions: Set<number>; transactionsByDate: Map<string, Transaction[]> } {
  const daysWithTransactions = new Set<number>()
  const transactionsByDate = new Map<string, Transaction[]>()
  const daysInMonth = getDaysInMonth(year, month)
  const monthStr = String(month).padStart(2, '0')

  function add(day: number, tx: Transaction) {
    if (day < 1 || day > daysInMonth) return
    daysWithTransactions.add(day)
    const dateKey = `${year}-${monthStr}-${String(day).padStart(2, '0')}`
    const list = transactionsByDate.get(dateKey) ?? []
    if (!list.find((t) => t.id === tx.id)) list.push(tx)
    transactionsByDate.set(dateKey, list)
  }

  for (const t of transactions) {
    if (!transactionMatchesCalendarMonthView(t, year, month)) continue
    const ymd = parseTransactionYMD(t.transaction_date)
    if (!ymd || ymd.day < 1 || ymd.day > 31) continue
    add(ymd.day, t)
  }

  return { daysWithTransactions, transactionsByDate }
}

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/** Nome completo para leitores de tela / aria-label (ordem: domingo … sábado). */
const WEEKDAY_NAMES_LONG = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const
const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export { WEEKDAY_LABELS, WEEKDAY_NAMES_LONG, MONTH_LABELS }
