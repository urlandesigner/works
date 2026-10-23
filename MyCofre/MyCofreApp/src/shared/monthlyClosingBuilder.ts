import {
  getAccountBalance,
  getMonthIncome,
  getMonthTotalExpensesWithCardBills,
  getOutstandingCreditCardDebt,
} from './balance';
import type { Account } from './types/account';
import type { CreditCardBill } from './types/credit-card';
import type { Investment } from './types/investment';
import type { MonthlyClosing, MonthlyClosingAccount, MonthlyClosingInvestment } from './types/monthly-closing';
import type { Transaction } from './types/transaction';

export type MonthlyClosingBuildInput = {
  year: number;
  month: number;
  accounts: Account[];
  transactions: Transaction[];
  investments: Investment[];
  bills: CreditCardBill[];
  notes?: string | null;
};

export type MonthlyClosingDraftPayload = Omit<MonthlyClosing, 'id' | 'user_id' | 'closed_at'> & {
  accounts: Array<
    Pick<
      MonthlyClosingAccount,
      'account_id' | 'account_name' | 'account_type' | 'institution' | 'balance'
    >
  >;
  investments: Array<
    Pick<
      MonthlyClosingInvestment,
      | 'investment_id'
      | 'investment_name'
      | 'investment_type'
      | 'institution'
      | 'invested_amount'
      | 'current_amount'
    >
  >;
};

export function buildMonthlyClosingPayload(
  input: MonthlyClosingBuildInput,
): MonthlyClosingDraftPayload {
  const accountSnapshots = input.accounts.map((account) => ({
    account_id: account.id,
    account_name: account.name,
    account_type: account.type,
    institution: account.institution ?? null,
    balance: getAccountBalance(account, input.transactions),
  }));

  const investmentSnapshots = input.investments.map((investment) => ({
    investment_id: investment.id,
    investment_name: investment.name,
    investment_type: investment.type,
    institution: investment.institution ?? null,
    invested_amount: investment.invested_amount,
    current_amount: investment.current_amount,
  }));

  const totalAccounts = accountSnapshots.reduce((sum, account) => sum + account.balance, 0);
  const totalInvestments = investmentSnapshots.reduce(
    (sum, investment) => sum + investment.current_amount,
    0,
  );
  const monthIncome = getMonthIncome(input.transactions, input.year, input.month);
  const monthExpenses = getMonthTotalExpensesWithCardBills(
    input.transactions,
    input.bills,
    input.year,
    input.month,
  );

  return {
    year: input.year,
    month: input.month,
    total_accounts: totalAccounts,
    total_investments: totalInvestments,
    patrimony_total:
      totalAccounts + totalInvestments - getOutstandingCreditCardDebt(input.bills),
    month_income: monthIncome,
    month_expenses: monthExpenses,
    month_balance: monthIncome - monthExpenses,
    notes: input.notes ?? null,
    accounts: accountSnapshots,
    investments: investmentSnapshots,
    created_at: null,
  };
}
