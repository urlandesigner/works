import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppCard, AppHeader, AppInput, AppScreen, AppText, FloatingActionButton, FormBottomSheet } from '../components';
import { useAuth } from '../features/auth';
import { useTransactionsSync } from '../features/transactions';
import { getSupabaseMobileClient } from '../lib/supabase/client';
import { buildMonthlyClosingPayload } from '../shared/monthlyClosingBuilder';
import { fetchAccountsForUser } from '../shared/supabase/accountsRepo';
import { fetchBillsForUser } from '../shared/supabase/creditCardsRepo';
import { fetchInvestmentsForUser } from '../shared/supabase/investmentsRepo';
import {
  createMonthlyClosing,
  fetchMonthlyClosingForUser,
  fetchMonthlyClosingsListForUser,
} from '../shared/supabase/monthlyClosingsRepo';
import { fetchTransactionsForUser } from '../shared/supabase/transactionsRepo';
import type { Account } from '../shared/types/account';
import type { CreditCardBill } from '../shared/types/credit-card';
import type { Investment } from '../shared/types/investment';
import type { MonthlyClosing, MonthlyClosingWithDetails } from '../shared/types/monthly-closing';
import type { Transaction } from '../shared/types/transaction';
import { useTheme } from '../theme';
import { formatCurrency } from '../utils/formatCurrency';

type ScreenMode = 'list' | 'detail' | 'new';

const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
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

function formatClosingPeriod(year: number, month: number): string {
  const label = MONTH_LABELS[month - 1] ?? `Mês ${month}`;
  return `${label} ${year}`;
}

