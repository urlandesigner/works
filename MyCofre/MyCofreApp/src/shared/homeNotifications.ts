import { getDashboardFinancialAlert } from './dashboardFinancialAlert';

type Params = {
  monthIncome: number;
  monthExpenses: number;
  netPatrimony: number;
  criticalGoalName?: string | null;
  criticalGoalProgress?: number;
};

export type HomeNotificationItem = {
  id: string;
  tone: 'positive' | 'warning' | 'danger';
  title: string;
  description: string;
};

export function buildHomeNotifications({
  monthIncome,
  monthExpenses,
  netPatrimony,
  criticalGoalName,
  criticalGoalProgress,
}: Params): HomeNotificationItem[] {
  const financialAlert = getDashboardFinancialAlert({
    monthIncome,
    monthExpenses,
  });

  const monthBalance = monthIncome - monthExpenses;

  return [
    netPatrimony < 0
      ? {
          id: 'negative-net-worth',
          tone: 'danger' as const,
          title: 'Saldo patrimonial negativo',
          description: 'Seu patrimonio liquido esta abaixo de zero neste momento.',
        }
      : null,
    monthBalance < 0
      ? {
          id: 'negative-month-balance',
          tone: 'warning' as const,
          title: 'Saldo do mes negativo',
          description: 'As despesas do mes superaram as receitas registradas.',
        }
      : null,
    criticalGoalName && (criticalGoalProgress ?? 0) < 35
      ? {
          id: 'critical-goal-at-risk',
          tone: 'warning' as const,
          title: 'Meta mais critica em risco',
          description: `${criticalGoalName} esta com progresso de ${(criticalGoalProgress ?? 0).toFixed(0)}%.`,
        }
      : null,
    {
      id: `month-flow-${financialAlert.type}`,
      tone:
        financialAlert.type === 'danger'
          ? ('danger' as const)
          : financialAlert.type === 'warning'
            ? ('warning' as const)
            : ('positive' as const),
      title: financialAlert.title,
      description: financialAlert.description,
    },
  ].filter(
    (
      item,
      index,
      array,
    ): item is HomeNotificationItem =>
      item !== null && array.findIndex((entry) => entry?.title === item.title) === index,
  );
}
