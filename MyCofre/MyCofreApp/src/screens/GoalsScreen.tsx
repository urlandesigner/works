import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { AppButton, AppCard, AppHeader, AppInput, AppScreen, AppText, FloatingActionButton, FormBottomSheet } from '../components';
import { useAuth } from '../features/auth';
import { useTransactionsSync } from '../features/transactions';
import { getSupabaseMobileClient } from '../lib/supabase/client';
import {
  getGoalCurrentAmount,
  getGoalProgressPercentUI,
  getGoalType,
} from '../shared/goalProgress';
import { fetchAccountsForUser } from '../shared/supabase/accountsRepo';
import { fetchBillsForUser } from '../shared/supabase/creditCardsRepo';
import {
  deleteGoalRow,
  fetchGoalsForUser,
  insertGoal,
  updateGoalRow,
} from '../shared/supabase/goalsRepo';
import { fetchInvestmentsForUser } from '../shared/supabase/investmentsRepo';
import { fetchTransactionsForUser } from '../shared/supabase/transactionsRepo';
import type { Account } from '../shared/types/account';
import type { CreditCardBill } from '../shared/types/credit-card';
import type { Goal, GoalType } from '../shared/types/goal';
import type { Investment } from '../shared/types/investment';
import type { Transaction as DbTransaction } from '../shared/types/transaction';
import { useTheme } from '../theme';
import { formatCurrency } from '../utils/formatCurrency';
import type { RootTabParamList } from '../navigation/types';

type ScreenMode = 'list' | 'form' | 'detail';

type GoalViewModel = {
  goal: Goal;
  currentAmount: number;
  progressPercent: number;
  statusLabel: string;
  goalTypeLabel: string;
  deadlineLabel: string;
};

const goalTypeOptions: Array<{ value: GoalType; label: string; helper: string }> = [
  {
    value: 'manual',
    label: 'Valor atual manual',
    helper: 'Você informa o valor atual da meta diretamente.',
  },
  {
    value: 'net_worth',
    label: 'Patrimônio líquido',
    helper: 'O valor atual usa contas + investimentos - faturas em aberto.',
  },
];

function parseMoneyInput(value: string): number {
  const normalized = value.replace(/\./g, '').replace(',', '.').trim();
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : Number.NaN;
}

function formatGoalTypeLabel(type: GoalType): string {
  return goalTypeOptions.find((option) => option.value === type)?.label ?? type;
}

function formatGoalStatus(isActive: boolean | null | undefined): string {
  return isActive === false ? 'Inativa' : 'Ativa';
}

function formatDeadlineLabel(goal: Goal): string {
  if (!goal.created_at) {
    return 'Nao informado';
  }

  const parsed = new Date(goal.created_at);
  if (Number.isNaN(parsed.getTime())) {
    return 'Nao informado';
  }

  return parsed.toLocaleDateString('pt-BR');
}

function buildGoalViewModel(
  goal: Goal,
  accounts: Account[],
  transactions: DbTransaction[],
  investments: Investment[],
  bills: CreditCardBill[],
): GoalViewModel {
  const currentAmount = getGoalCurrentAmount(goal, accounts, transactions, investments, bills);

  return {
    goal,
    currentAmount,
    progressPercent: getGoalProgressPercentUI(goal, currentAmount),
    statusLabel: formatGoalStatus(goal.is_active),
    goalTypeLabel: formatGoalTypeLabel(getGoalType(goal)),
    deadlineLabel: formatDeadlineLabel(goal),
  };
}

