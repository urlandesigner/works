import type { Account } from './types/account'
import type { CreditCardBill } from './types/credit-card'
import type { Investment } from './types/investment'
import type { Transaction } from './types/transaction'
import {
  getTransactionYearMonth,
  transactionMatchesCalendarMonthView,
} from './calendar'

export { getTransactionYearMonth } from './calendar'

export function transactionInCalendarMonth(
  t: Transaction,
  year: number,
  month: number
): boolean {
  const ym = getTransactionYearMonth(t.transaction_date)
  return ym !== null && ym.year === year && ym.month === month
}

export function getAccountBalance(
  account: Account,
  transactions: Transaction[]
): number {
  const accountTransactions = transactions.filter(
    (t) => t.account_id != null && t.account_id === account.id
  )
  const delta = accountTransactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount
  }, 0)
  return account.initial_balance + delta
}

/**
 * Saldo total em contas (dinheiro em caixa), sem incluir investimentos.
 * Contas com `status === 'closed'` não entram (alinha com visão geral / web).
 */
export function getTotalCash(
  accounts: Account[],
  transactions: Transaction[]
): number {
  return accounts
    .filter((a) => (a.status ?? 'active') !== 'closed')
    .reduce(
      (sum, acc) => sum + getAccountBalance(acc, transactions),
      0
    )
}

/**
 * Valor atual total dos investimentos (`current_amount`).
 * Soma todas as linhas retornadas pelo backend — mesma base que um `SUM(current_amount)` no web.
 */
export function getTotalInvestmentsValue(investments: Investment[]): number {
  return investments.reduce((sum, i) => sum + i.current_amount, 0)
}

/** Total aplicado (invested) em investimentos. */
export function getTotalInvestedAmount(investments: Investment[]): number {
  return investments.reduce((sum, i) => sum + i.invested_amount, 0)
}

/**
 * Patrimônio bruto = saldo em contas + valor atual dos investimentos
 * (sem descontar dívidas de cartão).
 */
export function getPatrimony(
  accounts: Account[],
  transactions: Transaction[],
  investments: Investment[]
): number {
  return (
    getTotalCash(accounts, transactions) +
    getTotalInvestmentsValue(investments)
  )
}

/** Soma das faturas de cartão ainda não pagas (passivo). */
export function getOutstandingCreditCardDebt(
  bills: CreditCardBill[]
): number {
  return bills
    .filter((b) => b.isPaid !== true)
    .reduce((sum, b) => sum + b.amount, 0)
}

/**
 * Patrimônio líquido = bruto − faturas de cartão em aberto.
 * Alinhar com metas do tipo patrimônio e com a visão geral.
 */
export function getNetPatrimony(
  accounts: Account[],
  transactions: Transaction[],
  investments: Investment[],
  creditCardBills: CreditCardBill[]
): number {
  return (
    getPatrimony(accounts, transactions, investments) -
    getOutstandingCreditCardDebt(creditCardBills)
  )
}

/** Parcelas do patrimônio — apenas compõe as funções acima (fonte única para UI e auditoria). */
export type PatrimonyBreakdown = {
  totalCash: number
  totalInvestmentsValue: number
  outstandingCreditCardDebt: number
  /** Bruto = caixa + investimentos. */
  patrimony: number
  netPatrimony: number
}

export function getPatrimonyBreakdown(
  accounts: Account[],
  transactions: Transaction[],
  investments: Investment[],
  creditCardBills: CreditCardBill[]
): PatrimonyBreakdown {
  const totalCash = getTotalCash(accounts, transactions)
  const totalInvestmentsValue = getTotalInvestmentsValue(investments)
  const outstandingCreditCardDebt = getOutstandingCreditCardDebt(creditCardBills)
  const patrimony = getPatrimony(accounts, transactions, investments)
  const netPatrimony = getNetPatrimony(
    accounts,
    transactions,
    investments,
    creditCardBills
  )
  return {
    totalCash,
    totalInvestmentsValue,
    outstandingCreditCardDebt,
    patrimony,
    netPatrimony,
  }
}

/** Faturas com competência no mês/ano (valor da fatura, paga ou não). */
export function getMonthCreditCardBillsTotal(
  bills: CreditCardBill[],
  year: number,
  month: number
): number {
  return bills
    .filter((b) => b.year === year && b.month === month)
    .reduce((sum, b) => sum + b.amount, 0)
}

/**
 * Despesa de transação que entra no total de competência do mês (Home, metas, alertas).
 * Exclui compras marcadas no cartão (entram pela fatura) e lançamentos só de caixa (ex.: pagamento de fatura).
 */
export function transactionCountsTowardMonthCompetenceExpenses(
  t: Transaction
): boolean {
  if (t.type !== 'expense') return false
  if (t.credit_card_id) return false
  if (t.exclude_from_month_expense_summary === true) return false
  return true
}

/**
 * Soma das despesas do mês que compõem o resumo de competência (sem compras no cartão
 * marcadas com `credit_card_id` e sem exclusões explícitas).
 */
export function getMonthExpensesForCompetenceSummary(
  transactions: Transaction[],
  year: number,
  month: number
): number {
  return transactions
    .filter(
      (t) =>
        transactionMatchesCalendarMonthView(t, year, month) &&
        transactionCountsTowardMonthCompetenceExpenses(t)
    )
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Despesas do mês para visão consolidada: transações de saída do mês (competência)
 * + faturas de cartão com competência no mesmo mês.
 * Compras no cartão devem usar `credit_card_id` na transação para não duplicar com a fatura.
 */
export function getMonthTotalExpensesWithCardBills(
  transactions: Transaction[],
  creditCardBills: CreditCardBill[],
  year: number,
  month: number
): number {
  return (
    getMonthExpensesForCompetenceSummary(transactions, year, month) +
    getMonthCreditCardBillsTotal(creditCardBills, year, month)
  )
}

/** Valor atual dos investimentos vinculados a uma conta. */
export function getAccountInvestmentsValue(
  accountId: string,
  investments: Investment[]
): number {
  return investments
    .filter((i) => i.account_id === accountId)
    .reduce((sum, i) => sum + i.current_amount, 0)
}

/** Total aplicado nos investimentos vinculados a uma conta. */
export function getAccountInvestedAmount(
  accountId: string,
  investments: Investment[]
): number {
  return investments
    .filter((i) => i.account_id === accountId)
    .reduce((sum, i) => sum + i.invested_amount, 0)
}

/** Patrimônio total da conta = saldo disponível + valor atual dos investimentos da conta. */
export function getAccountPatrimony(
  account: Account,
  transactions: Transaction[],
  investments: Investment[]
): number {
  return (
    getAccountBalance(account, transactions) +
    getAccountInvestmentsValue(account.id, investments)
  )
}

/**
 * Receitas do mês: mesma regra do calendário da home (recorrência mensal/anual
 * conta em todo mês / no mesmo mês do ano, não só na data gravada).
 */
export function getMonthIncome(
  transactions: Transaction[],
  year: number,
  month: number
): number {
  return transactions
    .filter(
      (t) =>
        t.type === 'income' &&
        transactionMatchesCalendarMonthView(t, year, month)
    )
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Despesas no mês com a mesma visão de recorrência do calendário da home.
 * Para totais da Home e metas, prefira `getMonthExpensesForCompetenceSummary` + faturas.
 */
export function getMonthExpenses(
  transactions: Transaction[],
  year: number,
  month: number
): number {
  return transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        transactionMatchesCalendarMonthView(t, year, month)
    )
    .reduce((sum, t) => sum + t.amount, 0)
}