export function MonthlyClosingScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { refreshKey, notifyTransactionsChanged } = useTransactionsSync();

  const [closings, setClosings] = useState<MonthlyClosing[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [bills, setBills] = useState<CreditCardBill[]>([]);
  const [selectedClosing, setSelectedClosing] = useState<MonthlyClosingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<ScreenMode>('list');
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const closingPreview = useMemo(() => {
    const year = Number.parseInt(selectedYear, 10);
    const month = Number.parseInt(selectedMonth, 10);
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      return null;
    }

    return buildMonthlyClosingPayload({
      year,
      month,
      accounts,
      transactions,
      investments,
      bills,
      notes: notes.trim() || null,
    });
  }, [accounts, bills, investments, notes, selectedMonth, selectedYear, transactions]);

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

      const [closingsRes, accountsRes, transactionsRes, investmentsRes, billsRes] =
        await Promise.all([
          fetchMonthlyClosingsListForUser(client, user.id),
          fetchAccountsForUser(client, user.id),
          fetchTransactionsForUser(client, user.id),
          fetchInvestmentsForUser(client, user.id),
          fetchBillsForUser(client, user.id),
        ]);

      if (cancelled) {
        return;
      }

      if (closingsRes.error) {
        setError(closingsRes.error.message);
        setLoading(false);
        return;
      }
      if (accountsRes.error) {
        setError(accountsRes.error.message);
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

      setClosings(closingsRes.data);
      setAccounts(accountsRes.data);
      setTransactions(transactionsRes.data);
      setInvestments(investmentsRes.data);
      setBills(billsRes.data);
      setLoading(false);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, user?.id]);

  async function openDetail(closing: MonthlyClosing) {
    if (!user?.id) {
      setError('Usuário não autenticado.');
      return;
    }
    const client = getSupabaseMobileClient();
    if (!client) {
      setError('Supabase não configurado.');
      return;
    }

    setError(null);
    const { data, error: fetchError } = await fetchMonthlyClosingForUser(
      client,
      user.id,
      closing.year,
      closing.month,
    );

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setSelectedClosing(data);
    setMode('detail');
  }

  async function handleCreateClosing() {
    if (!user?.id) {
      setError('Usuário não autenticado.');
      return;
    }
    const client = getSupabaseMobileClient();
    if (!client) {
      setError('Supabase não configurado.');
      return;
    }
    if (!closingPreview) {
      setError('Informe um período válido.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const { data, error: createError } = await createMonthlyClosing(client, user.id, closingPreview);

    setSubmitting(false);

    if (createError) {
      setError(createError.message);
      return;
    }

    setSelectedClosing(data);
    setMode('detail');
    setSuccessMessage(
      `Fechamento criado: ${formatClosingPeriod(closingPreview.year, closingPreview.month)}`,
    );
    notifyTransactionsChanged();
  }

  function openNewClosing() {
    setMode('new');
    setSelectedClosing(null);
    setNotes('');
    setError(null);
    setSuccessMessage(null);
  }

  function closeDetail() {
    setSelectedClosing(null);
    setMode('list');
  }

  function closeNewClosing() {
    setMode('list');
    setNotes('');
    setError(null);
  }

  const screenTitle =
    mode === 'detail'
      ? 'Detalhe do fechamento'
      : mode === 'new'
        ? 'Novo fechamento'
        : 'Fechamento mensal';

  return (
    <View style={{ flex: 1 }}>
      <AppScreen
        scroll
      >
        <AppHeader title={mode === 'detail' ? screenTitle : 'Fechamento mensal'} />

      {successMessage ? (
        <AppText variant="bodySmall" color="success" style={{ marginBottom: theme.spacing.md }}>
          {successMessage}
        </AppText>
      ) : null}

      {loading ? (
        <AppText variant="bodySmall" color="secondary">
          Carregando...
        </AppText>
      ) : null}

      {!loading && error ? (
        <AppText variant="bodySmall" color="danger" style={{ marginBottom: theme.spacing.md }}>
          {error}
        </AppText>
      ) : null}

        {!loading && (mode === 'list' || mode === 'new') ? (
        <>
          {closings.length === 0 ? (
            <AppText variant="bodySmall" color="secondary">
              Nenhum fechamento mensal cadastrado
            </AppText>
          ) : (
            <View style={{ gap: theme.spacing.lg }}>
              {closings.map((closing) => (
                <AppCard key={closing.id} style={{ ...theme.shadows.sm }}>
                  <Pressable onPress={() => void openDetail(closing)}>
                    <AppText variant="title3">
                      {formatClosingPeriod(closing.year, closing.month)}
                    </AppText>
                    <AppText
                      variant="caption"
                      color="muted"
                      style={{ marginTop: theme.spacing.xs }}
                    >
                      Fechado em {closing.closed_at?.slice(0, 10) ?? 'data indisponível'}
                    </AppText>

                    <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
                      <MetricRow
                        label="Patrimônio total"
                        value={formatCurrency(closing.patrimony_total)}
                      />
                      <MetricRow
                        label="Total em contas"
                        value={formatCurrency(closing.total_accounts)}
                      />
                      <MetricRow
                        label="Total em investimentos"
                        value={formatCurrency(closing.total_investments)}
                      />
                      <MetricRow label="Status" value="Fechado" />
                    </View>
                  </Pressable>
                </AppCard>
              ))}
            </View>
          )}
        </>
        ) : null}

        {!loading && mode === 'detail' && selectedClosing ? (
        <>
          <View style={{ marginBottom: theme.spacing.lg }}>
            <AppButton
              title="Voltar para fechamentos"
              variant="secondary"
              onPress={closeDetail}
              fullWidth
            />
          </View>

          <AppCard style={{ marginBottom: theme.spacing.lg, ...theme.shadows.sm }}>
            <AppText variant="title3">
              {formatClosingPeriod(selectedClosing.year, selectedClosing.month)}
            </AppText>
            <AppText
              variant="caption"
              color="muted"
              style={{ marginTop: theme.spacing.xs }}
            >
              Fechado em {selectedClosing.closed_at?.slice(0, 10) ?? 'data indisponível'}
            </AppText>

            <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
              <MetricRow
                label="Patrimônio total"
                value={formatCurrency(selectedClosing.patrimony_total)}
              />
              <MetricRow
                label="Total em contas"
                value={formatCurrency(selectedClosing.total_accounts)}
              />
              <MetricRow
                label="Total em investimentos"
                value={formatCurrency(selectedClosing.total_investments)}
              />
              <MetricRow
                label="Receitas do mês"
                value={formatCurrency(selectedClosing.month_income)}
              />
              <MetricRow
                label="Despesas do mês"
                value={formatCurrency(selectedClosing.month_expenses)}
              />
              <MetricRow
                label="Saldo do mês"
                value={formatCurrency(selectedClosing.month_balance)}
              />
              {selectedClosing.notes ? (
                <MetricRow label="Observações" value={selectedClosing.notes} />
              ) : null}
            </View>
          </AppCard>

          <AppText variant="title3" style={{ marginBottom: theme.spacing.md }}>
            Contas no snapshot
          </AppText>
          {selectedClosing.monthly_closing_accounts.length === 0 ? (
            <AppText variant="bodySmall" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
              Nenhuma conta registrada neste fechamento
            </AppText>
          ) : (
            <View style={{ gap: theme.spacing.lg, marginBottom: theme.spacing.sectionGap }}>
              {selectedClosing.monthly_closing_accounts.map((account) => (
                <AppCard key={account.id} style={{ ...theme.shadows.sm }}>
                  <AppText variant="bodySmall" style={{ fontWeight: '600' }}>
                    {account.account_name}
                  </AppText>
                  <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
                    <MetricRow label="Tipo" value={account.account_type ?? 'Não informado'} />
                    <MetricRow label="Instituição" value={account.institution ?? 'Não informada'} />
                    <MetricRow label="Saldo fechado" value={formatCurrency(account.balance)} />
                  </View>
                </AppCard>
              ))}
            </View>
          )}

          <AppText variant="title3" style={{ marginBottom: theme.spacing.md }}>
            Investimentos no snapshot
          </AppText>
          {selectedClosing.monthly_closing_investments.length === 0 ? (
            <AppText variant="bodySmall" color="secondary">
              Nenhum investimento registrado neste fechamento
            </AppText>
          ) : (
            <View style={{ gap: theme.spacing.lg }}>
              {selectedClosing.monthly_closing_investments.map((investment) => (
                <AppCard key={investment.id} style={{ ...theme.shadows.sm }}>
                  <AppText variant="bodySmall" style={{ fontWeight: '600' }}>
                    {investment.investment_name}
                  </AppText>
                  <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
                    <MetricRow
                      label="Tipo"
                      value={investment.investment_type ?? 'Não informado'}
                    />
                    <MetricRow
                      label="Instituição"
                      value={investment.institution ?? 'Não informada'}
                    />
                    <MetricRow
                      label="Valor investido"
                      value={formatCurrency(investment.invested_amount)}
                    />
                    <MetricRow
                      label="Valor atual"
                      value={formatCurrency(investment.current_amount)}
                    />
                  </View>
                </AppCard>
              ))}
            </View>
          )}
        </>
        ) : null}
      </AppScreen>

      {!loading && (mode === 'list' || mode === 'new') ? (
        <FloatingActionButton
          accessibilityLabel="Criar novo fechamento mensal"
          onPress={openNewClosing}
        />
      ) : null}

      {!loading ? (
        <FormBottomSheet
          visible={mode === 'new'}
          title="Novo fechamento"
          subtitle="Revise os valores e salve o snapshot do mês."
          onClose={closeNewClosing}
          footer={
            <View style={{ gap: theme.spacing.sm }}>
              <AppButton
                title="Salvar fechamento"
                onPress={() => void handleCreateClosing()}
                loading={submitting}
                fullWidth
              />
              <AppButton
                title="Cancelar"
                variant="secondary"
                onPress={closeNewClosing}
                fullWidth
              />
            </View>
          }
        >
          <AppInput
            label="Ano"
            placeholder="2025"
            keyboardType="number-pad"
            value={selectedYear}
            onChangeText={setSelectedYear}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Mês"
            placeholder="1 a 12"
            keyboardType="number-pad"
            value={selectedMonth}
            onChangeText={setSelectedMonth}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Observações"
            placeholder="Opcional"
            value={notes}
            onChangeText={setNotes}
            style={{ marginBottom: theme.spacing.lg }}
          />

          {closingPreview ? (
            <AppCard
              style={{
                marginBottom: theme.spacing.xl,
                backgroundColor: theme.colors.surfaceElevated,
              }}
            >
              <AppText variant="title3">
                Revisão de {formatClosingPeriod(closingPreview.year, closingPreview.month)}
              </AppText>
              <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
                <MetricRow
                  label="Patrimônio total"
                  value={formatCurrency(closingPreview.patrimony_total)}
                />
                <MetricRow
                  label="Total em contas"
                  value={formatCurrency(closingPreview.total_accounts)}
                />
                <MetricRow
                  label="Total em investimentos"
                  value={formatCurrency(closingPreview.total_investments)}
                />
                <MetricRow
                  label="Receitas do mês"
                  value={formatCurrency(closingPreview.month_income)}
                />
                <MetricRow
                  label="Despesas do mês"
                  value={formatCurrency(closingPreview.month_expenses)}
                />
                <MetricRow
                  label="Saldo do mês"
                  value={formatCurrency(closingPreview.month_balance)}
                />
                <MetricRow label="Contas no snapshot" value={String(closingPreview.accounts.length)} />
                <MetricRow
                  label="Investimentos no snapshot"
                  value={String(closingPreview.investments.length)}
                />
              </View>
            </AppCard>
          ) : null}

        </FormBottomSheet>
      ) : null}
    </View>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md }}>
      <AppText variant="bodySmall" color="secondary" style={{ flex: 1 }}>
        {label}
      </AppText>
      <AppText variant="bodySmall" style={{ fontWeight: '600', textAlign: 'right' }}>
        {value}
      </AppText>
    </View>
  );
}
