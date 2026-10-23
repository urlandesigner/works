import type { Subscription } from './types/subscription';

export type UpcomingSubscriptionItem = {
  id: string;
  name: string;
  amount: number;
  periodicity: 'monthly' | 'annual';
  dueLabel: string;
  billingDay: number;
};

const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function annualChargeMonth(subscription: Subscription): number | null {
  if (
    subscription.billing_month != null &&
    subscription.billing_month >= 1 &&
    subscription.billing_month <= 12
  ) {
    return subscription.billing_month;
  }

  if (!subscription.created_at) {
    return null;
  }

  const created = new Date(subscription.created_at);
  if (Number.isNaN(created.getTime())) {
    return null;
  }

  return created.getMonth() + 1;
}

function nextOccurrenceDate(subscription: Subscription, today: Date): Date | null {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const billingDay = subscription.billing_day;
  const periodicity = subscription.periodicity ?? 'monthly';

  if (periodicity === 'annual') {
    const chargeMonth = annualChargeMonth(subscription);
    if (!chargeMonth) return null;

    const currentYearDate = new Date(year, chargeMonth - 1, billingDay);
    if (currentYearDate >= today) {
      return currentYearDate;
    }

    return new Date(year + 1, chargeMonth - 1, billingDay);
  }

  const currentMonthDate = new Date(year, month - 1, billingDay);
  if (currentMonthDate >= today) {
    return currentMonthDate;
  }

  return new Date(year, month, billingDay);
}

function formatDueLabel(subscription: Subscription, dueDate: Date): string {
  const periodicity = subscription.periodicity ?? 'monthly';
  if (periodicity === 'annual') {
    return `${dueDate.getDate()} de ${MONTH_LABELS[dueDate.getMonth()]}`;
  }

  return `Dia ${dueDate.getDate()}`;
}

export function getUpcomingSubscriptions(
  subscriptions: Subscription[],
  today: Date,
  limit = 3,
): UpcomingSubscriptionItem[] {
  return subscriptions
    .filter((subscription) => subscription.status === 'active')
    .map((subscription) => {
      const dueDate = nextOccurrenceDate(subscription, today);
      return dueDate
        ? {
            id: subscription.id,
            name: subscription.name,
            amount: subscription.monthly_amount,
            periodicity: subscription.periodicity ?? 'monthly',
            dueLabel: formatDueLabel(subscription, dueDate),
            billingDay: subscription.billing_day,
            dueDate,
          }
        : null;
    })
    .filter((item): item is UpcomingSubscriptionItem & { dueDate: Date } => item !== null)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, limit)
    .map(({ dueDate: _dueDate, ...item }) => item);
}
