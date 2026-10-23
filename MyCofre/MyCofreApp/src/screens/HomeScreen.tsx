import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AppCard, AppHeader, AppScreen, AppText, FloatingActionButton } from '../components';
import { useAuth } from '../features/auth';
import { FinancialAssistantModal } from '../features/financial-assistant/FinancialAssistantModal';
import { useTransactionsSync } from '../features/transactions';
import { useValuesVisibility } from '../features/values-visibility';
import {
  AddActionSheet,
  BalanceCard,
  GoalProgressCard,
  MonthlySummaryCard,
  SectionHeader,
  TransactionRow,
} from '../features/home/components';
import { getSupabaseMobileClient } from '../lib/supabase/client';
import {
  getMonthIncome,
  getMonthTotalExpensesWithCardBills,
} from '../shared/balance';
import { logPatrimonyAudit } from '../shared/patrimonyAudit';
import { getEffectivePatrimony } from '../shared/patrimonyWithClosing';
import { formatCurrencyMasked } from '../shared/formatCurrencyMasked';
import { fetchLatestMonthlyClosingWithDetailsForUser } from '../shared/supabase/monthlyClosingsRepo';
import { getGoalCurrentAmount, getGoalProgressPercentUI } from '../shared/goalProgress';
import { fetchAccountsForUser } from '../shared/supabase/accountsRepo';
import { fetchCategoriesForUser } from '../shared/supabase/categoriesRepo';
import { fetchBillsForUser } from '../shared/supabase/creditCardsRepo';
import { fetchGoalsForUser } from '../shared/supabase/goalsRepo';
import { fetchInvestmentsForUser } from '../shared/supabase/investmentsRepo';
import { fetchSubscriptionsForUser } from '../shared/supabase/subscriptionsRepo';
import { fetchTransactionsForUser } from '../shared/supabase/transactionsRepo';
import { getUpcomingSubscriptions } from '../shared/subscriptionReminders';
import type { Account } from '../shared/types/account';
import type { Category } from '../shared/types/category';
import type { CreditCardBill } from '../shared/types/credit-card';
import type { Goal } from '../shared/types/goal';
import type { Investment } from '../shared/types/investment';
import type { MonthlyClosingWithDetails } from '../shared/types/monthly-closing';
import type { Subscription } from '../shared/types/subscription';
import type { Transaction as DbTransaction } from '../shared/types/transaction';
import type { MonthlySummary, SavingsGoal, Transaction as UiTransaction } from '../types';
import { useTheme } from '../theme';
import { getGreeting } from '../utils/greeting';
import type { RootTabParamList } from '../navigation/types';

function monthLabelPt(year: number, month: number): string {
  const s = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1)
  );
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getFirstNameLabel(value: string): string {
  const normalized = value.trim().split(/\s+/)[0] ?? value.trim();
  return normalized.split(/[._-]/)[0] || normalized;
}

function goalToSavingsGoal(
  goal: Goal,
  accounts: Account[],
  transactions: DbTransaction[],
  investments: Investment[],
  bills: CreditCardBill[]
): SavingsGoal {
  const current = getGoalCurrentAmount(goal, accounts, transactions, investments, bills);
  return {
    id: goal.id,
    title: goal.name,
    targetAmount: goal.target_amount,
    currentAmount: current,
    deadline: goal.created_at?.slice(0, 10) ?? `${new Date().getFullYear()}-12-31`,
  };
}

function mapTransactionsToUi(
  rows: DbTransaction[],
  categoryNameById: Map<string, string>,
  accountNameById: Map<string, string>
): UiTransaction[] {
  return rows.map((t) => ({
    id: t.id,
    title: t.description?.trim() || 'Sem descrição',
    category: categoryNameById.get(t.category_id) ?? 'Categoria',
    accountLabel: t.account_id ? accountNameById.get(t.account_id) ?? 'Conta vinculada' : 'Sem conta vinculada',
    amount: t.amount,
    type: t.type,
    date: t.transaction_date,
  }));
}

