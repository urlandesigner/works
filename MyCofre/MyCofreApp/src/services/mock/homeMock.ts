import type { MonthlySummary, SavingsGoal, Transaction } from '../../types';

export const mockUserName = 'Alex';

export const mockProfile = {
  displayName: 'Alex Silva',
  email: 'alex.silva@email.com',
} as const;

export const mockTotalBalance = 47_832.5;

export const mockMonthlySummary: MonthlySummary = {
  label: 'Abril 2026',
  income: 12_400,
  expense: 8_230.75,
};

export const mockPrimaryGoal: SavingsGoal = {
  id: 'g1',
  title: 'Reserva de emergência',
  targetAmount: 30_000,
  currentAmount: 18_500,
  deadline: '2026-12-31',
};

export const mockRecentTransactions: Transaction[] = [
  {
    id: 't1',
    title: 'Salário',
    category: 'Renda',
    amount: 9_800,
    type: 'income',
    date: '2026-04-05',
  },
  {
    id: 't2',
    title: 'Supermercado',
    category: 'Alimentação',
    amount: 342.9,
    type: 'expense',
    date: '2026-04-04',
  },
  {
    id: 't3',
    title: 'Netflix',
    category: 'Assinaturas',
    amount: 55.9,
    type: 'expense',
    date: '2026-04-03',
  },
  {
    id: 't4',
    title: 'Freelance',
    category: 'Extra',
    amount: 2_600,
    type: 'income',
    date: '2026-04-02',
  },
];
