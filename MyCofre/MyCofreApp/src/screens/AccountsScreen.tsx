import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { AppButton, AppCard, AppHeader, AppInput, AppScreen, AppText, FloatingActionButton, FormBottomSheet } from '../components';
import { useAuth } from '../features/auth';
import { useTransactionsSync } from '../features/transactions';
import { getSupabaseMobileClient } from '../lib/supabase/client';
import {
  getAccountBalance,
  getAccountInvestmentsValue,
  getAccountPatrimony,
} from '../shared/balance';
import {
  deleteAccountRow,
  fetchAccountsForUser,
  insertAccount,
  updateAccountRow,
} from '../shared/supabase/accountsRepo';
import { fetchInvestmentsForUser } from '../shared/supabase/investmentsRepo';
import { fetchTransactionsForUser } from '../shared/supabase/transactionsRepo';
import type { Account, AccountStatus, AccountType } from '../shared/types/account';
import type { Investment } from '../shared/types/investment';
import type { Transaction } from '../shared/types/transaction';
import { useTheme } from '../theme';
import { formatCurrency } from '../utils/formatCurrency';
import type { RootTabParamList } from '../navigation/types';

const accountTypeOptions: Array<{ value: AccountType; label: string }> = [
  { value: 'checking', label: 'Conta corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'investment', label: 'Investimento' },
  { value: 'other', label: 'Outra' },
];

const statusOptions: Array<{ value: AccountStatus; label: string }> = [
  { value: 'active', label: 'Ativa' },
  { value: 'closed', label: 'Encerrada' },
];

function parseMoneyInput(value: string): number {
  const normalized = value.replace(/\./g, '').replace(',', '.').trim();
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : Number.NaN;
}

function formatAccountType(type: AccountType): string {
  return accountTypeOptions.find((option) => option.value === type)?.label ?? type;
}

function formatStatus(status: AccountStatus | null | undefined): string {
  return status === 'closed' ? 'Encerrada' : 'Ativa';
}

export function AccountsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { refreshKey, notifyTransactionsChanged } = useTransactionsSync();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const route = useRoute<RouteProp<RootTabParamList, 'Accounts'>>();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [initialBalance, setInitialBalance] = useState('');
  const [allowsInvestments, setAllowsInvestments] = useState(false);
  const [status, setStatus] = useState<AccountStatus>('active');

  const isEditing = editingAccountId !== null;
  const isCreateSheetOpen = isFormOpen && !isEditing;

  const accountCards = useMemo(
    () =>
      accounts.map((account) => ({
        account,
        balance: getAccountBalance(account, transactions),
        investmentsValue: getAccountInvestmentsValue(account.id, investments),
        patrimony: getAccountPatrimony(account, transactions, investments),
      })),
    [accounts, investments, transactions],
  );

  useEffect(() => {
    if (route.params?.openForm) {
      openCreateForm();
      navigation.setParams({ openForm: undefined });
    }
  }, [navigation, route.params?.openForm]);

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
          setAccounts([]);
          setTransactions([]);
          setInvestments([]);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError(null);
      }

      const [accountsRes, transactionsRes, investmentsRes] = await Promise.all([
        fetchAccountsForUser(client, user.id),
        fetchTransactionsForUser(client, user.id),
        fetchInvestmentsForUser(client, user.id),
      ]);

      if (cancelled) {
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

      setAccounts(accountsRes.data);
      setTransactions(transactionsRes.data);
      setInvestments(investmentsRes.data);
      setLoading(false);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, user?.id]);

  async function handleSave() {
    if (!user?.id) {
      setError('Usuário não autenticado.');
      return;
    }

    const client = getSupabaseMobileClient();
    if (!client) {
      setError('Supabase não configurado.');
      return;
    }

    const parsedBalance = parseMoneyInput(initialBalance);
    if (!name.trim()) {
      setError('Informe o nome da conta.');
      return;
    }

    if (!Number.isFinite(parsedBalance)) {
      setError('Informe um saldo inicial válido.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    if (isEditing && editingAccountId) {
      const { error: updateError } = await updateAccountRow(client, user.id, editingAccountId, {
        name: name.trim(),
        type,
        initial_balance: parsedBalance,
        allows_investments: allowsInvestments,
        status,
      });

      setSaving(false);

      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await insertAccount(client, user.id, {
        user_id: user.id,
        name: name.trim(),
        type,
        initial_balance: parsedBalance,
        allows_investments: allowsInvestments,
        created_at: new Date().toISOString(),
        status,
        institution: null,
        notes: null,
      });

      setSaving(false);

      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    resetForm();
    setSuccessMessage(isEditing ? 'Conta atualizada com sucesso.' : 'Conta criada com sucesso.');
    notifyTransactionsChanged();
  }

  function openCreateForm() {
    setEditingAccountId(null);
    setName('');
    setType('checking');
    setInitialBalance('');
    setAllowsInvestments(false);
    setStatus('active');
    setError(null);
    setSuccessMessage(null);
    setIsFormOpen(true);
  }

  function openEditForm(account: Account) {
    setEditingAccountId(account.id);
    setName(account.name);
    setType(account.type);
    setInitialBalance(String(account.initial_balance).replace('.', ','));
    setAllowsInvestments(account.allows_investments);
    setStatus(account.status ?? 'active');
    setError(null);
    setSuccessMessage(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    resetForm();
    setError(null);
  }

  function resetForm() {
    setEditingAccountId(null);
    setName('');
    setType('checking');
    setInitialBalance('');
    setAllowsInvestments(false);
    setStatus('active');
    setIsFormOpen(false);
  }

  function confirmDelete(account: Account) {
    Alert.alert(
      'Excluir conta',
      'Tem certeza que deseja excluir esta conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void handleDelete(account);
          },
        },
      ],
    );
  }

  async function handleDelete(account: Account) {
    if (!user?.id) {
      setError('Usuário não autenticado.');
      return;
    }

    const client = getSupabaseMobileClient();
    if (!client) {
      setError('Supabase não configurado.');
      return;
    }

    setDeletingId(account.id);
    setError(null);
    setSuccessMessage(null);

    const { error: deleteError } = await deleteAccountRow(client, user.id, account.id);

    setDeletingId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (editingAccountId === account.id) {
      resetForm();
    }

    setSuccessMessage('Conta excluída com sucesso.');
    notifyTransactionsChanged();
  }

  return (
    <View style={{ flex: 1 }}>
      <AppScreen
        scroll
      >
        <AppHeader title={isEditing ? 'Editar conta' : 'Contas'} />

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

      {!loading && isEditing ? (
        <AppCard style={{ ...theme.shadows.sm }}>
          <AppInput
            label="Nome"
            placeholder="Ex.: Nubank, Carteira, Caixa principal"
            value={name}
            onChangeText={setName}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Saldo inicial"
            placeholder="0,00"
            keyboardType="decimal-pad"
            value={initialBalance}
            onChangeText={setInitialBalance}
            style={{ marginBottom: theme.spacing.lg }}
          />

          <AppText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
            Tipo
          </AppText>
          <View style={styles.optionsWrap}>
            {accountTypeOptions.map((option) => (
              <ChoicePill
                key={option.value}
                label={option.label}
                selected={type === option.value}
                onPress={() => setType(option.value)}
              />
            ))}
          </View>

          <View style={{ marginTop: theme.spacing.xl }}>
            <AppText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
              Status
            </AppText>
            <View style={styles.optionsWrap}>
              {statusOptions.map((option) => (
                <ChoicePill
                  key={option.value}
                  label={option.label}
                  selected={status === option.value}
                  onPress={() => setStatus(option.value)}
                />
              ))}
            </View>
          </View>

          <View
            style={{
              marginTop: theme.spacing.xl,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: theme.spacing.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <AppText variant="bodySmall">Permite investimentos</AppText>
              <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.xs }}>
                Ative para vincular investimentos a esta conta.
              </AppText>
            </View>
            <Switch
              value={allowsInvestments}
              onValueChange={setAllowsInvestments}
              trackColor={{ false: theme.colors.border, true: theme.colors.accentMuted }}
              thumbColor={allowsInvestments ? theme.colors.accent : '#FFFFFF'}
              ios_backgroundColor={theme.colors.border}
            />
          </View>

          <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.xl }}>
            <AppButton
              title={isEditing ? 'Salvar edição' : 'Salvar conta'}
              onPress={() => void handleSave()}
              loading={saving}
              fullWidth
            />
            <AppButton
              title="Cancelar"
              variant="secondary"
              onPress={closeForm}
              fullWidth
            />
          </View>
        </AppCard>
      ) : null}

        {!loading && !isEditing ? (
        <>
          {accountCards.length === 0 ? (
            <AppText variant="bodySmall" color="secondary">
              Nenhuma conta cadastrada
            </AppText>
          ) : (
            <View style={{ gap: theme.spacing.lg }}>
              {accountCards.map(({ account, balance, investmentsValue, patrimony }) => (
                <AppCard key={account.id} style={{ ...theme.shadows.sm }}>
                  <View style={styles.headerRow}>
                    <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
                      <AppText variant="title3">{account.name}</AppText>
                      <AppText
                        variant="caption"
                        color="muted"
                        style={{ marginTop: theme.spacing.xs }}
                      >
                        {formatAccountType(account.type)} · {formatStatus(account.status)}
                      </AppText>
                    </View>
                    <View style={styles.actionsRow}>
                      <Pressable onPress={() => openEditForm(account)} style={styles.actionButton}>
                        <AppText variant="caption" color="accent">
                          Editar
                        </AppText>
                      </Pressable>
                      <Pressable
                        onPress={() => confirmDelete(account)}
                        disabled={deletingId === account.id}
                        style={styles.actionButton}
                      >
                        <AppText
                          variant="caption"
                          color={deletingId === account.id ? 'muted' : 'danger'}
                        >
                          {deletingId === account.id ? 'Excluindo...' : 'Excluir'}
                        </AppText>
                      </Pressable>
                    </View>
                  </View>

                  <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
                    <MetricRow label="Saldo atual" value={formatCurrency(balance)} />
                    <MetricRow
                      label="Permite investimentos"
                      value={account.allows_investments ? 'Sim' : 'Não'}
                    />
                    {account.allows_investments ? (
                      <>
                        <MetricRow
                          label="Valor investido na conta"
                          value={formatCurrency(investmentsValue)}
                        />
                        <MetricRow
                          label="Patrimônio da conta"
                          value={formatCurrency(patrimony)}
                        />
                      </>
                    ) : null}
                  </View>
                </AppCard>
              ))}
            </View>
          )}
        </>
        ) : null}
      </AppScreen>

      {!loading && !isEditing ? (
        <FloatingActionButton
          accessibilityLabel="Criar nova conta"
          onPress={openCreateForm}
        />
      ) : null}

      {!loading ? (
        <FormBottomSheet
          visible={isCreateSheetOpen}
          title="Nova conta"
          subtitle="Adicione uma conta sem sair da lista."
          onClose={closeForm}
          footer={
            <View style={{ gap: theme.spacing.sm }}>
              <AppButton
                title={saving ? 'Salvando conta...' : 'Salvar conta'}
                onPress={() => void handleSave()}
                loading={saving}
                fullWidth
              />
              <AppButton
                title="Cancelar"
                variant="secondary"
                onPress={closeForm}
                fullWidth
              />
            </View>
          }
        >
          <AppInput
            label="Nome"
            placeholder="Ex.: Nubank, Carteira, Caixa principal"
            value={name}
            onChangeText={setName}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Saldo inicial"
            placeholder="0,00"
            keyboardType="decimal-pad"
            value={initialBalance}
            onChangeText={setInitialBalance}
            style={{ marginBottom: theme.spacing.lg }}
          />

          <AppText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
            Tipo
          </AppText>
          <View style={styles.optionsWrap}>
            {accountTypeOptions.map((option) => (
              <ChoicePill
                key={option.value}
                label={option.label}
                selected={type === option.value}
                onPress={() => setType(option.value)}
              />
            ))}
          </View>

          <View style={{ marginTop: theme.spacing.xl }}>
            <AppText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
              Status
            </AppText>
            <View style={styles.optionsWrap}>
              {statusOptions.map((option) => (
                <ChoicePill
                  key={option.value}
                  label={option.label}
                  selected={status === option.value}
                  onPress={() => setStatus(option.value)}
                />
              ))}
            </View>
          </View>

          <View
            style={{
              marginTop: theme.spacing.xl,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: theme.spacing.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <AppText variant="bodySmall">Permite investimentos</AppText>
              <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.xs }}>
                Ative para vincular investimentos a esta conta.
              </AppText>
            </View>
            <Switch
              value={allowsInvestments}
              onValueChange={setAllowsInvestments}
              trackColor={{ false: theme.colors.border, true: theme.colors.accentMuted }}
              thumbColor={allowsInvestments ? theme.colors.accent : '#FFFFFF'}
              ios_backgroundColor={theme.colors.border}
            />
          </View>
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

function ChoicePill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.choicePill,
        {
          borderColor: selected ? theme.colors.accent : theme.colors.border,
          backgroundColor: selected ? theme.colors.surfaceElevated : theme.colors.surface,
        },
      ]}
    >
      <AppText
        variant="bodySmall"
        style={{ color: selected ? theme.colors.accent : theme.colors.textPrimary }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choicePill: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    paddingVertical: 2,
  },
});
