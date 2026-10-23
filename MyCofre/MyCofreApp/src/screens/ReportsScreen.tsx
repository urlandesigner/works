import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard, AppHeader, AppScreen, AppText } from '../components';
import { useAuth } from '../features/auth';
import { useTransactionsSync } from '../features/transactions';
import { getSupabaseMobileClient } from '../lib/supabase/client';
import {
  getMonthCreditCardBillsTotal,
  getMonthIncome,
  getMonthTotalExpensesWithCardBills,
  getOutstandingCreditCardDebt,
  getPatrimonyBreakdown,
  transactionCountsTowardMonthCompetenceExpenses,
} from '../shared/balance';
import { transactionMatchesCalendarMonthView } from '../shared/calendar';
import { fetchAccountsForUser } from '../shared/supabase/accountsRepo';
import { fetchCategoriesForUser } from '../shared/supabase/categoriesRepo';
import { fetchBillsForUser } from '../shared/supabase/creditCardsRepo';
import { fetchInvestmentsForUser } from '../shared/supabase/investmentsRepo';
import {
  fetchLatestMonthlyClosingWithDetailsForUser,
  fetchMonthlyClosingsListForUser,
} from '../shared/supabase/monthlyClosingsRepo';
import { fetchTransactionsForUser } from '../shared/supabase/transactionsRepo';
import type { Account } from '../shared/types/account';
import type { Category } from '../shared/types/category';
import type { CreditCardBill } from '../shared/types/credit-card';
import type { Investment } from '../shared/types/investment';
import type { MonthlyClosing, MonthlyClosingWithDetails } from '../shared/types/monthly-closing';
import type { Transaction } from '../shared/types/transaction';
import { useTheme } from '../theme';
import { formatCurrency } from '../utils/formatCurrency';

type ReportPeriodPreset = 'currentMonth' | 'previousMonth' | 'last3Months' | 'currentYear';

type PeriodMonth = {
  year: number;
  month: number;
};

