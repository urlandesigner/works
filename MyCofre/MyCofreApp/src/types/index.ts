export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  title: string;
  category: string;
  accountLabel?: string;
  amount: number;
  type: TransactionType;
  date: string;
};

export type MonthlySummary = {
  income: number;
  expense: number;
  label: string;
};

export type SavingsGoal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
};
