import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard, AppHeader, AppScreen, AppText } from '../components';
import { useAuth } from '../features/auth';
import { useTransactionsSync } from '../features/transactions';
import { getSupabaseMobileClient } from '../lib/supabase/client';
import { getOutstandingCreditCardDebt } from '../shared/balance';
import { logPatrimonyAudit } from '../shared/patrimonyAudit';
import { getEffectivePatrimony } from '../shared/patrimonyWithClosing';
import { fetchAccountsForUser } from '../shared/supabase/accountsRepo';
import { fetchBillsForUser } from '../shared/supabase/creditCardsRepo';
import { fetchInvestmentsForUser } from '../shared/supabase/investmentsRepo';
import { fetchLatestMonthlyClosingWithDetailsForUser } from '../shared/supabase/monthlyClosingsRepo';
import { fetchTransactionsForUser } from '../shared/supabase/transactionsRepo';
import type { Account } from '../shared/types/account';
import type { CreditCardBill } from '../shared/types/credit-card';
import type { Investment } from '../shared/types/investment';
import type { MonthlyClosingWithDetails } from '../shared/types/monthly-closing';
import type { Transaction as DbTransaction } from '../shared/types/transaction';
import { useTheme } from '../theme';
import { formatCurrency } from '../utils/formatCurrency';

function investmentStatusLabel(status: Investment['status']): string {
  if (status === 'sold') return 'Vendido';
  if (status === 'closed') return 'Encerrado';
  return 'Ativo';
}

export function WealthScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { refreshKey } = useTransactionsSync();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [bills, setBills] = useState<CreditCardBill[]>([]);
  const [monthlyClosing, setMonthlyClosing] = useState<MonthlyClosingWithDetails | null>(null);

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

      const [accRes, txRes, invRes, billsRes, closingRes] = await Promise.all([
        fetchAccountsForUser(client, user.id),
        fetchTransactionsForUser(client, user.id),
        fetchInvestmentsForUser(client, user.id),
        fetchBillsForUser(client, user.id),
        fetchLatestMonthlyClosingWithDetailsForUser(client, user.id),
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
      if (closingRes.error) {
        setError(closingRes.error.message);
        setLoading(false);
        return;
      }

      setMonthlyClosing(closingRes.data);
      setAccounts(accRes.data);
      setTransactions(txRes.data);
      setInvestments(invRes.data);
      setBills(billsRes.data);
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
      'WealthScreen',
      accounts,
      transactions,
      investments,
      bills,
      monthlyClosing
    );
  }, [loading, error, accounts, transactions, investments, bills, monthlyClosing]);

  const effectivePatrimony = getEffectivePatrimony(
    monthlyClosing,
    accounts,
    transactions,
    investments,
    bills
  );
  const net = effectivePatrimony.netPatrimony;
  const cash = effectivePatrimony.totalCash;
  const investmentsTotal = effectivePatrimony.totalInvestmentsValue;
  const cardDebt = effectivePatrimony.outstandingCreditCardDebt;

  const isGloballyEmpty =
    monthlyClosing == null &&
    accounts.length === 0 &&
    investments.length === 0 &&
    getOutstandingCreditCardDebt(bills) === 0;

  if (loading) {
    return (
      <AppScreen scroll>
        <AppText variant="bodySmall" color="secondary">
          Carregando...
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

  return (
    <AppScreen scroll>
      <AppHeader title="Patrimônio" />

      {isGloballyEmpty ? (
        <AppText variant="bodySmall" color="secondary">
          Nenhum dado cadastrado — adicione contas ou investimentos para ver o patrimônio.
        </AppText>
      ) : (
        <>
          <AppCard
            style={{
              marginBottom: theme.spacing.lg,
              borderLeftWidth: 3,
              borderLeftColor: theme.colors.accent,
              ...theme.shadows.md,
            }}
          >
            <AppText variant="overline" color="secondary">
              Patrimônio líquido
            </AppText>
            <AppText variant="display" style={{ marginTop: theme.spacing.md }}>
              {formatCurrency(net)}
            </AppText>
            <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.sm }}>
              Contas + investimentos − faturas em aberto
            </AppText>

            <View
              style={{
                marginTop: theme.spacing.lg,
                paddingTop: theme.spacing.md,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: theme.colors.border,
                gap: theme.spacing.md,
              }}
            >
              <SummaryRow label="Saldo em contas" value={cash} />
              <SummaryRow label="Total em investimentos" value={investmentsTotal} />
              <SummaryRow label="Faturas em aberto" value={cardDebt} emphasizeDebt />
            </View>
          </AppCard>

          <AppText variant="title3" style={{ marginBottom: theme.spacing.md }}>
            Seus investimentos
          </AppText>

          {investments.length === 0 ? (
            <AppText variant="bodySmall" color="secondary" style={{ marginBottom: theme.spacing.sectionGap }}>
              Nenhum investimento cadastrado
            </AppText>
          ) : (
            <AppCard style={{ marginBottom: theme.spacing.sectionGap, ...theme.shadows.sm }}>
              {investments.map((inv, index) => (
                <View
                  key={inv.id}
                  style={{
                    paddingVertical: theme.spacing.md,
                    borderBottomWidth: index < investments.length - 1 ? StyleSheet.hairlineWidth : 0,
                    borderBottomColor: theme.colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: theme.spacing.md,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <AppText variant="bodySmall" style={{ fontWeight: '600' }}>
                        {inv.name}
                      </AppText>
                      {inv.institution ? (
                        <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.xxs }}>
                          {inv.institution}
                        </AppText>
                      ) : null}
                    </View>
                    <AppText variant="caption" color="secondary">
                      {investmentStatusLabel(inv.status)}
                    </AppText>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: theme.spacing.md,
                    }}
                  >
                    <View>
                      <AppText variant="caption" color="muted">
                        Valor investido
                      </AppText>
                      <AppText variant="bodySmall" style={{ fontVariant: ['tabular-nums'], marginTop: 4 }}>
                        {formatCurrency(inv.invested_amount)}
                      </AppText>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <AppText variant="caption" color="muted">
                        Valor atual
                      </AppText>
                      <AppText
                        variant="bodySmall"
                        style={{
                          fontVariant: ['tabular-nums'],
                          fontWeight: '600',
                          marginTop: 4,
                          color: theme.colors.textPrimary,
                        }}
                      >
                        {formatCurrency(inv.current_amount)}
                      </AppText>
                    </View>
                  </View>
                </View>
              ))}
            </AppCard>
          )}
        </>
      )}
    </AppScreen>
  );
}

function SummaryRow({
  label,
  value,
  emphasizeDebt,
}: {
  label: string;
  value: number;
  emphasizeDebt?: boolean;
}) {
  const danger = emphasizeDebt && value > 0;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <AppText variant="bodySmall" color="secondary">
        {label}
      </AppText>
      <AppText
        variant="bodySmall"
        color={danger ? 'danger' : 'primary'}
        style={{ fontVariant: ['tabular-nums'], fontWeight: '600' }}
      >
        {formatCurrency(value)}
      </AppText>
    </View>
  );
}