export function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { isBalanceHidden } = useValuesVisibility();
  const { refreshKey, notifyTransactionsChanged } = useTransactionsSync();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addActionSheetOpen, setAddActionSheetOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [bills, setBills] = useState<CreditCardBill[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categoryNameById, setCategoryNameById] = useState<Map<string, string>>(new Map());
  const [monthlyClosing, setMonthlyClosing] = useState<MonthlyClosingWithDetails | null>(null);

  const accountNameById = new Map(accounts.map((account) => [account.id, account.name] as const));

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const client = getSupabaseMobileClient();
      if (!client) {
        if (!cancelled) {
          setError('Supabase não configurado.');
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError(null);
      }

      const [
        accRes,
        txRes,
        invRes,
        billsRes,
        goalsRes,
        catRes,
        closingRes,
        subscriptionsRes,
      ] = await Promise.all([
        fetchAccountsForUser(client, user.id),
        fetchTransactionsForUser(client, user.id),
        fetchInvestmentsForUser(client, user.id),
        fetchBillsForUser(client, user.id),
        fetchGoalsForUser(client, user.id),
        fetchCategoriesForUser(client, user.id),
        fetchLatestMonthlyClosingWithDetailsForUser(client, user.id),
        fetchSubscriptionsForUser(client, user.id),
      ]);

      if (cancelled) {
        return;
      }

      if (accRes.error) {
        setError(accRes.error.message);
        setLoading(false);
        return;
      }
      if (txRes.error) {
        setError(txRes.error.message);
        setLoading(false);
        return;
      }
      if (invRes.error) {
        setError(invRes.error.message);
        setLoading(false);
        return;
      }
      if (billsRes.error) {
        setError(billsRes.error.message);
        setLoading(false);
        return;
      }
      if (goalsRes.error) {
        setError(goalsRes.error.message);
        setLoading(false);
        return;
      }
      if (catRes.error) {
        setError(catRes.error.message);
        setLoading(false);
        return;
      }
      if (closingRes.error) {
        setError(closingRes.error.message);
        setLoading(false);
        return;
      }
      if (subscriptionsRes.error) {
        setError(subscriptionsRes.error.message);
        setLoading(false);
        return;
      }

      setMonthlyClosing(closingRes.data);
      setAccounts(accRes.data);
      setTransactions(txRes.data);
      setInvestments(invRes.data);
      setBills(billsRes.data);
      setGoals(goalsRes.data);
      setSubscriptions(subscriptionsRes.data);
      setCategories(catRes.data);
      setCategoryNameById(new Map(catRes.data.map((c) => [c.id, c.name] as const)));
      setLoading(false);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [user?.id, refreshKey]);

  useEffect(() => {
    if (loading || error) {
      return;
    }
    logPatrimonyAudit(
      'HomeScreen',
      accounts,
      transactions,
      investments,
      bills,
      monthlyClosing
    );
  }, [loading, error, accounts, transactions, investments, bills, monthlyClosing]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const displayName =
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name?.trim() ||
    user?.email?.split('@')[0] ||
    'Olá';

  const greeting = `${getGreeting(getFirstNameLabel(displayName)).split(',')[0]}, ${getFirstNameLabel(displayName)}`;

  const summary: MonthlySummary = {
    label: monthLabelPt(year, month),
    income: getMonthIncome(transactions, year, month),
    expense: getMonthTotalExpensesWithCardBills(transactions, bills, year, month),
  };
  const monthBalance = summary.income - summary.expense;

  const effectivePatrimony = getEffectivePatrimony(
    monthlyClosing,
    accounts,
    transactions,
    investments,
    bills
  );
  const netPatrimony = effectivePatrimony.netPatrimony;
  const cashInAccounts = effectivePatrimony.totalCash;

  const activeGoals = goals.filter((goal) => goal.is_active !== false);
  const criticalGoal =
    activeGoals
      .slice()
      .sort((a, b) => {
        const aCurrent = getGoalCurrentAmount(a, accounts, transactions, investments, bills);
        const bCurrent = getGoalCurrentAmount(b, accounts, transactions, investments, bills);
        return getGoalProgressPercentUI(a, aCurrent) - getGoalProgressPercentUI(b, bCurrent);
      })[0] ??
    goals[0] ??
    null;

  const savingsGoal: SavingsGoal | null = criticalGoal
    ? goalToSavingsGoal(criticalGoal, accounts, transactions, investments, bills)
    : null;

  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime(),
    )
    .slice(0, 5);

  const recentUi = mapTransactionsToUi(recentTransactions, categoryNameById, accountNameById);
  const criticalGoalProgress =
    criticalGoal && savingsGoal ? getGoalProgressPercentUI(criticalGoal, savingsGoal.currentAmount) : 0;
  const upcomingSubscriptions = getUpcomingSubscriptions(subscriptions, new Date(), 3);

  if (loading) {
    return (
      <AppScreen scroll>
        <AppHeader title="Sua Home está sendo preparada" />
        <AppCard style={styles.loadingCard}>
          <View style={styles.loadingLineLarge} />
          <View style={styles.loadingLineMedium} />
          <View style={styles.loadingMetricsRow}>
            <View style={styles.loadingMetric} />
            <View style={styles.loadingMetric} />
          </View>
        </AppCard>
        <AppCard style={styles.loadingCard}>
          <View style={styles.loadingLineSmall} />
          <View style={[styles.loadingLineMedium, { width: '68%' }]} />
        </AppCard>
      </AppScreen>
    );
  }

  if (error) {
    return (
      <AppScreen scroll>
        <AppHeader title={greeting} />
        <AppCard
          style={{
            marginBottom: theme.spacing.sectionGap,
            borderColor: theme.colors.danger,
            backgroundColor: 'rgba(217, 56, 56, 0.10)',
          }}
        >
          <AppText variant="label" color="danger">
            Não foi possível carregar a Home
          </AppText>
          <AppText variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.sm }}>
            {error}
          </AppText>
        </AppCard>
      </AppScreen>
    );
  }

  return (
    <View style={styles.screenRoot}>
      <AppScreen scroll>
        <AppHeader title={greeting} />

        <BalanceCard netPatrimony={netPatrimony} cashInAccounts={cashInAccounts} />

        <SectionHeader title="Resumo do mês" topSpacing={0} />
        <MonthlySummaryCard summary={summary} />

        <SectionHeader
          title="Últimas transações"
          actionLabel="Ver mais"
          onActionPress={() => navigation.navigate('Transactions')}
        />
        {recentUi.length === 0 ? (
          <AppCard style={styles.sectionCard}>
            <EmptyHint text="Nenhuma transação recente para mostrar." />
          </AppCard>
        ) : (
          <AppCard
            padded={false}
            style={{
              marginBottom: theme.spacing.md,
              paddingHorizontal: theme.spacing.xl,
              paddingVertical: theme.spacing.sm,
              ...theme.shadows.sm,
            }}
          >
            {recentUi.map((item, index) => (
              <TransactionRow
                key={item.id}
                item={item}
                isLast={index === recentUi.length - 1}
              />
            ))}
          </AppCard>
        )}
        <SectionHeader title="Meta mais crítica" />
        {savingsGoal && criticalGoal ? (
          <GoalProgressCard
            goal={savingsGoal}
            progressPercent={getGoalProgressPercentUI(criticalGoal, savingsGoal.currentAmount)}
          />
        ) : (
          <AppCard style={styles.sectionCard}>
            <EmptyHint text="Nenhuma meta cadastrada até agora." />
          </AppCard>
        )}

        <SectionHeader
          title="Próximas assinaturas"
          actionLabel="Ver mais"
          onActionPress={() => navigation.navigate('Subscriptions')}
        />
        {upcomingSubscriptions.length === 0 ? (
          <AppCard style={styles.sectionCard}>
            <EmptyHint text="Nenhuma cobrança recorrente ativa encontrada." />
          </AppCard>
        ) : (
          <AppCard style={styles.sectionCard}>
            {upcomingSubscriptions.map((subscription, index) => (
              <View
                key={subscription.id}
                style={{
                  paddingVertical: theme.spacing.lg,
                  borderBottomWidth: index === upcomingSubscriptions.length - 1 ? 0 : StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
                  <AppText variant="bodySmall" style={{ fontWeight: '600' }}>
                    {subscription.name}
                  </AppText>
                  <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.xxs }}>
                    {subscription.periodicity === 'annual' ? 'Anual' : 'Mensal'} · {subscription.dueLabel}
                  </AppText>
                </View>
                <AppText variant="bodySmall" style={{ fontVariant: ['tabular-nums'], fontWeight: '600' }}>
                    {formatCurrencyMasked(subscription.amount, isBalanceHidden)}
                  </AppText>
                </View>
              </View>
            ))}
          </AppCard>
        )}
      </AppScreen>

      <AddActionSheet
        visible={addActionSheetOpen}
        onClose={() => setAddActionSheetOpen(false)}
        onSelectAssistant={() => {
          setAddActionSheetOpen(false);
          setAssistantOpen(true);
        }}
        onSelectManual={() => {
          setAddActionSheetOpen(false);
          navigation.navigate('Transactions', { openForm: true });
        }}
      />

      <FloatingActionButton
        accessibilityLabel="Adicionar nova transação"
        onPress={() => setAddActionSheetOpen(true)}
      />

      <FinancialAssistantModal
        visible={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        userId={user?.id}
        categories={categories}
        accounts={accounts}
        transactions={transactions}
        onTransactionSaved={() => {
          notifyTransactionsChanged();
        }}
      />
    </View>
  );
}

function EmptyHint({ text }: { text: string }) {
  const { theme } = useTheme();

  return (
    <AppText variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.sm }}>
      {text}
    </AppText>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  sectionCard: {
    marginBottom: 24,
    padding: 20,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadingCard: {
    marginBottom: 20,
    padding: 20,
  },
  loadingLineLarge: {
    height: 22,
    width: '52%',
    borderRadius: 999,
    backgroundColor: '#2A3140',
  },
  loadingLineMedium: {
    height: 14,
    width: '82%',
    borderRadius: 999,
    backgroundColor: '#202736',
    marginTop: 14,
  },
  loadingLineSmall: {
    height: 12,
    width: '38%',
    borderRadius: 999,
    backgroundColor: '#2A3140',
  },
  loadingMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  loadingMetric: {
    flex: 1,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#202736',
  },
});