export function GoalsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { refreshKey, notifyTransactionsChanged } = useTransactionsSync();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const route = useRoute<RouteProp<RootTabParamList, 'Goals'>>();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [bills, setBills] = useState<CreditCardBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mode, setMode] = useState<ScreenMode>('list');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('manual');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [isActive, setIsActive] = useState(true);

  const selectedGoal = useMemo(
    () => goals.find((goal) => goal.id === selectedGoalId) ?? null,
    [goals, selectedGoalId],
  );

  const goalCards = useMemo(
    () =>
      goals.map((goal) =>
        buildGoalViewModel(goal, accounts, transactions, investments, bills),
      ),
    [accounts, bills, goals, investments, transactions],
  );

  const selectedGoalView = useMemo(() => {
    if (!selectedGoal) return null;
    return buildGoalViewModel(selectedGoal, accounts, transactions, investments, bills);
  }, [accounts, bills, investments, selectedGoal, transactions]);

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
          setError('Supabase nao configurado.');
          setGoals([]);
          setAccounts([]);
          setTransactions([]);
          setInvestments([]);
          setBills([]);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError(null);
      }

      const [goalsRes, accountsRes, transactionsRes, investmentsRes, billsRes] =
        await Promise.all([
          fetchGoalsForUser(client, user.id),
          fetchAccountsForUser(client, user.id),
          fetchTransactionsForUser(client, user.id),
          fetchInvestmentsForUser(client, user.id),
          fetchBillsForUser(client, user.id),
        ]);

      if (cancelled) {
        return;
      }

      if (goalsRes.error) {
        setError(goalsRes.error.message);
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

      setGoals(goalsRes.data);
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

  useEffect(() => {
    if (goalType === 'net_worth') {
      setCurrentAmount('');
    }
  }, [goalType]);

  async function handleSave() {
    if (!user?.id) {
      setError('Usuario nao autenticado.');
      return;
    }

    const client = getSupabaseMobileClient();
    if (!client) {
      setError('Supabase nao configurado.');
      return;
    }

    const parsedTarget = parseMoneyInput(targetAmount);
    const parsedCurrent = goalType === 'net_worth' ? 0 : parseMoneyInput(currentAmount);

    if (!name.trim()) {
      setError('Informe o nome da meta.');
      return;
    }

    if (!Number.isFinite(parsedTarget) || parsedTarget <= 0) {
      setError('Informe um valor alvo valido.');
      return;
    }

    if (goalType === 'manual' && (!Number.isFinite(parsedCurrent) || parsedCurrent < 0)) {
      setError('Informe um valor atual valido.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    if (editingGoalId) {
      const { error: updateError } = await updateGoalRow(client, user.id, editingGoalId, {
        name: name.trim(),
        target_amount: parsedTarget,
        current_amount: parsedCurrent,
        goal_type: goalType,
        is_active: isActive,
      });

      setSaving(false);

      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await insertGoal(client, user.id, {
        user_id: user.id,
        name: name.trim(),
        target_amount: parsedTarget,
        current_amount: parsedCurrent,
        goal_type: goalType,
        color: null,
        is_active: isActive,
        created_at: new Date().toISOString(),
      });

      setSaving(false);

      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    const savedEditing = editingGoalId;
    closeForm(savedEditing ?? undefined);
    setSuccessMessage(
      savedEditing ? 'Meta atualizada com sucesso.' : 'Meta criada com sucesso.',
    );
    notifyTransactionsChanged();
  }

  function openCreateForm() {
    setEditingGoalId(null);
    setName('');
    setGoalType('manual');
    setTargetAmount('');
    setCurrentAmount('');
    setIsActive(true);
    setError(null);
    setSuccessMessage(null);
    setMode('form');
  }

  function openEditForm(goal: Goal) {
    setEditingGoalId(goal.id);
    setName(goal.name);
    setGoalType(getGoalType(goal));
    setTargetAmount(String(goal.target_amount).replace('.', ','));
    setCurrentAmount(String(goal.current_amount).replace('.', ','));
    setIsActive(goal.is_active !== false);
    setError(null);
    setSuccessMessage(null);
    setMode('form');
  }

  function openDetail(goal: Goal) {
    setSelectedGoalId(goal.id);
    setError(null);
    setSuccessMessage(null);
    setMode('detail');
  }

  function closeDetail() {
    setSelectedGoalId(null);
    setMode('list');
  }

  function closeForm(focusGoalId?: string) {
    setEditingGoalId(null);
    setName('');
    setGoalType('manual');
    setTargetAmount('');
    setCurrentAmount('');
    setIsActive(true);

    if (focusGoalId) {
      setSelectedGoalId(focusGoalId);
      setMode('detail');
      return;
    }

    setMode(selectedGoalId ? 'detail' : 'list');
  }

  function confirmDelete(goal: Goal) {
    Alert.alert(
      'Excluir meta',
      'Tem certeza que deseja excluir esta meta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void handleDelete(goal);
          },
        },
      ],
    );
  }

  async function handleDelete(goal: Goal) {
    if (!user?.id) {
      setError('Usuario nao autenticado.');
      return;
    }

    const client = getSupabaseMobileClient();
    if (!client) {
      setError('Supabase nao configurado.');
      return;
    }

    setDeletingId(goal.id);
    setError(null);
    setSuccessMessage(null);

    const { error: deleteError } = await deleteGoalRow(client, user.id, goal.id);

    setDeletingId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (selectedGoalId === goal.id) {
      closeDetail();
    }

    if (editingGoalId === goal.id) {
      closeForm();
    }

    setSuccessMessage('Meta excluida com sucesso.');
    notifyTransactionsChanged();
  }

  const screenTitle =
    mode === 'form' && editingGoalId
      ? 'Editar meta'
      : mode === 'detail'
        ? 'Detalhe da meta'
        : 'Metas';
  const isCreateSheetOpen = mode === 'form' && editingGoalId === null;
  const isEditScreen = mode === 'form' && editingGoalId !== null;

  const isManualGoal = goalType === 'manual';

  if (loading) {
    return (
      <AppScreen scroll>
        <AppText variant="bodySmall" color="secondary">
          Carregando metas...
        </AppText>
      </AppScreen>
    );
  }

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

      {error ? (
        <AppText variant="bodySmall" color="danger" style={{ marginBottom: theme.spacing.md }}>
          {error}
        </AppText>
      ) : null}

        {mode === 'list' || isCreateSheetOpen ? (
        <View style={styles.stack}>
          {goalCards.length === 0 ? (
            <AppCard>
              <AppText variant="bodySmall" color="secondary">
                Nenhuma meta cadastrada.
              </AppText>
            </AppCard>
          ) : (
            goalCards.map(({ goal, currentAmount, progressPercent, statusLabel }) => (
              <AppCard key={goal.id}>
                <Pressable onPress={() => openDetail(goal)} style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <AppText variant="title3">{goal.name}</AppText>
                      <AppText
                        variant="caption"
                        color="secondary"
                        style={{ marginTop: theme.spacing.xs }}
                      >
                        {formatGoalTypeLabel(getGoalType(goal))} · {statusLabel}
                      </AppText>
                    </View>
                    <AppText variant="label" color="accent">
                      {progressPercent.toFixed(0)}%
                    </AppText>
                  </View>

                  <View style={{ marginTop: theme.spacing.md }}>
                    <AppText variant="bodySmall" color="secondary">
                      Valor alvo
                    </AppText>
                    <AppText variant="title3" style={{ marginTop: theme.spacing.xs }}>
                      {formatCurrency(goal.target_amount)}
                    </AppText>
                  </View>

                  <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                      <AppText variant="caption" color="secondary">
                        Valor atual
                      </AppText>
                      <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
                        {formatCurrency(currentAmount)}
                      </AppText>
                    </View>
                    <View style={styles.metricItem}>
                      <AppText variant="caption" color="secondary">
                        Status
                      </AppText>
                      <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
                        {statusLabel}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                          backgroundColor: theme.colors.accent,
                        },
                      ]}
                    />
                  </View>
                </Pressable>

                <View style={styles.actionsRow}>
                  <AppButton title="Ver detalhe" variant="secondary" onPress={() => openDetail(goal)} />
                  <AppButton title="Editar" variant="ghost" onPress={() => openEditForm(goal)} />
                </View>

                <AppButton
                  title={deletingId === goal.id ? 'Excluindo...' : 'Excluir'}
                  variant="ghost"
                  loading={deletingId === goal.id}
                  onPress={() => confirmDelete(goal)}
                  disabled={deletingId !== null}
                />
              </AppCard>
            ))
          )}
        </View>
        ) : null}

        {mode === 'detail' ? (
        selectedGoalView ? (
          <View style={styles.stack}>
            <AppCard>
              <View style={styles.detailHeader}>
                <View style={{ flex: 1 }}>
                  <AppText variant="title2">{selectedGoalView.goal.name}</AppText>
                  <AppText
                    variant="bodySmall"
                    color="secondary"
                    style={{ marginTop: theme.spacing.xs }}
                  >
                    {selectedGoalView.goalTypeLabel} · {selectedGoalView.statusLabel}
                  </AppText>
                </View>
                <AppText variant="label" color="accent">
                  {selectedGoalView.progressPercent.toFixed(0)}%
                </AppText>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, Math.max(0, selectedGoalView.progressPercent))}%`,
                      backgroundColor: theme.colors.accent,
                    },
                  ]}
                />
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.detailItem}>
                  <AppText variant="caption" color="secondary">
                    Valor alvo
                  </AppText>
                  <AppText variant="title3" style={{ marginTop: theme.spacing.xs }}>
                    {formatCurrency(selectedGoalView.goal.target_amount)}
                  </AppText>
                </View>

                <View style={styles.detailItem}>
                  <AppText variant="caption" color="secondary">
                    Valor atual
                  </AppText>
                  <AppText variant="title3" style={{ marginTop: theme.spacing.xs }}>
                    {formatCurrency(selectedGoalView.currentAmount)}
                  </AppText>
                </View>

                <View style={styles.detailItem}>
                  <AppText variant="caption" color="secondary">
                    Progresso
                  </AppText>
                  <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
                    {selectedGoalView.progressPercent.toFixed(0)}%
                  </AppText>
                </View>

                <View style={styles.detailItem}>
                  <AppText variant="caption" color="secondary">
                    Prazo
                  </AppText>
                  <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
                    {selectedGoalView.deadlineLabel}
                  </AppText>
                </View>
              </View>

              {getGoalType(selectedGoalView.goal) === 'net_worth' ? (
                <AppText
                  variant="caption"
                  color="secondary"
                  style={{ marginTop: theme.spacing.md }}
                >
                  O valor atual desta meta acompanha o patrimonio liquido calculado em tempo real.
                </AppText>
              ) : null}
            </AppCard>

            <View style={styles.actionsRow}>
              <AppButton title="Voltar" variant="secondary" onPress={closeDetail} fullWidth />
              <AppButton
                title="Editar meta"
                onPress={() => openEditForm(selectedGoalView.goal)}
                fullWidth
              />
            </View>

            <AppButton
              title={deletingId === selectedGoalView.goal.id ? 'Excluindo...' : 'Excluir meta'}
              variant="ghost"
              loading={deletingId === selectedGoalView.goal.id}
              onPress={() => confirmDelete(selectedGoalView.goal)}
              disabled={deletingId !== null}
              fullWidth
            />
          </View>
        ) : (
          <AppCard>
            <AppText variant="bodySmall" color="secondary">
              Meta nao encontrada.
            </AppText>
            <View style={{ marginTop: theme.spacing.md }}>
              <AppButton title="Voltar para metas" variant="secondary" onPress={closeDetail} fullWidth />
            </View>
          </AppCard>
        )
        ) : null}

        {isEditScreen ? (
        <View style={styles.stack}>
          <AppCard>
            <View style={styles.stack}>
              <View>
                <AppText variant="label">Tipo de meta</AppText>
                <AppText
                  variant="caption"
                  color="secondary"
                  style={{ marginTop: theme.spacing.xs }}
                >
                  Escolha como o valor atual sera calculado.
                </AppText>
              </View>

              <View style={styles.stack}>
                {goalTypeOptions.map((option) => {
                  const selected = goalType === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setGoalType(option.value)}
                      style={[
                        styles.optionCard,
                        {
                          borderColor: selected ? theme.colors.accent : theme.colors.border,
                          backgroundColor: selected
                            ? theme.colors.surface
                            : theme.colors.surfaceElevated,
                        },
                      ]}
                    >
                      <AppText variant="body" style={{ color: theme.colors.textPrimary }}>
                        {option.label}
                      </AppText>
                      <AppText
                        variant="caption"
                        color="secondary"
                        style={{ marginTop: theme.spacing.xs }}
                      >
                        {option.helper}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>

              <AppInput
                label="Nome"
                placeholder="Ex: Reserva de emergencia"
                value={name}
                onChangeText={setName}
                autoCapitalize="sentences"
              />

              <AppInput
                label="Valor alvo"
                placeholder="0,00"
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="decimal-pad"
              />

              {isManualGoal ? (
                <AppInput
                  label="Valor atual"
                  placeholder="0,00"
                  value={currentAmount}
                  onChangeText={setCurrentAmount}
                  keyboardType="decimal-pad"
                />
              ) : (
                <AppCard
                  style={{
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.surface,
                  }}
                >
                  <AppText variant="caption" color="secondary">
                    Esta meta usa o patrimonio liquido atual. O valor e calculado automaticamente
                    pela camada compartilhada.
                  </AppText>
                </AppCard>
              )}

              <View>
                <AppText variant="label">Status</AppText>
                <AppText
                  variant="caption"
                  color="secondary"
                  style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.sm }}
                >
                  Controle se a meta continua ativa na lista principal.
                </AppText>
                <View style={styles.statusRow}>
                  <AppButton
                    title="Ativa"
                    variant={isActive ? 'primary' : 'secondary'}
                    onPress={() => setIsActive(true)}
                    fullWidth
                  />
                  <AppButton
                    title="Inativa"
                    variant={!isActive ? 'primary' : 'secondary'}
                    onPress={() => setIsActive(false)}
                    fullWidth
                  />
                </View>
              </View>

              <AppText variant="caption" color="secondary">
                Prazo nao possui campo proprio no modelo atual da meta. O app permanece alinhado a
                mesma base real da web.
              </AppText>
            </View>
          </AppCard>

          <View style={styles.actionsRow}>
            <AppButton title="Cancelar" variant="secondary" onPress={() => closeForm()} fullWidth />
            <AppButton
              title={saving ? 'Salvando...' : editingGoalId ? 'Salvar edicao' : 'Salvar meta'}
              onPress={() => void handleSave()}
              loading={saving}
              disabled={saving}
              fullWidth
            />
          </View>
        </View>
        ) : null}
      </AppScreen>

      {mode === 'list' || isCreateSheetOpen ? (
        <FloatingActionButton
          accessibilityLabel="Criar nova meta"
          onPress={openCreateForm}
        />
      ) : null}

      <FormBottomSheet
        visible={isCreateSheetOpen}
        title="Nova meta"
        subtitle="Crie uma meta sem sair da lista."
        onClose={() => closeForm()}
        footer={
          <View style={styles.actionsRow}>
            <AppButton title="Cancelar" variant="secondary" onPress={() => closeForm()} fullWidth />
            <AppButton
              title={saving ? 'Salvando...' : 'Salvar meta'}
              onPress={() => void handleSave()}
              loading={saving}
              disabled={saving}
              fullWidth
            />
          </View>
        }
      >
        <View style={styles.stack}>
          <View>
            <AppText variant="label">Tipo de meta</AppText>
            <AppText
              variant="caption"
              color="secondary"
              style={{ marginTop: theme.spacing.xs }}
            >
              Escolha como o valor atual sera calculado.
            </AppText>
          </View>

          <View style={styles.stack}>
            {goalTypeOptions.map((option) => {
              const selected = goalType === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setGoalType(option.value)}
                  style={[
                    styles.optionCard,
                    {
                      borderColor: selected ? theme.colors.accent : theme.colors.border,
                      backgroundColor: selected
                        ? theme.colors.surface
                        : theme.colors.surfaceElevated,
                    },
                  ]}
                >
                  <AppText variant="body" style={{ color: theme.colors.textPrimary }}>
                    {option.label}
                  </AppText>
                  <AppText
                    variant="caption"
                    color="secondary"
                    style={{ marginTop: theme.spacing.xs }}
                  >
                    {option.helper}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppInput
            label="Nome"
            placeholder="Ex: Reserva de emergencia"
            value={name}
            onChangeText={setName}
            autoCapitalize="sentences"
          />

          <AppInput
            label="Valor alvo"
            placeholder="0,00"
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="decimal-pad"
          />

          {isManualGoal ? (
            <AppInput
              label="Valor atual"
              placeholder="0,00"
              value={currentAmount}
              onChangeText={setCurrentAmount}
              keyboardType="decimal-pad"
            />
          ) : (
            <AppCard
              style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.surface,
              }}
            >
              <AppText variant="caption" color="secondary">
                Esta meta usa o patrimonio liquido atual. O valor e calculado automaticamente
                pela camada compartilhada.
              </AppText>
            </AppCard>
          )}

          <View>
            <AppText variant="label">Status</AppText>
            <AppText
              variant="caption"
              color="secondary"
              style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.sm }}
            >
              Controle se a meta continua ativa na lista principal.
            </AppText>
            <View style={styles.statusRow}>
              <AppButton
                title="Ativa"
                variant={isActive ? 'primary' : 'secondary'}
                onPress={() => setIsActive(true)}
                fullWidth
              />
              <AppButton
                title="Inativa"
                variant={!isActive ? 'primary' : 'secondary'}
                onPress={() => setIsActive(false)}
                fullWidth
              />
            </View>
          </View>

          <AppText variant="caption" color="secondary">
            Prazo nao possui campo proprio no modelo atual da meta. O app permanece alinhado a
            mesma base real da web.
          </AppText>
        </View>
      </FormBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
  cardContent: {
    gap: 12,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricItem: {
    flex: 1,
    minWidth: 120,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  progressTrack: {
    borderRadius: 999,
    height: 10,
    marginTop: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  detailHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
  },
  detailItem: {
    minWidth: 132,
    flex: 1,
  },
  optionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
