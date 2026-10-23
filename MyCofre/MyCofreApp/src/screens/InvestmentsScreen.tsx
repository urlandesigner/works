import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppCard, AppHeader, AppInput, AppScreen, AppText, FloatingActionButton, FormBottomSheet } from '../components';
import { useAuth } from '../features/auth';
import { useTransactionsSync } from '../features/transactions';
import { getSupabaseMobileClient } from '../lib/supabase/client';
import { fetchAccountsForUser } from '../shared/supabase/accountsRepo';
import {
  deleteInvestmentRow,
  fetchInvestmentsForUser,
  insertInvestment,
  updateInvestmentRow,
} from '../shared/supabase/investmentsRepo';
import type { Account } from '../shared/types/account';
import type { Investment, InvestmentStatus, InvestmentType } from '../shared/types/investment';
import { useTheme } from '../theme';
import { formatCurrency } from '../utils/formatCurrency';

type ScreenMode = 'list' | 'form' | 'detail';

const investmentTypeOptions: Array<{ value: InvestmentType; label: string }> = [
  { value: 'fixed_income', label: 'Renda fixa' },
  { value: 'variable_income', label: 'Renda variável' },
  { value: 'crypto', label: 'Cripto' },
];

const investmentStatusOptions: Array<{ value: InvestmentStatus; label: string }> = [
  { value: 'active', label: 'Ativo' },
  { value: 'sold', label: 'Vendido' },
  { value: 'closed', label: 'Encerrado' },
];

function parseMoneyInput(value: string): number {
  const normalized = value.replace(/\./g, '').replace(',', '.').trim();
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : Number.NaN;
}

function formatInvestmentType(type: InvestmentType): string {
  return investmentTypeOptions.find((option) => option.value === type)?.label ?? type;
}

function formatInvestmentStatus(status: InvestmentStatus | null | undefined): string {
  if (status === 'sold') return 'Vendido';
  if (status === 'closed') return 'Encerrado';
  return 'Ativo';
}

