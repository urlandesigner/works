import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppCard, AppHeader, AppInput, AppScreen, AppText, FloatingActionButton, FormBottomSheet } from '../components';
import { useAuth } from '../features/auth';
import { useTransactionsSync } from '../features/transactions';
import { getSupabaseMobileClient } from '../lib/supabase/client';
import { fetchAccountsForUser } from '../shared/supabase/accountsRepo';
import { fetchCategoriesForUser } from '../shared/supabase/categoriesRepo';
import { fetchCreditCardsForUser } from '../shared/supabase/creditCardsRepo';
import {
  deleteSubscriptionRow,
  fetchSubscriptionsForUser,
  insertSubscription,
  updateSubscriptionRow,
} from '../shared/supabase/subscriptionsRepo';
import type { Account } from '../shared/types/account';
import type { Category } from '../shared/types/category';
import type { CreditCard } from '../shared/types/credit-card';
import type {
  Subscription,
  SubscriptionPeriodicity,
  SubscriptionStatus,
} from '../shared/types/subscription';
import { useTheme } from '../theme';
import { formatCurrency } from '../utils/formatCurrency';

type ScreenMode = 'list' | 'form' | 'detail';

const periodicityOptions: Array<{ value: SubscriptionPeriodicity; label: string }> = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'annual', label: 'Anual' },
];

const statusOptions: Array<{ value: SubscriptionStatus; label: string }> = [
  { value: 'active', label: 'Ativa' },
  { value: 'inactive', label: 'Inativa' },
];

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

function parseMoneyInput(value: string): number {
  const normalized = value.replace(/\./g, '').replace(',', '.').trim();
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : Number.NaN;
}

function formatSubscriptionStatus(status: SubscriptionStatus): string {
  return status === 'active' ? 'Ativa' : 'Inativa';
}

function formatSubscriptionPeriodicity(periodicity: SubscriptionPeriodicity | undefined): string {
  return periodicity === 'annual' ? 'Anual' : 'Mensal';
}

function getMonthlyEquivalent(subscription: Subscription): number {
  return subscription.periodicity === 'annual'
    ? subscription.monthly_amount / 12
    : subscription.monthly_amount;
}

function getAnnualEquivalent(subscription: Subscription): number {
  return subscription.periodicity === 'annual'
    ? subscription.monthly_amount
    : subscription.monthly_amount * 12;
}

function getNextBillingLabel(subscription: Subscription): string {
  if ((subscription.periodicity ?? 'monthly') === 'annual') {
    const month = subscription.billing_month ?? null;
    if (!month) {
      return `Dia ${subscription.billing_day}`;
    }
    return `${subscription.billing_day} de ${MONTH_LABELS[month - 1] ?? `Mes ${month}`}`;
  }

  return `Todo dia ${subscription.billing_day}`;
}

function formatPaymentSuggestionFromAccount(account: Account): string {
  return account.institution?.trim()
    ? `${account.name} - ${account.institution}`
    : account.name;
}

function formatPaymentSuggestionFromCard(card: CreditCard): string {
  return `${card.name} - ${card.brand} final ${card.lastFourDigits}`;
}

