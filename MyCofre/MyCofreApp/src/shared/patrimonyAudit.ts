import { getAccountBalance, getPatrimonyBreakdown } from './balance'
import { getEffectivePatrimony } from './patrimonyWithClosing'
import type { Account } from './types/account'
import type { CreditCardBill } from './types/credit-card'
import type { Investment } from './types/investment'
import type { MonthlyClosingWithDetails } from './types/monthly-closing'
import type { Transaction } from './types/transaction'

/**
 * Logs temporários (__DEV__) com cada parcela do patrimônio e diagnósticos para comparar com o web.
 * Remova as chamadas quando a divergência estiver resolvida.
 */
export function logPatrimonyAudit(
  screen: 'HomeScreen' | 'WealthScreen',
  accounts: Account[],
  transactions: Transaction[],
  investments: Investment[],
  bills: CreditCardBill[],
  monthlyClosing: MonthlyClosingWithDetails | null
): void {
  if (!__DEV__) {
    return
  }

  const effective = getEffectivePatrimony(
    monthlyClosing,
    accounts,
    transactions,
    investments,
    bills
  )

  const b = getPatrimonyBreakdown(accounts, transactions, investments, bills)

  const cashIncludingClosedAccounts = accounts.reduce(
    (sum, acc) => sum + getAccountBalance(acc, transactions),
    0
  )

  const investmentsSumCurrentRaw = investments.reduce(
    (sum, i) => sum + i.current_amount,
    0
  )

  const debtLoose = bills
    .filter((x) => x.isPaid !== true)
    .reduce((s, x) => s + x.amount, 0)
  const debtStrictFalse = bills
    .filter((x) => x.isPaid === false)
    .reduce((s, x) => s + x.amount, 0)

  console.log(`[patrimony audit] ${screen}`, {
    source: effective.source,
    effective,
    liveBreakdown: b,
    totalCash: b.totalCash,
    totalInvestmentsValue: b.totalInvestmentsValue,
    outstandingCreditCardDebt: b.outstandingCreditCardDebt,
    patrimony: b.patrimony,
    netPatrimony: b.netPatrimony,
    checks: {
      cashIncludingClosedAccounts,
      deltaCashVsClosedExcluded: cashIncludingClosedAccounts - b.totalCash,
      investmentsSumCurrentRaw,
      deltaInvestmentsVsBalanceFn: investmentsSumCurrentRaw - b.totalInvestmentsValue,
      outstandingDebtIfIsPaidNotTrue: debtLoose,
      outstandingDebtIfIsPaidStrictFalse: debtStrictFalse,
      deltaDebtLooseVsStrict: debtLoose - debtStrictFalse,
    },
    counts: {
      accounts: accounts.length,
      transactions: transactions.length,
      investments: investments.length,
      bills: bills.length,
    },
  })
}
