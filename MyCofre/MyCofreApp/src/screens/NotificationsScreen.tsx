import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard, AppScreen, AppText } from '../components';
import { useAuth } from '../features/auth';
import { useTransactionsSync } from '../features/transactions';
import { getSupabaseMobileClient } from '../lib/supabase/client';
import { getMonthIncome, getMonthTotalExpensesWithCardBills } from '../shared/balance';
import { getGoalCurrentAmount, getGoalProgressPercentUI } from '../shared/goalProgress';
import { buildHomeNotifications } from '../shared/homeNotifications';
import { fetchAccountsForUser } from '../shared/supabase/accountsRepo';
import { fetchBillsForUser } from '../shared/supabase/creditCardsRepo';
import { fetchGoalsForUser } from '../shared/supabase/goalsRepo';
import { fetchInvestmentsForUser } from '../shared/supabase/investmentsRepo';
import { fetchTransactionsForUser } from '../shared/supabase/transactionsRepo';
import type { Account } from '../shared/types/account';
import type { CreditCardBill } from '../shared/types/credit-card';
import type { Goal } from '../shared/types/goal';
import type { Investment } from '../shared/types/investment';
import type { Transaction } from '../shared/types/transaction';
import { useTheme } from '../theme';

export function NotificationsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { refreshKey } = useTransactionsSync();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<ReturnType<typeof buildHomeNotifications>>([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const client = getSupabaseMobileClient();
      if (!client) {
        setError('Supabase não configurado.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const [accountsRes, transactionsRes, investmentsRes, billsRes, goalsRes] =
        await Promise.all([
          fetchAccountsForUser(client, user.id),
          fetchTransactionsForUser(client, user.id),
          fetchInvestmentsForUser(client, user.id),
          fetchBillsForUser(client, user.id),
          fetchGoalsForUser(client, user.id),
        ]);

      if (cancelled) {
        return;
      }

      const failed =
        accountsRes.error ??
        transactionsRes.error ??
        investmentsRes.error ??
        billsRes.error ??
        goalsRes.error;

      if (failed) {
        setError(failed.message);
        setLoading(false);
        return;
      }

      const accounts: Account[] = accountsRes.data;
      const transactions: Transaction[] = transactionsRes.data;
      const investments: Investment[] = investmentsRes.data;
      const bills: CreditCardBill[] = billsRes.data;
      const goals: Goal[] = goalsRes.data;

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const monthIncome = getMonthIncome(transactions, year, month);
      const monthExpenses = getMonthTotalExpensesWithCardBills(transactions, bills, year, month);
      const totalInvestments = investments.reduce((sum, item) => sum + item.current_amount, 0);
      const totalBills = bills.filter((bill) => !bill.isPaid).reduce((sum, bill) => sum + bill.amount, 0);
      const totalCash = accounts.reduce((sum, account) => sum + account.initial_balance, 0);
      const netPatrimony = totalCash + totalInvestments - totalBills;

      const activeGoals = goals.filter((goal) => goal.is_active !== false);
      const criticalGoal =
        activeGoals
          .slice()
          .sort((a, b) => {
            const aCurrent = getGoalCurrentAmount(a, accounts, transactions, investments, bills);
            const bCurrent = getGoalCurrentAmount(b, accounts, transactions, investments, bills);
            return getGoalProgressPercentUI(a, aCurrent) - getGoalProgressPercentUI(b, bCurrent);
          })[0] ?? null;

      const criticalGoalProgress = criticalGoal
        ? getGoalProgressPercentUI(
            criticalGoal,
            getGoalCurrentAmount(criticalGoal, accounts, transactions, investments, bills),
          )
        : undefined;

      setNotifications(
        buildHomeNotifications({
          monthIncome,
          monthExpenses,
          netPatrimony,
          criticalGoalName: criticalGoal?.name,
          criticalGoalProgress,
        }),
      );
      setLoading(false);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, user?.id]);

  return (
    <AppScreen scroll>
      <View style={{ marginBottom: theme.spacing.xl }}>
        <AppText variant="title2">Notificações</AppText>
        <AppText variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.xs }}>
          Alertas financeiros e pontos de atenção do momento.
        </AppText>
      </View>

      {loading ? (
        <AppCard style={styles.card}>
          <AppText variant="bodySmall" color="secondary">
            Carregando notificações...
          </AppText>
        </AppCard>
      ) : error ? (
        <AppCard style={[styles.card, { borderColor: theme.colors.danger }]}>
          <AppText variant="label" color="danger">
            Não foi possível carregar
          </AppText>
          <AppText variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.sm }}>
            {error}
          </AppText>
        </AppCard>
      ) : notifications.length === 0 ? (
        <AppCard style={styles.card}>
          <AppText variant="bodySmall" color="secondary">
            Nenhum alerta importante no momento.
          </AppText>
        </AppCard>
      ) : (
        <View style={styles.list}>
          {notifications.map((item) => (
            <AppCard
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor:
                    item.tone === 'danger'
                      ? 'rgba(217, 56, 56, 0.06)'
                      : item.tone === 'warning'
                        ? 'rgba(217, 119, 6, 0.08)'
                        : 'rgba(22, 163, 74, 0.06)',
                },
              ]}
            >
              <AppText
                variant="bodySmall"
                style={{
                  color:
                    item.tone === 'danger'
                      ? theme.colors.danger
                      : item.tone === 'warning'
                        ? theme.colors.warning
                        : theme.colors.success,
                  fontWeight: '700',
                }}
              >
                {item.title}
              </AppText>
              <AppText variant="caption" color="secondary" style={{ marginTop: theme.spacing.xs }}>
                {item.description}
              </AppText>
            </AppCard>
          ))}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    marginBottom: 0,
  },
});
