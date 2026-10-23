import type { CreditCard, CreditCardBill } from '../types'
import type { Subscription } from '../types'
import type { Transaction } from '../types'
import { getEffectiveRecurrence } from './calendar'
import { getDaysInMonth } from './calendar'

export type TodayReminderKind =
  | 'subscription'
  | 'credit_card_bill'
  | 'recurring_transaction'

export interface TodayReminderItem {
  id: string
  kind: TodayReminderKind
  title: string
  amount: number
  supportText: string
}

function billingDayMatchesToday(
  billingDay: number,
  year: number,
  month: number,
  todayDay: number
): boolean {
  const last = getDaysInMonth(year, month)
  const effective = Math.min(billingDay, last)
  return todayDay === effective
}

/**
 * Mês da cobrança anual: prioriza `billing_month` (fonte do formulário/DB),
 * com fallback em `created_at` para registros antigos sem mês explícito.
 */
function annualChargeMonth(sub: Subscription): number | null {
  if (sub.billing_month != null && sub.billing_month >= 1 && sub.billing_month <= 12) {
    return sub.billing_month
  }
  if (!sub.created_at) return null
  const created = new Date(sub.created_at)
  if (Number.isNaN(created.getTime())) return null
  return created.getMonth() + 1
}

function subscriptionMatchesToday(
  sub: Subscription,
  y: number,
  m: number,
  d: number
): boolean {
  if (sub.status !== 'active') return false

  const periodicity = sub.periodicity ?? 'monthly'

  if (periodicity === 'annual') {
    const chargeMonth = annualChargeMonth(sub)
    if (chargeMonth === null) return false
    if (chargeMonth !== m) return false
    return billingDayMatchesToday(sub.billing_day, y, m, d)
  }

  return billingDayMatchesToday(sub.billing_day, y, m, d)
}

/** Fatura em aberto cujo fechamento do período cai no último dia do mês da competência. */
function billClosingIsToday(
  bill: CreditCardBill,
  y: number,
  m: number,
  d: number
): boolean {
  if (bill.isPaid) return false
  if (bill.year !== y || bill.month !== m) return false
  const lastOfCompetence = getDaysInMonth(bill.year, bill.month)
  return d === lastOfCompetence
}

function parseTransactionYMD(dateStr: string): {
  y: number
  m: number
  d: number
} | null {
  const match = dateStr.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (!match) return null
  const y = parseInt(match[1], 10)
  const mo = parseInt(match[2], 10)
  const d = parseInt(match[3], 10)
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null
  return { y, m: mo, d }
}

function recurringTransactionMatchesToday(
  t: Transaction,
  y: number,
  m: number,
  d: number
): boolean {
  const rec = getEffectiveRecurrence(t)
  if (rec === 'none') return false

  const parsed = parseTransactionYMD(t.transaction_date)
  if (!parsed) return false
  const { m: tMonth, d: tDay } = parsed

  if (rec === 'monthly') {
    return billingDayMatchesToday(tDay, y, m, d)
  }

  if (rec === 'yearly') {
    if (tMonth !== m) return false
    return billingDayMatchesToday(tDay, y, m, d)
  }

  return false
}

/**
 * Consolida lembretes para a data informada (assinaturas, faturas e recorrências).
 * Lógica pura — não depende de React.
 */
export function buildTodaysReminders(input: {
  /** Data de referência (use início do dia local). */
  today: Date
  subscriptions: Subscription[]
  bills: CreditCardBill[]
  creditCards: CreditCard[]
  transactions: Transaction[]
}): TodayReminderItem[] {
  const { today, subscriptions, bills, creditCards, transactions } = input
  const y = today.getFullYear()
  const m = today.getMonth() + 1
  const d = today.getDate()

  const items: TodayReminderItem[] = []
  const cardName = (id: string) =>
    creditCards.find((c) => c.id === id)?.name ?? 'Cartão'

  for (const sub of subscriptions) {
    if (!subscriptionMatchesToday(sub, y, m, d)) continue
    items.push({
      id: `sub-${sub.id}`,
      kind: 'subscription',
      title: sub.name,
      amount: sub.monthly_amount,
      supportText:
        sub.periodicity === 'annual'
          ? 'Cobrança anual prevista hoje'
          : 'Cobrança prevista hoje',
    })
  }

  for (const bill of bills) {
    if (!billClosingIsToday(bill, y, m, d)) continue
    items.push({
      id: `bill-${bill.id}`,
      kind: 'credit_card_bill',
      title: `${cardName(bill.creditCardId)} · fatura`,
      amount: bill.amount,
      supportText: 'Fechamento / vence hoje',
    })
  }

  for (const t of transactions) {
    if (!recurringTransactionMatchesToday(t, y, m, d)) continue
    const label =
      t.description?.trim() ||
      (t.type === 'expense' ? 'Despesa recorrente' : 'Receita recorrente')
    items.push({
      id: `tx-${t.id}-${y}-${m}-${d}`,
      kind: 'recurring_transaction',
      title: label,
      amount: t.amount,
      supportText: 'Ocorrência prevista hoje',
    })
  }

  items.sort((a, b) => {
    const k = a.kind.localeCompare(b.kind)
    if (k !== 0) return k
    return a.title.localeCompare(b.title, 'pt-BR')
  })

  return items
}