export function InvestmentsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { refreshKey, notifyTransactionsChanged } = useTransactionsSync();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mode, setMode] = useState<ScreenMode>('list');
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);
  const [editingInvestmentId, setEditingInvestmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('fixed_income');
  const [accountId, setAccountId] = useState('');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [institution, setInstitution] = useState('');
  const [status, setStatus] = useState<InvestmentStatus>('active');
  const [notes, setNotes] = useState('');

  const selectedInvestment = useMemo(
    () => investments.find((investment) => investment.id === selectedInvestmentId) ?? null,
    [investments, selectedInvestmentId],
  );

  const accountNameById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name] as const)),
    [accounts],
  );

  const investmentDifference = selectedInvestment
    ? selectedInvestment.current_amount - selectedInvestment.invested_amount
    : 0;

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
          setInvestments([]);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError(null);
      }

      const [accountsRes, investmentsRes] = await Promise.all([
        fetchAccountsForUser(client, user.id),
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

      if (investmentsRes.error) {
        setError(investmentsRes.error.message);
        setLoading(false);
        return;
      }

      setAccounts(accountsRes.data);
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

    const parsedInvested = parseMoneyInput(investedAmount);
    const parsedCurrent = parseMoneyInput(currentAmount);

    if (!name.trim()) {
      setError('Informe o nome do investimento.');
      return;
    }

    if (!Number.isFinite(parsedInvested) || parsedInvested < 0) {
      setError('Informe um valor investido válido.');
      return;
    }

    if (!Number.isFinite(parsedCurrent) || parsedCurrent < 0) {
      setError('Informe um valor atual válido.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    if (editingInvestmentId) {
      const { error: updateError } = await updateInvestmentRow(
        client,
        user.id,
        editingInvestmentId,
        {
          account_id: accountId || null,
          name: name.trim(),
          type,
          invested_amount: parsedInvested,
          current_amount: parsedCurrent,
          institution: institution.trim() || null,
          status,
          notes: notes.trim() || null,
        },
      );

      setSaving(false);

      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await insertInvestment(client, user.id, {
        user_id: user.id,
        account_id: accountId || null,
        name: name.trim(),
        type,
        invested_amount: parsedInvested,
        current_amount: parsedCurrent,
        institution: institution.trim() || null,
        status,
        notes: notes.trim() || null,
        created_at: new Date().toISOString(),
      });

      setSaving(false);

      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    closeForm();
    setSuccessMessage(
      editingInvestmentId
        ? 'Investimento atualizado com sucesso.'
        : 'Investimento criado com sucesso.',
    );
    notifyTransactionsChanged();
  }

  function openCreateForm() {
    setEditingInvestmentId(null);
    setName('');
    setType('fixed_income');
    setAccountId('');
    setInvestedAmount('');
    setCurrentAmount('');
    setInstitution('');
    setStatus('active');
    setNotes('');
    setError(null);
    setSuccessMessage(null);
    setMode('form');
  }

  function openEditForm(investment: Investment) {
    setEditingInvestmentId(investment.id);
    setName(investment.name);
    setType(investment.type);
    setAccountId(investment.account_id ?? '');
    setInvestedAmount(String(investment.invested_amount).replace('.', ','));
    setCurrentAmount(String(investment.current_amount).replace('.', ','));
    setInstitution(investment.institution ?? '');
    setStatus(investment.status ?? 'active');
    setNotes(investment.notes ?? '');
    setError(null);
    setSuccessMessage(null);
    setMode('form');
  }

  function closeForm() {
    setEditingInvestmentId(null);
    setName('');
    setType('fixed_income');
    setAccountId('');
    setInvestedAmount('');
    setCurrentAmount('');
    setInstitution('');
    setStatus('active');
    setNotes('');
    setMode(selectedInvestmentId ? 'detail' : 'list');
  }

  function openDetail(investment: Investment) {
    setSelectedInvestmentId(investment.id);
    setError(null);
    setSuccessMessage(null);
    setMode('detail');
  }

  function closeDetail() {
    setSelectedInvestmentId(null);
    setMode('list');
  }

  function confirmDelete(investment: Investment) {
    Alert.alert(
      'Excluir investimento',
      'Tem certeza que deseja excluir este investimento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void handleDelete(investment);
          },
        },
      ],
    );
  }

  async function handleDelete(investment: Investment) {
    if (!user?.id) {
      setError('Usuário não autenticado.');
      return;
    }

    const client = getSupabaseMobileClient();
    if (!client) {
      setError('Supabase não configurado.');
      return;
    }

    setDeletingId(investment.id);
    setError(null);
    setSuccessMessage(null);

    const { error: deleteError } = await deleteInvestmentRow(client, user.id, investment.id);

    setDeletingId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (selectedInvestmentId === investment.id) {
      closeDetail();
    }

    setSuccessMessage('Investimento excluído com sucesso.');
    notifyTransactionsChanged();
  }

  const screenTitle =
    mode === 'form' && editingInvestmentId
      ? 'Editar investimento'
      : mode === 'detail'
        ? 'Detalhe do investimento'
        : 'Investimentos';
  const isCreateSheetOpen = mode === 'form' && editingInvestmentId === null;
  const isEditScreen = mode === 'form' && editingInvestmentId !== null;

  return (
    <View style={{ flex: 1 }}>
      <AppScreen
        scroll
      >
        <AppHeader title={screenTitle} />

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

        {!loading && (mode === 'list' || isCreateSheetOpen) ? (
        <>
          {investments.length === 0 ? (
            <AppText variant="bodySmall" color="secondary">
              Nenhum investimento cadastrado
            </AppText>
          ) : (
            <View style={{ gap: theme.spacing.lg }}>
              {investments.map((investment) => (
                <AppCard key={investment.id} style={{ ...theme.shadows.sm }}>
                  <Pressable onPress={() => openDetail(investment)}>
                    <View style={styles.headerRow}>
                      <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
                        <AppText variant="title3">{investment.name}</AppText>
                        <AppText
                          variant="caption"
                          color="muted"
                          style={{ marginTop: theme.spacing.xs }}
                        >
                          {formatInvestmentType(investment.type)} ·{' '}
                          {formatInvestmentStatus(investment.status)}
                        </AppText>
                      </View>
                      <View style={styles.actionsRow}>
                        <Pressable
                          onPress={() => openEditForm(investment)}
                          style={styles.actionButton}
                        >
                          <AppText variant="caption" color="accent">
                            Editar
                          </AppText>
                        </Pressable>
                        <Pressable
                          onPress={() => confirmDelete(investment)}
                          disabled={deletingId === investment.id}
                          style={styles.actionButton}
                        >
                          <AppText
                            variant="caption"
                            color={deletingId === investment.id ? 'muted' : 'danger'}
                          >
                            {deletingId === investment.id ? 'Excluindo...' : 'Excluir'}
                          </AppText>
                        </Pressable>
                      </View>
                    </View>

                    <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
                      {investment.institution ? (
                        <MetricRow label="Instituição" value={investment.institution} />
                      ) : null}
                      <MetricRow
                        label="Conta vinculada"
                        value={
                          investment.account_id
                            ? accountNameById.get(investment.account_id) ?? 'Conta'
                            : 'Sem conta'
                        }
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
                  </Pressable>
                </AppCard>
              ))}
            </View>
          )}
        </>
        ) : null}

        {!loading && isEditScreen ? (
        <AppCard style={{ ...theme.shadows.sm }}>
          <AppInput
            label="Nome"
            placeholder="Ex.: Tesouro Selic, Bitcoin, PETR4"
            value={name}
            onChangeText={setName}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
            Tipo
          </AppText>
          <View style={styles.optionsWrap}>
            {investmentTypeOptions.map((option) => (
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
              Conta vinculada
            </AppText>
            <View style={styles.optionsWrap}>
              <ChoicePill
                label="Sem conta"
                selected={accountId === ''}
                onPress={() => setAccountId('')}
              />
              {accounts
                .filter((account) => account.allows_investments)
                .map((account) => (
                  <ChoicePill
                    key={account.id}
                    label={account.name}
                    selected={accountId === account.id}
                    onPress={() => setAccountId(account.id)}
                  />
                ))}
            </View>
          </View>

          <AppInput
            label="Valor investido"
            placeholder="0,00"
            keyboardType="decimal-pad"
            value={investedAmount}
            onChangeText={setInvestedAmount}
            style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Valor atual"
            placeholder="0,00"
            keyboardType="decimal-pad"
            value={currentAmount}
            onChangeText={setCurrentAmount}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Instituição"
            placeholder="Ex.: XP, Nubank, Binance"
            value={institution}
            onChangeText={setInstitution}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
            Status
          </AppText>
          <View style={styles.optionsWrap}>
            {investmentStatusOptions.map((option) => (
              <ChoicePill
                key={option.value}
                label={option.label}
                selected={status === option.value}
                onPress={() => setStatus(option.value)}
              />
            ))}
          </View>

          <AppInput
            label="Observações"
            placeholder="Opcional"
            value={notes}
            onChangeText={setNotes}
            style={{ marginTop: theme.spacing.xl }}
          />

          <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.xl }}>
            <AppButton
              title={editingInvestmentId ? 'Salvar edição' : 'Salvar investimento'}
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

        {!loading && mode === 'detail' && selectedInvestment ? (
        <>
          <View style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.sm }}>
            <AppButton
              title="Voltar para investimentos"
              variant="secondary"
              onPress={closeDetail}
              fullWidth
            />
            <AppButton
              title="Editar investimento"
              onPress={() => openEditForm(selectedInvestment)}
              fullWidth
            />
          </View>

          <AppCard style={{ ...theme.shadows.sm }}>
            <AppText variant="title3">{selectedInvestment.name}</AppText>
            <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.xs }}>
              {formatInvestmentType(selectedInvestment.type)} ·{' '}
              {formatInvestmentStatus(selectedInvestment.status)}
            </AppText>

            <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
              <MetricRow label="Nome" value={selectedInvestment.name} />
              <MetricRow
                label="Tipo"
                value={formatInvestmentType(selectedInvestment.type)}
              />
              <MetricRow
                label="Instituição"
                value={selectedInvestment.institution || 'Não informada'}
              />
              <MetricRow
                label="Conta vinculada"
                value={
                  selectedInvestment.account_id
                    ? accountNameById.get(selectedInvestment.account_id) ?? 'Conta'
                    : 'Sem conta'
                }
              />
              <MetricRow
                label="Valor investido"
                value={formatCurrency(selectedInvestment.invested_amount)}
              />
              <MetricRow
                label="Valor atual"
                value={formatCurrency(selectedInvestment.current_amount)}
              />
              <MetricRow
                label="Diferença"
                value={formatCurrency(investmentDifference)}
              />
              <MetricRow
                label="Status"
                value={formatInvestmentStatus(selectedInvestment.status)}
              />
              {selectedInvestment.notes ? (
                <MetricRow label="Observações" value={selectedInvestment.notes} />
              ) : null}
            </View>
          </AppCard>
        </>
        ) : null}
      </AppScreen>

      {!loading && (mode === 'list' || isCreateSheetOpen) ? (
        <FloatingActionButton
          accessibilityLabel="Criar novo investimento"
          onPress={openCreateForm}
        />
      ) : null}

      {!loading ? (
        <FormBottomSheet
          visible={isCreateSheetOpen}
          title="Novo investimento"
          subtitle="Adicione um investimento sem sair da lista."
          onClose={closeForm}
          footer={
            <View style={{ gap: theme.spacing.sm }}>
              <AppButton
                title={saving ? 'Salvando investimento...' : 'Salvar investimento'}
                onPress={() => void handleSave()}
                loading={saving}
                fullWidth
              />
              <AppButton title="Cancelar" variant="secondary" onPress={closeForm} fullWidth />
            </View>
          }
        >
          <AppInput
            label="Nome"
            placeholder="Ex.: Tesouro Selic, Bitcoin, PETR4"
            value={name}
            onChangeText={setName}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
            Tipo
          </AppText>
          <View style={styles.optionsWrap}>
            {investmentTypeOptions.map((option) => (
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
              Conta vinculada
            </AppText>
            <View style={styles.optionsWrap}>
              <ChoicePill
                label="Sem conta"
                selected={accountId === ''}
                onPress={() => setAccountId('')}
              />
              {accounts
                .filter((account) => account.allows_investments)
                .map((account) => (
                  <ChoicePill
                    key={account.id}
                    label={account.name}
                    selected={accountId === account.id}
                    onPress={() => setAccountId(account.id)}
                  />
                ))}
            </View>
          </View>

          <AppInput
            label="Valor investido"
            placeholder="0,00"
            keyboardType="decimal-pad"
            value={investedAmount}
            onChangeText={setInvestedAmount}
            style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Valor atual"
            placeholder="0,00"
            keyboardType="decimal-pad"
            value={currentAmount}
            onChangeText={setCurrentAmount}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Instituição"
            placeholder="Ex.: XP, Nubank, Binance"
            value={institution}
            onChangeText={setInstitution}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
            Status
          </AppText>
          <View style={styles.optionsWrap}>
            {investmentStatusOptions.map((option) => (
              <ChoicePill
                key={option.value}
                label={option.label}
                selected={status === option.value}
                onPress={() => setStatus(option.value)}
              />
            ))}
          </View>

          <AppInput
            label="Observações"
            placeholder="Opcional"
            value={notes}
            onChangeText={setNotes}
            style={{ marginTop: theme.spacing.xl }}
          />
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