type CategoryExpenseRow = {
  id: string;
  label: string;
  value: number;
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

const periodOptions: Array<{ value: ReportPeriodPreset; label: string }> = [
  { value: 'currentMonth', label: 'Mes atual' },
  { value: 'previousMonth', label: 'Mes anterior' },
  { value: 'last3Months', label: 'Ultimos 3 meses' },
  { value: 'currentYear', label: 'Ano atual' },
];

function formatMonthLabel(year: number, month: number): string {
  return `${MONTH_LABELS[month - 1] ?? `Mes ${month}`} ${year}`;
}

function getMonthsForPreset(preset: ReportPeriodPreset): PeriodMonth[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  function pushMonth(year: number, month: number, offset: number): PeriodMonth {
    const date = new Date(year, month - 1 + offset, 1);
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  }

  if (preset === 'currentMonth') {
    return [{ year: currentYear, month: currentMonth }];
  }

  if (preset === 'previousMonth') {
    return [pushMonth(currentYear, currentMonth, -1)];
  }

  if (preset === 'last3Months') {
    return [
      pushMonth(currentYear, currentMonth, -2),
      pushMonth(currentYear, currentMonth, -1),
      { year: currentYear, month: currentMonth },
    ];
  }

  return Array.from({ length: currentMonth }, (_, index) => ({
    year: currentYear,
    month: index + 1,
  }));
}

function getPeriodLabel(months: PeriodMonth[]): string {
  if (months.length === 0) return 'Periodo';
  if (months.length === 1) return formatMonthLabel(months[0].year, months[0].month);
  return `${formatMonthLabel(months[0].year, months[0].month)} a ${formatMonthLabel(
    months[months.length - 1].year,
    months[months.length - 1].month,
  )}`;
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}

export function ReportsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { refreshKey } = useTransactionsSync();

  const [periodPreset, setPeriodPreset] = useState<ReportPeriodPreset>('currentMonth');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [bills, setBills] = useState<CreditCardBill[]>([]);
  const [closings, setClosings] = useState<MonthlyClosing[]>([]);
  const [latestClosing, setLatestClosing] = useState<MonthlyClosingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          setError('Supabase nao configurado.');
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError(null);
      }

      const [
        accountsRes,
        categoriesRes,
        transactionsRes,
        investmentsRes,
        billsRes,
        closingsRes,
        latestClosingRes,
      ] = await Promise.all([
        fetchAccountsForUser(client, user.id),
        fetchCategoriesForUser(client, user.id),
        fetchTransactionsForUser(client, user.id),
        fetchInvestmentsForUser(client, user.id),
        fetchBillsForUser(client, user.id),
        fetchMonthlyClosingsListForUser(client, user.id),
        fetchLatestMonthlyClosingWithDetailsForUser(client, user.id),
      ]);

      if (cancelled) {
        return;
      }

      if (accountsRes.error) {
        setError(accountsRes.error.message);
        setLoading(false);
        return;
      }

      if (categoriesRes.error) {
        setError(categoriesRes.error.message);
        setLoading(false);
        return;
      }

      if (transactionsRes.error) {
        setError(transactionsRes.error.message);
        setLoading(false);
        return;
      }

      if (investmentsRes.error) {
        setError(investmentsRes.error.message);
        setLoading(false);
        return;
      }

      if (billsRes.error) {
        setError(billsRes.error.message);
        setLoading(false);
        return;
      }

      if (closingsRes.error) {
        setError(closingsRes.error.message);
        setLoading(false);
        return;
      }

      if (latestClosingRes.error) {
        setError(latestClosingRes.error.message);
        setLoading(false);
        return;
      }

      setAccounts(accountsRes.data);
      setCategories(categoriesRes.data);
      setTransactions(transactionsRes.data);
      setInvestments(investmentsRes.data);
      setBills(billsRes.data);
      setClosings(closingsRes.data);
      setLatestClosing(latestClosingRes.data);
      setLoading(false);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, user?.id]);

  const periodMonths = useMemo(() => getMonthsForPreset(periodPreset), [periodPreset]);
  const periodLabel = useMemo(() => getPeriodLabel(periodMonths), [periodMonths]);
  const periodMonthKeys = useMemo(
    () => new Set(periodMonths.map((item) => monthKey(item.year, item.month))),
    [periodMonths],
  );

  const summary = useMemo(() => {
    const totals = periodMonths.reduce(
      (acc, item) => {
        const income = getMonthIncome(transactions, item.year, item.month);
        const expenses = getMonthTotalExpensesWithCardBills(
          transactions,
          bills,
          item.year,
          item.month,
        );

        return {
          income: acc.income + income,
          expenses: acc.expenses + expenses,
        };
      },
      { income: 0, expenses: 0 },
    );

    return {
      income: totals.income,
      expenses: totals.expenses,
      balance: totals.income - totals.expenses,
    };
  }, [bills, periodMonths, transactions]);

  const categoryRows = useMemo(() => {
    const expenseCategories = categories.filter((category) => category.type === 'expense');
    const rows: CategoryExpenseRow[] = expenseCategories
      .map((category) => {
        const total = periodMonths.reduce((sum, item) => {
          const monthTotal = transactions
            .filter(
              (transaction) =>
                transaction.category_id === category.id &&
                transactionMatchesCalendarMonthView(transaction, item.year, item.month) &&
                transactionCountsTowardMonthCompetenceExpenses(transaction),
            )
            .reduce((acc, transaction) => acc + transaction.amount, 0);

          return sum + monthTotal;
        }, 0);

        return {
          id: category.id,
          label: category.name,
          value: total,
        };
      })
      .filter((row) => row.value > 0);

    const creditCardBillsTotal = periodMonths.reduce(
      (sum, item) => sum + getMonthCreditCardBillsTotal(bills, item.year, item.month),
      0,
    );

    if (creditCardBillsTotal > 0) {
      rows.push({
        id: 'credit-card-bills',
        label: 'Faturas de cartao',
        value: creditCardBillsTotal,
      });
    }

    return rows.sort((a, b) => b.value - a.value);
  }, [bills, categories, periodMonths, transactions]);

  const patrimonyEvolution = useMemo(() => {
    const rows = closings
      .filter((closing) => periodMonthKeys.has(monthKey(closing.year, closing.month)))
      .slice()
      .sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year))
      .map((closing) => ({
        id: closing.id,
        label: `${MONTH_LABELS[closing.month - 1].slice(0, 3)}/${closing.year}`,
        value: closing.patrimony_total,
        source: 'closing' as const,
      }));

    if (rows.length > 0) {
      return rows;
    }

    const live = getPatrimonyBreakdown(accounts, transactions, investments, bills);
    return [
      {
        id: 'live-current',
        label: 'Atual',
        value: live.netPatrimony,
        source: 'live' as const,
      },
    ];
  }, [accounts, bills, closings, investments, periodMonthKeys, transactions]);

  const closingBlock = useMemo(() => {
    const closingsInPeriod = closings
      .filter((closing) => periodMonthKeys.has(monthKey(closing.year, closing.month)))
      .slice()
      .sort((a, b) => (a.year === b.year ? b.month - a.month : b.year - a.year));

    const closing = closingsInPeriod[0] ?? latestClosing;
    if (!closing) return null;

    return {
      label: formatMonthLabel(closing.year, closing.month),
      patrimonyTotal: closing.patrimony_total,
      totalAccounts: closing.total_accounts,
      totalInvestments: closing.total_investments,
      monthBalance: closing.month_balance,
      notes: closing.notes,
    };
  }, [closings, latestClosing, periodMonthKeys]);

  const topCategoryShare = useMemo(() => {
    if (summary.expenses <= 0 || categoryRows.length === 0) {
      return 0;
    }
    return (categoryRows[0].value / summary.expenses) * 100;
  }, [categoryRows, summary.expenses]);

  const liveDebt = useMemo(() => getOutstandingCreditCardDebt(bills), [bills]);

  const hasAnyData =
    transactions.length > 0 ||
    accounts.length > 0 ||
    investments.length > 0 ||
    bills.length > 0 ||
    closings.length > 0;

  if (loading) {
    return (
      <AppScreen scroll>
        <AppText variant="bodySmall" color="secondary">
          Carregando relatorios...
        </AppText>
      </AppScreen>
    );
  }

  if (error) {
    return (
      <AppScreen scroll>
        <AppText variant="bodySmall" color="danger">
          {error}
        </AppText>
      </AppScreen>
    );
  }

  if (!hasAnyData) {
    return (
      <AppScreen scroll>
        <AppHeader title="Relatorios" />
        <AppCard>
          <AppText variant="bodySmall" color="secondary">
            Ainda nao ha dados suficientes para montar os relatorios.
          </AppText>
        </AppCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll>
      <AppHeader title="Relatorios" />

      <View style={styles.section}>
        <AppText variant="label">Periodo</AppText>
        <AppText variant="caption" color="secondary" style={{ marginTop: theme.spacing.xs }}>
          {periodLabel}
        </AppText>
        <View style={styles.periodOptions}>
          {periodOptions.map((option) => {
            const selected = periodPreset === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setPeriodPreset(option.value)}
                style={[
                  styles.periodChip,
                  {
                    backgroundColor: selected ? theme.colors.accent : theme.colors.surfaceElevated,
                    borderColor: selected ? theme.colors.accent : theme.colors.border,
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  style={{ color: selected ? '#FFFFFF' : theme.colors.textPrimary }}
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <AppCard>
          <AppText variant="title3">Resumo do periodo</AppText>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <AppText variant="caption" color="secondary">
                Receitas
              </AppText>
              <AppText variant="title3" style={{ marginTop: theme.spacing.xs }}>
                {formatCurrency(summary.income)}
              </AppText>
            </View>
            <View style={styles.metricCard}>
              <AppText variant="caption" color="secondary">
                Despesas
              </AppText>
              <AppText variant="title3" style={{ marginTop: theme.spacing.xs }}>
                {formatCurrency(summary.expenses)}
              </AppText>
            </View>
            <View style={styles.metricCard}>
              <AppText variant="caption" color="secondary">
                Saldo
              </AppText>
              <AppText
                variant="title3"
                style={{
                  marginTop: theme.spacing.xs,
                  color: summary.balance >= 0 ? theme.colors.success : theme.colors.danger,
                }}
              >
                {formatCurrency(summary.balance)}
              </AppText>
            </View>
          </View>
        </AppCard>

        <AppCard>
          <AppText variant="title3">Despesas por categoria</AppText>
          {categoryRows.length === 0 ? (
            <AppText variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.md }}>
              Nenhuma despesa encontrada no periodo.
            </AppText>
          ) : (
            <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.md }}>
              {categoryRows.slice(0, 6).map((row) => {
                const percent = summary.expenses > 0 ? (row.value / summary.expenses) * 100 : 0;
                return (
                  <View key={row.id}>
                    <View style={styles.rowBetween}>
                      <AppText variant="body">{row.label}</AppText>
                      <AppText variant="body">{formatCurrency(row.value)}</AppText>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(100, Math.max(0, percent))}%`,
                            backgroundColor: theme.colors.accent,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
              <AppText variant="caption" color="secondary">
                Maior peso no periodo: {categoryRows[0].label} ({formatPercent(topCategoryShare)})
              </AppText>
            </View>
          )}
        </AppCard>

        <AppCard>
          <AppText variant="title3">Receitas x despesas</AppText>
          <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.md }}>
            <View style={styles.comparisonBar}>
              <View
                style={[
                  styles.comparisonFill,
                  {
                    width:
                      summary.income + summary.expenses > 0
                        ? `${(summary.income / (summary.income + summary.expenses)) * 100}%`
                        : '0%',
                    backgroundColor: theme.colors.success,
                  },
                ]}
              />
            </View>
            <View style={styles.comparisonBar}>
              <View
                style={[
                  styles.comparisonFill,
                  {
                    width:
                      summary.income + summary.expenses > 0
                        ? `${(summary.expenses / (summary.income + summary.expenses)) * 100}%`
                        : '0%',
                    backgroundColor: theme.colors.danger,
                  },
                ]}
              />
            </View>
            <View style={styles.rowBetween}>
              <AppText variant="caption" color="secondary">
                Receita total
              </AppText>
              <AppText variant="body">{formatCurrency(summary.income)}</AppText>
            </View>
            <View style={styles.rowBetween}>
              <AppText variant="caption" color="secondary">
                Despesa total
              </AppText>
              <AppText variant="body">{formatCurrency(summary.expenses)}</AppText>
            </View>
          </View>
        </AppCard>

        <AppCard>
          <AppText variant="title3">Evolucao patrimonial</AppText>
          <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.md }}>
            {patrimonyEvolution.map((item) => (
              <View key={item.id} style={styles.rowBetween}>
                <View>
                  <AppText variant="body">{item.label}</AppText>
                  <AppText variant="caption" color="secondary">
                    {item.source === 'closing' ? 'Fechamento salvo' : 'Valor ao vivo'}
                  </AppText>
                </View>
                <AppText variant="body">{formatCurrency(item.value)}</AppText>
              </View>
            ))}
            <AppText variant="caption" color="secondary">
              Divida atual em cartoes em aberto: {formatCurrency(liveDebt)}
            </AppText>
          </View>
        </AppCard>

        <AppCard>
          <AppText variant="title3">Fechamento mensal</AppText>
          {closingBlock ? (
            <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.md }}>
              <View style={styles.rowBetween}>
                <AppText variant="body">Referencia</AppText>
                <AppText variant="body">{closingBlock.label}</AppText>
              </View>
              <View style={styles.rowBetween}>
                <AppText variant="caption" color="secondary">
                  Patrimonio total
                </AppText>
                <AppText variant="body">{formatCurrency(closingBlock.patrimonyTotal)}</AppText>
              </View>
              <View style={styles.rowBetween}>
                <AppText variant="caption" color="secondary">
                  Total em contas
                </AppText>
                <AppText variant="body">{formatCurrency(closingBlock.totalAccounts)}</AppText>
              </View>
              <View style={styles.rowBetween}>
                <AppText variant="caption" color="secondary">
                  Total em investimentos
                </AppText>
                <AppText variant="body">{formatCurrency(closingBlock.totalInvestments)}</AppText>
              </View>
              <View style={styles.rowBetween}>
                <AppText variant="caption" color="secondary">
                  Saldo do mes fechado
                </AppText>
                <AppText variant="body">{formatCurrency(closingBlock.monthBalance)}</AppText>
              </View>
              {closingBlock.notes ? (
                <AppText variant="caption" color="secondary">
                  {closingBlock.notes}
                </AppText>
              ) : null}
            </View>
          ) : (
            <AppText variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.md }}>
              Nenhum fechamento mensal salvo ate agora.
            </AppText>
          )}
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
    marginBottom: 16,
  },
  periodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  periodChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: 120,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  progressTrack: {
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    height: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  comparisonBar: {
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    height: 12,
    overflow: 'hidden',
  },
  comparisonFill: {
    borderRadius: 999,
    height: '100%',
  },
});