export function SubscriptionsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { refreshKey, notifyTransactionsChanged } = useTransactionsSync();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mode, setMode] = useState<ScreenMode>('list');
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [editingSubscriptionId, setEditingSubscriptionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [periodicity, setPeriodicity] = useState<SubscriptionPeriodicity>('monthly');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [billingDay, setBillingDay] = useState('');
  const [billingMonth, setBillingMonth] = useState('');
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [notes, setNotes] = useState('');

  const selectedSubscription = useMemo(
    () => subscriptions.find((subscription) => subscription.id === selectedSubscriptionId) ?? null,
    [selectedSubscriptionId, subscriptions],
  );

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((subscription) => subscription.status === 'active'),
    [subscriptions],
  );

  const activeMonthlyTotal = useMemo(
    () => activeSubscriptions.reduce((sum, subscription) => sum + getMonthlyEquivalent(subscription), 0),
    [activeSubscriptions],
  );

  const activeAnnualTotal = useMemo(
    () => activeSubscriptions.reduce((sum, subscription) => sum + getAnnualEquivalent(subscription), 0),
    [activeSubscriptions],
  );

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === 'expense'),
    [categories],
  );

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

      const [subscriptionsRes, accountsRes, cardsRes, categoriesRes] = await Promise.all([
        fetchSubscriptionsForUser(client, user.id),
        fetchAccountsForUser(client, user.id),
        fetchCreditCardsForUser(client, user.id),
        fetchCategoriesForUser(client, user.id),
      ]);

      if (cancelled) {
        return;
      }

      if (subscriptionsRes.error) {
        setError(subscriptionsRes.error.message);
        setLoading(false);
        return;
      }

      if (accountsRes.error) {
        setError(accountsRes.error.message);
        setLoading(false);
        return;
      }

      if (cardsRes.error) {
        setError(cardsRes.error.message);
        setLoading(false);
        return;
      }

      if (categoriesRes.error) {
        setError(categoriesRes.error.message);
        setLoading(false);
        return;
      }

      setSubscriptions(subscriptionsRes.data);
      setAccounts(accountsRes.data);
      setCards(cardsRes.data);
      setCategories(categoriesRes.data);
      setLoading(false);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, user?.id]);

  useEffect(() => {
    if (periodicity === 'monthly') {
      setBillingMonth('');
    }
  }, [periodicity]);

  function openCreateForm() {
    setEditingSubscriptionId(null);
    setName('');
    setAmount('');
    setPeriodicity('monthly');
    setPaymentMethod('');
    setBillingDay('');
    setBillingMonth('');
    setStatus('active');
    setNotes('');
    setError(null);
    setSuccessMessage(null);
    setMode('form');
  }

  function openEditForm(subscription: Subscription) {
    setEditingSubscriptionId(subscription.id);
    setName(subscription.name);
    setAmount(String(subscription.monthly_amount).replace('.', ','));
    setPeriodicity(subscription.periodicity ?? 'monthly');
    setPaymentMethod(subscription.payment_method ?? '');
    setBillingDay(String(subscription.billing_day));
    setBillingMonth(subscription.billing_month ? String(subscription.billing_month) : '');
    setStatus(subscription.status);
    setNotes(subscription.notes ?? '');
    setError(null);
    setSuccessMessage(null);
    setMode('form');
  }

  function openDetail(subscription: Subscription) {
    setSelectedSubscriptionId(subscription.id);
    setError(null);
    setSuccessMessage(null);
    setMode('detail');
  }

  function closeDetail() {
    setSelectedSubscriptionId(null);
    setMode('list');
  }

  function closeForm() {
    setEditingSubscriptionId(null);
    setName('');
    setAmount('');
    setPeriodicity('monthly');
    setPaymentMethod('');
    setBillingDay('');
    setBillingMonth('');
    setStatus('active');
    setNotes('');
    setMode(selectedSubscriptionId ? 'detail' : 'list');
  }

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

    const parsedAmount = parseMoneyInput(amount);
    const parsedBillingDay = Number.parseInt(billingDay, 10);
    const parsedBillingMonth =
      periodicity === 'annual' ? Number.parseInt(billingMonth, 10) : null;

    if (!name.trim()) {
      setError('Informe o nome da assinatura.');
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setError('Informe um valor valido.');
      return;
    }

    if (!Number.isInteger(parsedBillingDay) || parsedBillingDay < 1 || parsedBillingDay > 31) {
      setError('Informe um dia de cobranca entre 1 e 31.');
      return;
    }

    if (periodicity === 'annual') {
      if (
        parsedBillingMonth === null ||
        !Number.isInteger(parsedBillingMonth) ||
        parsedBillingMonth < 1 ||
        parsedBillingMonth > 12
      ) {
        setError('Informe um mes de cobranca valido.');
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const payload = {
      user_id: user.id,
      name: name.trim(),
      monthly_amount: parsedAmount,
      periodicity,
      payment_method: paymentMethod.trim() || null,
      billing_day: parsedBillingDay,
      billing_month: periodicity === 'annual' ? (parsedBillingMonth as number) : null,
      status,
      notes: notes.trim() || null,
      created_at: new Date().toISOString(),
    };

    if (editingSubscriptionId) {
      const { error: updateError } = await updateSubscriptionRow(
        client,
        user.id,
        editingSubscriptionId,
        {
          name: payload.name,
          monthly_amount: payload.monthly_amount,
          periodicity: payload.periodicity,
          payment_method: payload.payment_method,
          billing_day: payload.billing_day,
          billing_month: payload.billing_month,
          status: payload.status,
          notes: payload.notes,
        },
      );

      setSaving(false);

      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await insertSubscription(client, user.id, payload);

      setSaving(false);

      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    const wasEditing = editingSubscriptionId;
    closeForm();
    setSuccessMessage(
      wasEditing
        ? 'Assinatura atualizada com sucesso.'
        : 'Assinatura criada com sucesso.',
    );
    notifyTransactionsChanged();
  }

  function confirmDelete(subscription: Subscription) {
    Alert.alert(
      'Excluir assinatura',
      'Tem certeza que deseja excluir esta assinatura?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void handleDelete(subscription);
          },
        },
      ],
    );
  }

  async function handleDelete(subscription: Subscription) {
    if (!user?.id) {
      setError('Usuario nao autenticado.');
      return;
    }

    const client = getSupabaseMobileClient();
    if (!client) {
      setError('Supabase nao configurado.');
      return;
    }

    setDeletingId(subscription.id);
    setError(null);
    setSuccessMessage(null);

    const { error: deleteError } = await deleteSubscriptionRow(client, user.id, subscription.id);

    setDeletingId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (selectedSubscriptionId === subscription.id) {
      closeDetail();
    }

    if (editingSubscriptionId === subscription.id) {
      closeForm();
    }

    setSuccessMessage('Assinatura excluida com sucesso.');
    notifyTransactionsChanged();
  }

  const screenTitle =
    mode === 'form'
      ? editingSubscriptionId
        ? 'Editar assinatura'
        : 'Nova assinatura'
      : mode === 'detail'
        ? 'Detalhe da assinatura'
        : 'Assinaturas';

  if (loading) {
    return (
      <AppScreen scroll>
        <AppText variant="bodySmall" color="secondary">
          Carregando assinaturas...
        </AppText>
      </AppScreen>
    );
  }

  if (error && subscriptions.length === 0 && mode === 'list') {
    return (
      <AppScreen scroll>
        <AppHeader title="Assinaturas" />
        <AppText variant="bodySmall" color="danger">
          {error}
        </AppText>
      </AppScreen>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppScreen
        scroll
      >
      <AppHeader title={mode === 'form' && editingSubscriptionId ? screenTitle : mode === 'detail' ? screenTitle : 'Assinaturas'} />

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

        {mode === 'list' || (mode === 'form' && editingSubscriptionId === null) ? (
        <View style={styles.stack}>
          {subscriptions.length > 0 ? (
            <View style={styles.metricsRow}>
              <AppCard style={styles.metricCard}>
                <AppText variant="caption" color="secondary">
                  Total mensal
                </AppText>
                <AppText variant="title3" style={{ marginTop: theme.spacing.xs }}>
                  {formatCurrency(activeMonthlyTotal)}
                </AppText>
                <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.xs }}>
                  Apenas assinaturas ativas
                </AppText>
              </AppCard>

              <AppCard style={styles.metricCard}>
                <AppText variant="caption" color="secondary">
                  Total anual
                </AppText>
                <AppText variant="title3" style={{ marginTop: theme.spacing.xs }}>
                  {formatCurrency(activeAnnualTotal)}
                </AppText>
                <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.xs }}>
                  Equivalente no ano
                </AppText>
              </AppCard>
            </View>
          ) : null}

          {subscriptions.length === 0 ? (
            <AppCard>
              <AppText variant="bodySmall" color="secondary">
                Nenhuma assinatura cadastrada.
              </AppText>
            </AppCard>
          ) : (
            subscriptions.map((subscription) => (
              <AppCard key={subscription.id}>
                <Pressable onPress={() => openDetail(subscription)} style={styles.stack}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
                      <AppText variant="title3">{subscription.name}</AppText>
                      <AppText
                        variant="caption"
                        color="secondary"
                        style={{ marginTop: theme.spacing.xs }}
                      >
                        {formatSubscriptionPeriodicity(subscription.periodicity)} ·{' '}
                        {formatSubscriptionStatus(subscription.status)}
                      </AppText>
                    </View>
                    <AppText variant="title3">
                      {formatCurrency(subscription.monthly_amount)}
                    </AppText>
                  </View>

                  <View style={styles.infoGrid}>
                    <View style={styles.infoCell}>
                      <AppText variant="caption" color="secondary">
                        Categoria
                      </AppText>
                      <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
                        Nao vinculada no modelo atual
                      </AppText>
                    </View>
                    <View style={styles.infoCell}>
                      <AppText variant="caption" color="secondary">
                        Proxima cobranca
                      </AppText>
                      <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
                        {getNextBillingLabel(subscription)}
                      </AppText>
                    </View>
                    <View style={styles.infoCell}>
                      <AppText variant="caption" color="secondary">
                        Pagamento
                      </AppText>
                      <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
                        {subscription.payment_method ?? 'Nao informado'}
                      </AppText>
                    </View>
                  </View>
                </Pressable>

                <View style={styles.actionsRow}>
                  <AppButton
                    title="Ver detalhe"
                    variant="secondary"
                    onPress={() => openDetail(subscription)}
                    fullWidth
                  />
                  <AppButton
                    title="Editar"
                    variant="ghost"
                    onPress={() => openEditForm(subscription)}
                    fullWidth
                  />
                </View>
              </AppCard>
            ))
          )}
        </View>
        ) : null}

        {mode === 'detail' ? (
        selectedSubscription ? (
          <View style={styles.stack}>
            <AppCard>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
                  <AppText variant="title2">{selectedSubscription.name}</AppText>
                  <AppText
                    variant="caption"
                    color="secondary"
                    style={{ marginTop: theme.spacing.xs }}
                  >
                    {formatSubscriptionPeriodicity(selectedSubscription.periodicity)} ·{' '}
                    {formatSubscriptionStatus(selectedSubscription.status)}
                  </AppText>
                </View>
                <AppText variant="title3">
                  {formatCurrency(selectedSubscription.monthly_amount)}
                </AppText>
              </View>

              <View style={[styles.infoGrid, { marginTop: theme.spacing.lg }]}>
                <View style={styles.infoCell}>
                  <AppText variant="caption" color="secondary">
                    Recorrencia
                  </AppText>
                  <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
                    {formatSubscriptionPeriodicity(selectedSubscription.periodicity)}
                  </AppText>
                </View>

                <View style={styles.infoCell}>
                  <AppText variant="caption" color="secondary">
                    Cobranca
                  </AppText>
                  <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
                    {getNextBillingLabel(selectedSubscription)}
                  </AppText>
                </View>

                <View style={styles.infoCell}>
                  <AppText variant="caption" color="secondary">
                    Conta ou cartao
                  </AppText>
                  <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
                    {selectedSubscription.payment_method ?? 'Nao informado'}
                  </AppText>
                </View>

                <View style={styles.infoCell}>
                  <AppText variant="caption" color="secondary">
                    Categoria
                  </AppText>
                  <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
                    Nao vinculada no schema atual
                  </AppText>
                </View>

                <View style={styles.infoCell}>
                  <AppText variant="caption" color="secondary">
                    Status
                  </AppText>
                  <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
                    {formatSubscriptionStatus(selectedSubscription.status)}
                  </AppText>
                </View>

                <View style={styles.infoCell}>
                  <AppText variant="caption" color="secondary">
                    Descricao
                  </AppText>
                  <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
                    {selectedSubscription.notes ?? 'Sem descricao'}
                  </AppText>
                </View>
              </View>
            </AppCard>

            <View style={styles.actionsRow}>
              <AppButton title="Voltar" variant="secondary" onPress={closeDetail} fullWidth />
              <AppButton
                title="Editar assinatura"
                onPress={() => openEditForm(selectedSubscription)}
                fullWidth
              />
            </View>

            <AppButton
              title={deletingId === selectedSubscription.id ? 'Excluindo...' : 'Excluir assinatura'}
              variant="ghost"
              loading={deletingId === selectedSubscription.id}
              onPress={() => confirmDelete(selectedSubscription)}
              disabled={deletingId !== null}
              fullWidth
            />
          </View>
        ) : (
          <AppCard>
            <AppText variant="bodySmall" color="secondary">
              Assinatura nao encontrada.
            </AppText>
            <View style={{ marginTop: theme.spacing.md }}>
              <AppButton title="Voltar para assinaturas" variant="secondary" onPress={closeDetail} fullWidth />
            </View>
          </AppCard>
        )
        ) : null}

        {mode === 'form' && editingSubscriptionId !== null ? (
        <View style={styles.stack}>
          <AppCard>
            <AppInput
              label="Nome"
              placeholder="Ex: Spotify, YouTube Premium"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              style={{ marginBottom: theme.spacing.md }}
            />

            <AppInput
              label={`Valor (${periodicity === 'annual' ? 'R$/ano' : 'R$/mes'})`}
              placeholder="0,00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={{ marginBottom: theme.spacing.md }}
            />

            <AppText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
              Recorrencia
            </AppText>
            <OptionSelector
              options={periodicityOptions}
              selected={periodicity}
              onSelect={(value) => setPeriodicity(value)}
            />

            <View style={{ marginTop: theme.spacing.xl }}>
              <AppInput
                label="Forma de pagamento"
                placeholder="Ex: Nubank, Debito automatico, Itau"
                value={paymentMethod}
                onChangeText={setPaymentMethod}
                style={{ marginBottom: theme.spacing.sm }}
              />

              {accounts.length > 0 ? (
                <>
                  <AppText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
                    Contas reais
                  </AppText>
                  <View style={styles.chipsRow}>
                    {accounts.slice(0, 4).map((account) => (
                      <Pressable
                        key={account.id}
                        onPress={() => setPaymentMethod(formatPaymentSuggestionFromAccount(account))}
                        style={[
                          styles.suggestionChip,
                          {
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.surface,
                          },
                        ]}
                      >
                        <AppText variant="caption">{account.name}</AppText>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}

              {cards.length > 0 ? (
                <>
                  <AppText
                    variant="caption"
                    color="secondary"
                    style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xs }}
                  >
                    Cartoes reais
                  </AppText>
                  <View style={styles.chipsRow}>
                    {cards.slice(0, 4).map((card) => (
                      <Pressable
                        key={card.id}
                        onPress={() => setPaymentMethod(formatPaymentSuggestionFromCard(card))}
                        style={[
                          styles.suggestionChip,
                          {
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.surface,
                          },
                        ]}
                      >
                        <AppText variant="caption">{card.name}</AppText>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}
            </View>

            <View style={{ marginTop: theme.spacing.xl }}>
              <AppInput
                label="Dia da cobranca"
                placeholder="1 a 31"
                value={billingDay}
                onChangeText={setBillingDay}
                keyboardType="number-pad"
                style={{ marginBottom: theme.spacing.md }}
              />

              {periodicity === 'annual' ? (
                <AppInput
                  label="Mes da cobranca anual"
                  placeholder="1 a 12"
                  value={billingMonth}
                  onChangeText={setBillingMonth}
                  keyboardType="number-pad"
                  style={{ marginBottom: theme.spacing.md }}
                />
              ) : null}
            </View>

            <AppInput
              label="Descricao"
              placeholder="Notas sobre a assinatura"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.md }}
            />

            <AppText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
              Status
            </AppText>
            <OptionSelector
              options={statusOptions}
              selected={status}
              onSelect={(value) => setStatus(value)}
            />

            <View
              style={{
                marginTop: theme.spacing.xl,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.lg,
                backgroundColor: theme.colors.surface,
              }}
            >
              <AppText variant="caption" color="secondary">
                Categoria
              </AppText>
              <AppText variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.xs }}>
                O modelo atual de assinatura nao possui categoria persistida. As categorias reais do
                usuario continuam disponiveis para futura evolucao.
              </AppText>
              {expenseCategories.length > 0 ? (
                <View style={[styles.chipsRow, { marginTop: theme.spacing.md }]}>
                  {expenseCategories.slice(0, 5).map((category) => (
                    <View
                      key={category.id}
                      style={[
                        styles.suggestionChip,
                        {
                          borderColor: theme.colors.border,
                          backgroundColor: theme.colors.surfaceElevated,
                        },
                      ]}
                    >
                      <AppText variant="caption">{category.name}</AppText>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </AppCard>

          <View style={styles.actionsRow}>
            <AppButton title="Cancelar" variant="secondary" onPress={closeForm} fullWidth />
            <AppButton
              title={saving ? 'Salvando...' : editingSubscriptionId ? 'Salvar edicao' : 'Salvar assinatura'}
              onPress={() => void handleSave()}
              loading={saving}
              disabled={saving}
              fullWidth
            />
          </View>
        </View>
        ) : null}
      </AppScreen>

      {mode === 'list' || (mode === 'form' && editingSubscriptionId === null) ? (
        <FloatingActionButton
          accessibilityLabel="Criar nova assinatura"
          onPress={openCreateForm}
        />
      ) : null}

      <FormBottomSheet
        visible={mode === 'form' && editingSubscriptionId === null}
        title="Nova assinatura"
        subtitle="Adicione uma assinatura sem sair da lista."
        onClose={closeForm}
        footer={
          <View style={styles.actionsRow}>
            <AppButton title="Cancelar" variant="secondary" onPress={closeForm} fullWidth />
            <AppButton
              title={saving ? 'Salvando assinatura...' : 'Salvar assinatura'}
              onPress={() => void handleSave()}
              loading={saving}
              disabled={saving}
              fullWidth
            />
          </View>
        }
      >
        <View style={styles.stack}>
          <AppInput
            label="Nome"
            placeholder="Ex: Spotify, YouTube Premium"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label={`Valor (${periodicity === 'annual' ? 'R$/ano' : 'R$/mes'})`}
            placeholder="0,00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
            Recorrencia
          </AppText>
          <OptionSelector
            options={periodicityOptions}
            selected={periodicity}
            onSelect={(value) => setPeriodicity(value)}
          />

          <View style={{ marginTop: theme.spacing.xl }}>
            <AppInput
              label="Forma de pagamento"
              placeholder="Ex: Nubank, Debito automatico, Itau"
              value={paymentMethod}
              onChangeText={setPaymentMethod}
              style={{ marginBottom: theme.spacing.sm }}
            />

            {accounts.length > 0 ? (
              <>
                <AppText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
                  Contas reais
                </AppText>
                <View style={styles.chipsRow}>
                  {accounts.slice(0, 4).map((account) => (
                    <Pressable
                      key={account.id}
                      onPress={() => setPaymentMethod(formatPaymentSuggestionFromAccount(account))}
                      style={[
                        styles.suggestionChip,
                        {
                          borderColor: theme.colors.border,
                          backgroundColor: theme.colors.surface,
                        },
                      ]}
                    >
                      <AppText variant="caption">{account.name}</AppText>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            {cards.length > 0 ? (
              <>
                <AppText
                  variant="caption"
                  color="secondary"
                  style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xs }}
                >
                  Cartoes reais
                </AppText>
                <View style={styles.chipsRow}>
                  {cards.slice(0, 4).map((card) => (
                    <Pressable
                      key={card.id}
                      onPress={() => setPaymentMethod(formatPaymentSuggestionFromCard(card))}
                      style={[
                        styles.suggestionChip,
                        {
                          borderColor: theme.colors.border,
                          backgroundColor: theme.colors.surface,
                        },
                      ]}
                    >
                      <AppText variant="caption">{card.name}</AppText>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
          </View>

          <View style={{ marginTop: theme.spacing.xl }}>
            <AppInput
              label="Dia da cobranca"
              placeholder="1 a 31"
              value={billingDay}
              onChangeText={setBillingDay}
              keyboardType="number-pad"
              style={{ marginBottom: theme.spacing.md }}
            />

            {periodicity === 'annual' ? (
              <AppInput
                label="Mes da cobranca anual"
                placeholder="1 a 12"
                value={billingMonth}
                onChangeText={setBillingMonth}
                keyboardType="number-pad"
                style={{ marginBottom: theme.spacing.md }}
              />
            ) : null}
          </View>

          <AppInput
            label="Descricao"
            placeholder="Notas sobre a assinatura"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.md }}
          />

          <AppText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
            Status
          </AppText>
          <OptionSelector
            options={statusOptions}
            selected={status}
            onSelect={(value) => setStatus(value)}
          />

          <View
            style={{
              marginTop: theme.spacing.xl,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.lg,
              backgroundColor: theme.colors.surface,
            }}
          >
            <AppText variant="caption" color="secondary">
              Categoria
            </AppText>
            <AppText variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.xs }}>
              O modelo atual de assinatura nao possui categoria persistida. As categorias reais do
              usuario continuam disponiveis para futura evolucao.
            </AppText>
          </View>
        </View>
      </FormBottomSheet>
    </View>
  );
}

function OptionSelector<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: Array<{ value: T; label: string }>;
  selected: T;
  onSelect: (value: T) => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.selectorRow}>
      {options.map((option) => {
        const active = selected === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[
              styles.selectorOption,
              {
                borderColor: active ? theme.colors.accent : theme.colors.border,
                backgroundColor: active ? theme.colors.surfaceElevated : theme.colors.surface,
              },
            ]}
          >
            <AppText
              variant="bodySmall"
              style={{ color: active ? theme.colors.accent : theme.colors.textPrimary }}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
  },
  rowBetween: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoCell: {
    minWidth: 140,
    flex: 1,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  selectorOption: {
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
