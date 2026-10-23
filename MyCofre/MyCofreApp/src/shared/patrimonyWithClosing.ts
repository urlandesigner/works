import { getPatrimonyBreakdown } from './balance'
import type { Account } from './types/account'
import type { CreditCardBill } from './types/credit-card'
import type { Investment } from './types/investment'
import type { MonthlyClosingWithDetails } from './types/monthly-closing'
import type { Transaction } from './types/transaction'

export type PatrimonySource = 'closing' | 'live'

/** Patrimônio exibido na Home/Wealth: fechamento do mês (se existir) ou cálculo ao vivo via `balance.ts`. */
export type EffectivePatrimony = {
  source: PatrimonySource
  netPatrimony: number
  totalCash: number
  totalInvestmentsValue: number
  outstandingCreditCardDebt: number
  patrimonyGross: number
}

/**
 * Se existir fechamento mensal, usa `patrimony_total`, `total_accounts` e `total_investments` salvos
 * (mesma base do web). Caso contrário, delega a `getPatrimonyBreakdown` (tempo real).
 * No modo fechamento não soma faturas ao vivo — o snapshot já reflete o que foi fechado.
 */
export function getEffectivePatrimony(
  closing: MonthlyClosingWithDetails | null,
  accounts: Account[],
  transactions: Transaction[],
  investments: Investment[],
  bills: CreditCardBill[]
): EffectivePatrimony {
  if (closing) {
    return {
      source: 'closing',
      netPatrimony: closing.patrimony_total,
      totalCash: closing.total_accounts,
      totalInvestmentsValue: closing.total_investments,
      outstandingCreditCardDebt: 0,
      patrimonyGross: closing.total_accounts + closing.total_investments,
    }
  }
  const b = getPatrimonyBreakdown(accounts, transactions, investments, bills)
  return {
    source: 'live',
    netPatrimony: b.netPatrimony,
    totalCash: b.totalCash,
    totalInvestmentsValue: b.totalInvestmentsValue,
    outstandingCreditCardDebt: b.outstandingCreditCardDebt,
    patrimonyGross: b.patrimony,
  }
}
