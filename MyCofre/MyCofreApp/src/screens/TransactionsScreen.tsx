import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { AppButton, AppCard, AppHeader, AppInput, AppScreen, AppText, FloatingActionButton, FormBottomSheet } from '../components';
import { useAuth } from '../features/auth';
import { useTransactionsSync } from '../features/transactions';
import { SectionHeader, TransactionRow } from '../features/home/components';
import { getSupabaseMobileClient } from '../lib/supabase/client';
import { fetchAccountsForUser } from '../shared/supabase/accountsRepo';
import { fetchCategoriesForUser } from '../shared/supabase/categoriesRepo';
import { fetchCreditCardsForUser } from '../shared/supabase/creditCardsRepo';
import {
  deleteTransactionRow,
  fetchTransactionsForUser,
  insertTransaction,
  updateTransactionRow,
} from '../shared/supabase/transactionsRepo';
import type { Account } from '../shared/types/account';
import type { Category } from '../shared/types/category';
import type { CreditCard } from '../shared/types/credit-card';
import type { Transaction as DbTransaction, TransactionType } from '../shared/types/transaction';
import { useTheme } from '../theme';
import type { RootTabParamList } from '../navigation/types';

type PaymentMode = 'account' | 'card';

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseAmountInput(value: string): number {
  const normalized = value.replace(/\./g, '').replace(',', '.').trim();
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : Number.NaN;
}

function formatDatePreview(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}

function formatCardLabel(card: CreditCard): string {
  const suffix = card.lastFourDigits ? ` final ${card.lastFourDigits}` : '';
  return `${card.name}${suffix}`;
}

export function TransactionsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { refreshKey, notifyTransactionsChanged } = useTransactionsSync();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const route = useRoute<RouteProp<RootTabParamList, 'Transactions'>>();

  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [categoryNameById, setCategoryNameById] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [cardsError, setCardsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [type, setType] = useState<TransactionType>('expense');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('account');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(getTodayIsoDate());
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [creditCardId, setCreditCardId] = useState('');

  const isEditing = editingTransactionId !== null;
  const isCreateSheetOpen = isCreating && !isEditing;
  const isEditScreen = isCreating && isEditing;

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  );

  const activeAccounts = useMemo(
    () => accounts.filter((account) => account.status !== 'closed'),
    [accounts],
  );

  const accountNameById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name] as const)),
    [accounts],
  );

  const activeCards = useMemo(
    () => cards.filter((card) => card.isActive),
    [cards],
  );

  const categoryPreview = useMemo(
    () => filteredCategories.find((category) => category.id === categoryId) ?? null,
    [categoryId, filteredCategories],
  );

  const accountPreview = useMemo(
    () => activeAccounts.find((account) => account.id === accountId) ?? null,
    [accountId, activeAccounts],
  );

  const cardPreview = useMemo(
    () => activeCards.find((card) => card.id === creditCardId) ?? null,
    [creditCardId, activeCards],
  );

  const transactionDatePreview = useMemo(
    () => formatDatePreview(transactionDate),
    [transactionDate],
  );

  useEffect(() => {
    if (categoryId && !filteredCategories.some((category) => category.id === categoryId)) {
      setCategoryId('');
    }
  }, [categoryId, filteredCategories]);

  useEffect(() => {
    if (type === 'income' && paymentMode !== 'account') {
      setPaymentMode('account');
      setCreditCardId('');
    }
  }, [paymentMode, type]);

  useEffect(() => {
    if (paymentMode === 'account') {
      if (creditCardId) setCreditCardId('');
      if (accountId && !activeAccounts.some((account) => account.id === accountId)) {
        setAccountId('');
      }
      return;
    }

    if (accountId) setAccountId('');
    if (creditCardId && !activeCards.some((card) => card.id === creditCardId)) {
      setCreditCardId('');
    }
  }, [accountId, creditCardId, paymentMode, activeAccounts, activeCards]);

  useEffect(() => {
    if (route.params?.openForm) {
      openCreateForm(route.params.initialType ?? 'expense', {
        categoryId: route.params.initialCategoryId,
        accountId: route.params.initialAccountId,
      });
      navigation.setParams({
        openForm: undefined,
        initialType: undefined,
        initialCategoryId: undefined,
        initialAccountId: undefined,
      });
    }
  }, [
    navigation,
    route.params?.initialAccountId,
    route.params?.initialCategoryId,
    route.params?.initialType,
    route.params?.openForm,
  ]);

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
          setCategoriesError('Supabase não configurado.');
          setAccountsError('Supabase não configurado.');
          setCardsError('Supabase não configurado.');
          setTransactions([]);
          setCategories([]);
          setAccounts([]);
          setCards([]);
          setCategoryNameById(new Map());
          setLoading(false);
          setCategoriesLoading(false);
          setAccountsLoading(false);
          setCardsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setCategoriesLoading(true);
        setAccountsLoading(true);
        setCardsLoading(true);
        setError(null);
        setCategoriesError(null);
        setAccountsError(null);
        setCardsError(null);
      }

      const [txRes, catRes, accRes, cardsRes] = await Promise.all([
        fetchTransactionsForUser(client, user.id),
        fetchCategoriesForUser(client, user.id),
        fetchAccountsForUser(client, user.id),
        fetchCreditCardsForUser(client, user.id),
      ]);

      if (cancelled) {
        return;
      }

      if (txRes.error) {
        setError(txRes.error.message);
        setTransactions([]);
      } else {
        setTransactions(txRes.data);
      }
      setLoading(false);

      if (catRes.error) {
        setCategoriesError(catRes.error.message);
        setCategories([]);
        setCategoryNameById(new Map());
      } else {
        setCategories(catRes.data);
        setCategoryNameById(new Map(catRes.data.map((c) => [c.id, c.name] as const)));
      }
      setCategoriesLoading(false);

      if (accRes.error) {
        setAccountsError(accRes.error.message);
        setAccounts([]);
      } else {
        setAccounts(accRes.data);
      }
      setAccountsLoading(false);

      if (cardsRes.error) {
        setCardsError(cardsRes.error.message);
        setCards([]);
      } else {
        setCards(cardsRes.data);
      }
      setCardsLoading(false);
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

    const parsedAmount = parseAmountInput(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Informe um valor válido.');
      return;
    }

    if (!categoryId) {
      setError('Selecione uma categoria.');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(transactionDate)) {
      setError('Informe a data no formato YYYY-MM-DD.');
      return;
    }

    if (paymentMode === 'account' && !accountId) {
      setError('Selecione uma conta.');
      return;
    }

    if (paymentMode === 'card' && !creditCardId) {
      setError('Selecione um cartão.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const accountIdToSave = paymentMode === 'account' ? accountId : null;
    const creditCardIdToSave = paymentMode === 'card' ? creditCardId : null;

    if (isEditing && editingTransactionId) {
      const { error: updateError } = await updateTransactionRow(
        client,
        user.id,
        editingTransactionId,
        {
          account_id: accountIdToSave,
          amount: parsedAmount,
          type,
          category_id: categoryId,
          transaction_date: transactionDate,
          description: description.trim() || null,
          notes: null,
          recurrence: 'none',
          recurring: false,
          credit_card_id: creditCardIdToSave,
          exclude_from_month_expense_summary: false,
        },
      );

      setSaving(false);

      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await insertTransaction(client, user.id, {
        user_id: user.id,
        account_id: accountIdToSave,
        amount: parsedAmount,
        type,
        category_id: categoryId,
        transaction_date: transactionDate,
        description: description.trim() || null,
        notes: null,
        recurrence: 'none',
        recurring: false,
        credit_card_id: creditCardIdToSave,
        exclude_from_month_expense_summary: false,
      });

      setSaving(false);

      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    resetForm();
    setSuccessMessage(
      isEditing ? 'Transação atualizada com sucesso.' : 'Transação salva com sucesso.',
    );
    notifyTransactionsChanged();
  }

  function openCreateForm(
    nextType: TransactionType,
    options?: { categoryId?: string; accountId?: string },
  ) {
    setEditingTransactionId(null);
    setType(nextType);
    setPaymentMode('account');
    setAmount('');
    setDescription('');
    setTransactionDate(getTodayIsoDate());
    setCategoryId(options?.categoryId ?? '');
    setAccountId(options?.accountId ?? '');
    setCreditCardId('');
    setError(null);
    setSuccessMessage(null);
    setIsCreating(true);
  }

  function openEditForm(transaction: DbTransaction) {
    const nextPaymentMode: PaymentMode =
      transaction.type === 'expense' && transaction.credit_card_id ? 'card' : 'account';

    setEditingTransactionId(transaction.id);
    setType(transaction.type);
    setPaymentMode(nextPaymentMode);
    setAmount(String(transaction.amount).replace('.', ','));
    setDescription(transaction.description ?? '');
    setTransactionDate(transaction.transaction_date);
    setCategoryId(transaction.category_id);
    setAccountId(transaction.account_id ?? '');
    setCreditCardId(transaction.credit_card_id ?? '');
    setError(null);
    setSuccessMessage(null);
    setIsCreating(true);
  }

  function closeCreateForm() {
    resetForm();
    setError(null);
  }

  function resetForm() {
    setEditingTransactionId(null);
    setPaymentMode('account');
    setAmount('');
    setDescription('');
    setTransactionDate(getTodayIsoDate());
    setCategoryId('');
    setAccountId('');
    setCreditCardId('');
    setIsCreating(false);
  }

  function confirmDelete(transaction: DbTransaction) {
    Alert.alert(
      'Excluir transação',
      'Tem certeza que deseja excluir esta transação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void handleDelete(transaction);
          },
        },
      ],
    );
  }

  async function handleDelete(transaction: DbTransaction) {
    if (!user?.id) {
      setError('Usuário não autenticado.');
      return;
    }

    const client = getSupabaseMobileClient();
    if (!client) {
      setError('Supabase não configurado.');
      return;
    }

    setDeletingId(transaction.id);
    setError(null);
    setSuccessMessage(null);

    const { error: deleteError } = await deleteTransactionRow(client, user.id, transaction.id);

    setDeletingId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (editingTransactionId === transaction.id) {
      resetForm();
    }

    setSuccessMessage('Transação excluída com sucesso.');
    notifyTransactionsChanged();
  }

  return (
    <View style={{ flex: 1 }}>
      <AppScreen scroll>
        <AppHeader
          title={isEditScreen ? 'Detalhes da transação' : 'Transações'}
          onBackPress={isEditScreen ? closeCreateForm : undefined}
        />

      {successMessage ? <FeedbackBanner tone="success" message={successMessage} /> : null}

      {loading ? (
        <AppText variant="bodySmall" color="secondary">
          Carregando...
        </AppText>
      ) : null}

      {!loading && error ? <FeedbackBanner tone="danger" message={error} /> : null}

      {!loading && isEditScreen ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <AppCard style={[styles.formShell, theme.shadows.md]}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
            >
              <View style={styles.heroBlock}>
                <AppText variant="overline" color="secondary">
                  {isEditing ? 'Revise os detalhes' : 'Novo lançamento'}
                </AppText>
                <AppText variant="title2" style={{ marginTop: theme.spacing.xs }}>
                  {type === 'income' ? 'Registrar entrada' : 'Registrar saída'}
                </AppText>
                <AppText
                  variant="bodySmall"
                  color="secondary"
                  style={{ marginTop: theme.spacing.sm }}
                >
                  Um fluxo mais claro para preencher, revisar e salvar sem atrito.
                </AppText>
              </View>

              <FormSection
                title="Tipo da movimentação"
                helper="Defina se o valor entra ou sai do seu caixa."
              >
                <View style={styles.typeSwitch}>
                  <TypeOption
                    label="Despesa"
                    selected={type === 'expense'}
                    onPress={() => setType('expense')}
                  />
                  <TypeOption
                    label="Receita"
                    selected={type === 'income'}
                    onPress={() => setType('income')}
                  />
                </View>
              </FormSection>

              <FormSection
                title="Detalhes principais"
                helper="Valor em destaque, descrição opcional e data legível."
              >
                <AppInput
                  label="Valor"
                  placeholder="0,00"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                  style={styles.inputSpacing}
                />

                <AppInput
                  label="Descrição opcional"
                  placeholder="Ex.: Mercado, salário, freela"
                  value={description}
                  onChangeText={setDescription}
                  style={styles.inputSpacing}
                />

                <View style={styles.dateCard}>
                  <AppInput
                    label="Data"
                    placeholder="AAAA-MM-DD"
                    autoCapitalize="none"
                    value={transactionDate}
                    onChangeText={setTransactionDate}
                    style={styles.dateInput}
                  />
                  <AppText
                    variant="caption"
                    color={transactionDatePreview ? 'secondary' : 'muted'}
                  >
                    {transactionDatePreview
                      ? `Data selecionada: ${transactionDatePreview}`
                      : 'Use o formato AAAA-MM-DD'}
                  </AppText>
                </View>
              </FormSection>

              <FormSection
                title="Categoria"
                helper="Obrigatória para classificar a transação corretamente."
              >
                {categoryPreview ? (
                  <SelectionSummary label="Selecionada" value={categoryPreview.name} />
                ) : null}
                {categoriesLoading ? (
                  <AppText variant="bodySmall" color="secondary">
                    Carregando categorias...
                  </AppText>
                ) : categoriesError ? (
                  <FeedbackBanner tone="danger" message={categoriesError} compact />
                ) : filteredCategories.length === 0 ? (
                  <AppText variant="bodySmall" color="secondary">
                    Nenhuma categoria disponível para esse tipo.
                  </AppText>
                ) : (
                  <View style={styles.categoryList}>
                    {filteredCategories.map((category) => (
                      <CategoryOption
                        key={category.id}
                        label={category.name}
                        selected={category.id === categoryId}
                        onPress={() => setCategoryId(category.id)}
                      />
                    ))}
                  </View>
                )}
              </FormSection>

              <FormSection
                title={type === 'income' ? 'Conta de entrada' : 'Origem do pagamento'}
                helper={
                  type === 'income'
                    ? 'Receitas entram sempre em uma conta.'
                    : 'Escolha entre conta ou cartão sem mudar a regra atual.'
                }
              >
                {type === 'expense' ? (
                  <View style={styles.typeSwitch}>
                    <TypeOption
                      label="Pagamento por conta"
                      selected={paymentMode === 'account'}
                      onPress={() => setPaymentMode('account')}
                    />
                    <TypeOption
                      label="Pagamento por cartão"
                      selected={paymentMode === 'card'}
                      onPress={() => setPaymentMode('card')}
                    />
                  </View>
                ) : null}

                {paymentMode === 'account' ? (
                  <>
                    {accountPreview ? (
                      <SelectionSummary label="Conta selecionada" value={accountPreview.name} />
                    ) : null}
                    {accountsLoading ? (
                      <AppText variant="bodySmall" color="secondary">
                        Carregando contas...
                      </AppText>
                    ) : accountsError ? (
                      <FeedbackBanner tone="danger" message={accountsError} compact />
                    ) : activeAccounts.length === 0 ? (
                      <AppText variant="bodySmall" color="secondary">
                        Nenhuma conta disponível.
                      </AppText>
                    ) : (
                      <View style={styles.categoryList}>
                        {activeAccounts.map((account) => (
                          <CategoryOption
                            key={account.id}
                            label={account.name}
                            selected={account.id === accountId}
                            onPress={() => setAccountId(account.id)}
                          />
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    {cardPreview ? (
                      <SelectionSummary
                        label="Cartão selecionado"
                        value={formatCardLabel(cardPreview)}
                      />
                    ) : null}
                    {cardsLoading ? (
                      <AppText variant="bodySmall" color="secondary">
                        Carregando cartões...
                      </AppText>
                    ) : cardsError ? (
                      <FeedbackBanner tone="danger" message={cardsError} compact />
                    ) : activeCards.length === 0 ? (
                      <AppText variant="bodySmall" color="secondary">
                        Nenhum cartão disponível.
                      </AppText>
                    ) : (
                      <View style={styles.categoryList}>
                        {activeCards.map((card) => (
                          <CategoryOption
                            key={card.id}
                            label={formatCardLabel(card)}
                            selected={card.id === creditCardId}
                            onPress={() => setCreditCardId(card.id)}
                          />
                        ))}
                      </View>
                    )}
                  </>
                )}
              </FormSection>
            </ScrollView>

            <View
              style={[
                styles.ctaDock,
                {
                  borderTopColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceElevated,
                },
              ]}
            >
              <AppButton
                title={
                  saving
                    ? isEditing
                      ? 'Salvando edição...'
                      : 'Salvando transação...'
                    : isEditing
                      ? 'Salvar edição'
                      : 'Salvar transação'
                }
                onPress={() => void handleSave()}
                loading={saving}
                disabled={saving}
                fullWidth
                style={styles.primaryCta}
              />
              <AppButton
                title="Cancelar"
                variant="secondary"
                onPress={closeCreateForm}
                disabled={saving}
                fullWidth
                style={styles.secondaryCta}
              />
              {isEditing ? (
                <AppButton
                  title={deletingId === editingTransactionId ? 'Excluindo...' : 'Excluir transação'}
                  variant="secondary"
                  onPress={() => {
                    const current = transactions.find((transaction) => transaction.id === editingTransactionId);
                    if (current) {
                      confirmDelete(current);
                    }
                  }}
                  disabled={saving || deletingId === editingTransactionId}
                  fullWidth
                  style={styles.secondaryCta}
                />
              ) : null}
            </View>
          </AppCard>
        </KeyboardAvoidingView>
      ) : null}

        {!loading && !isEditScreen ? (
        <>
          {transactions.length === 0 ? (
            <AppText variant="bodySmall" color="secondary">
              Nenhuma transação
            </AppText>
          ) : (
            <AppCard
              padded={false}
              style={{
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.sm,
                ...theme.shadows.sm,
              }}
            >
              {transactions.map((transaction, index) => (
                <TransactionRow
                  key={transaction.id}
                  onPress={() => openEditForm(transaction)}
                  item={{
                    id: transaction.id,
                    title: transaction.description?.trim() || 'Sem descrição',
                    category: categoryNameById.get(transaction.category_id) ?? 'Categoria',
                    accountLabel: transaction.account_id
                      ? accountNameById.get(transaction.account_id) ?? 'Conta vinculada'
                      : 'Sem conta vinculada',
                    amount: transaction.amount,
                    type: transaction.type,
                    date: transaction.transaction_date,
                  }}
                  isLast={index === transactions.length - 1}
                />
              ))}
            </AppCard>
          )}
        </>
        ) : null}
      </AppScreen>

      {!loading && !isEditScreen ? (
        <FloatingActionButton
          accessibilityLabel="Criar nova transação"
          onPress={() => openCreateForm('expense')}
        />
      ) : null}

      {!loading ? (
        <FormBottomSheet
          visible={isCreateSheetOpen}
          title="Nova transação"
          subtitle="Preencha os campos sem sair da lista."
          onClose={closeCreateForm}
          footer={
            <View style={{ gap: theme.spacing.sm }}>
              <AppButton
                title={saving ? 'Salvando transação...' : 'Salvar transação'}
                onPress={() => void handleSave()}
                loading={saving}
                disabled={saving}
                fullWidth
              />
              <AppButton
                title="Cancelar"
                variant="secondary"
                onPress={closeCreateForm}
                disabled={saving}
                fullWidth
              />
            </View>
          }
        >
          <View style={styles.heroBlock}>
            <AppText variant="overline" color="secondary">
              Novo lançamento
            </AppText>
            <AppText variant="title2" style={{ marginTop: theme.spacing.xs }}>
              {type === 'income' ? 'Registrar entrada' : 'Registrar saída'}
            </AppText>
            <AppText
              variant="bodySmall"
              color="secondary"
              style={{ marginTop: theme.spacing.sm }}
            >
              Um fluxo mais claro para preencher, revisar e salvar sem atrito.
            </AppText>
          </View>

          <FormSection
            title="Tipo da movimentação"
            helper="Defina se o valor entra ou sai do seu caixa."
          >
            <View style={styles.typeSwitch}>
              <TypeOption
                label="Despesa"
                selected={type === 'expense'}
                onPress={() => setType('expense')}
              />
              <TypeOption
                label="Receita"
                selected={type === 'income'}
                onPress={() => setType('income')}
              />
            </View>
          </FormSection>

          <FormSection
            title="Detalhes principais"
            helper="Valor em destaque, descrição opcional e data legível."
          >
            <AppInput
              label="Valor"
              placeholder="0,00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              style={styles.inputSpacing}
            />

            <AppInput
              label="Descrição opcional"
              placeholder="Ex.: Mercado, salário, freela"
              value={description}
              onChangeText={setDescription}
              style={styles.inputSpacing}
            />

            <View style={styles.dateCard}>
              <AppInput
                label="Data"
                placeholder="AAAA-MM-DD"
                autoCapitalize="none"
                value={transactionDate}
                onChangeText={setTransactionDate}
                style={styles.dateInput}
              />
              <AppText
                variant="caption"
                color={transactionDatePreview ? 'secondary' : 'muted'}
              >
                {transactionDatePreview
                  ? `Data selecionada: ${transactionDatePreview}`
                  : 'Use o formato AAAA-MM-DD'}
              </AppText>
            </View>
          </FormSection>

          <FormSection
            title="Categoria"
            helper="Obrigatória para classificar a transação corretamente."
          >
            {categoryPreview ? (
              <SelectionSummary label="Selecionada" value={categoryPreview.name} />
            ) : null}
            {categoriesLoading ? (
              <AppText variant="bodySmall" color="secondary">
                Carregando categorias...
              </AppText>
            ) : categoriesError ? (
              <FeedbackBanner tone="danger" message={categoriesError} compact />
            ) : filteredCategories.length === 0 ? (
              <AppText variant="bodySmall" color="secondary">
                Nenhuma categoria disponível para esse tipo.
              </AppText>
            ) : (
              <View style={styles.categoryList}>
                {filteredCategories.map((category) => (
                  <CategoryOption
                    key={category.id}
                    label={category.name}
                    selected={category.id === categoryId}
                    onPress={() => setCategoryId(category.id)}
                  />
                ))}
              </View>
            )}
          </FormSection>

          <FormSection
            title={type === 'income' ? 'Conta de entrada' : 'Origem do pagamento'}
            helper={
              type === 'income'
                ? 'Receitas entram sempre em uma conta.'
                : 'Escolha entre conta ou cartão sem mudar a regra atual.'
            }
          >
            {type === 'expense' ? (
              <View style={styles.typeSwitch}>
                <TypeOption
                  label="Pagamento por conta"
                  selected={paymentMode === 'account'}
                  onPress={() => setPaymentMode('account')}
                />
                <TypeOption
                  label="Pagamento por cartão"
                  selected={paymentMode === 'card'}
                  onPress={() => setPaymentMode('card')}
                />
              </View>
            ) : null}

            {paymentMode === 'account' ? (
              <>
                {accountPreview ? (
                  <SelectionSummary label="Conta selecionada" value={accountPreview.name} />
                ) : null}
                {accountsLoading ? (
                  <AppText variant="bodySmall" color="secondary">
                    Carregando contas...
                  </AppText>
                ) : accountsError ? (
                  <FeedbackBanner tone="danger" message={accountsError} compact />
                ) : activeAccounts.length === 0 ? (
                  <AppText variant="bodySmall" color="secondary">
                    Nenhuma conta disponível.
                  </AppText>
                ) : (
                  <View style={styles.categoryList}>
                    {activeAccounts.map((account) => (
                      <CategoryOption
                        key={account.id}
                        label={account.name}
                        selected={account.id === accountId}
                        onPress={() => setAccountId(account.id)}
                      />
                    ))}
                  </View>
                )}
              </>
            ) : (
              <>
                {cardPreview ? (
                  <SelectionSummary
                    label="Cartão selecionado"
                    value={formatCardLabel(cardPreview)}
                  />
                ) : null}
                {cardsLoading ? (
                  <AppText variant="bodySmall" color="secondary">
                    Carregando cartões...
                  </AppText>
                ) : cardsError ? (
                  <FeedbackBanner tone="danger" message={cardsError} compact />
                ) : activeCards.length === 0 ? (
                  <AppText variant="bodySmall" color="secondary">
                    Nenhum cartão disponível.
                  </AppText>
                ) : (
                  <View style={styles.categoryList}>
                    {activeCards.map((card) => (
                      <CategoryOption
                        key={card.id}
                        label={formatCardLabel(card)}
                        selected={card.id === creditCardId}
                        onPress={() => setCreditCardId(card.id)}
                      />
                    ))}
                  </View>
                )}
              </>
            )}
          </FormSection>
        </FormBottomSheet>
      ) : null}
    </View>
  );
}

function TypeOption({
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
        styles.optionButton,
        styles.flexOption,
        {
          borderColor: selected ? theme.colors.accent : theme.colors.border,
          backgroundColor: selected ? theme.colors.surfaceElevated : theme.colors.surface,
          shadowColor: selected ? theme.colors.accent : 'transparent',
          shadowOpacity: selected ? 0.12 : 0,
          shadowRadius: selected ? 12 : 0,
          shadowOffset: { width: 0, height: 6 },
          elevation: selected ? 2 : 0,
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

function CategoryOption({
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
        styles.optionButton,
        styles.categoryOption,
        {
          borderColor: selected ? theme.colors.accent : theme.colors.border,
          backgroundColor: selected ? theme.colors.surfaceElevated : theme.colors.surface,
          shadowColor: selected ? theme.colors.accent : 'transparent',
          shadowOpacity: selected ? 0.1 : 0,
          shadowRadius: selected ? 10 : 0,
          shadowOffset: { width: 0, height: 4 },
          elevation: selected ? 2 : 0,
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

function FormSection({
  title,
  helper,
  children,
}: {
  title: string;
  helper: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <AppText variant="title3">{title}</AppText>
      <AppText
        variant="caption"
        color="secondary"
        style={{ marginTop: theme.spacing.xs, marginBottom: theme.spacing.md }}
      >
        {helper}
      </AppText>
      {children}
    </View>
  );
}

function SelectionSummary({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.summaryPill,
        {
          backgroundColor: theme.colors.accentMuted,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <AppText variant="caption" color="secondary">
        {label}
      </AppText>
      <AppText variant="bodySmall" style={{ marginTop: 4, fontWeight: '600' }}>
        {value}
      </AppText>
    </View>
  );
}

function FeedbackBanner({
  tone,
  message,
  compact,
}: {
  tone: 'success' | 'danger';
  message: string;
  compact?: boolean;
}) {
  const { theme } = useTheme();
  const isSuccess = tone === 'success';

  return (
    <View
      style={[
        styles.feedbackBanner,
        compact && styles.feedbackBannerCompact,
        {
          backgroundColor: isSuccess ? 'rgba(74, 222, 155, 0.14)' : 'rgba(255, 122, 122, 0.12)',
          borderColor: isSuccess ? theme.colors.success : theme.colors.danger,
        },
      ]}
    >
      <AppText variant="bodySmall" color={tone} style={{ fontWeight: '600' }}>
        {isSuccess ? 'Tudo certo' : 'Nao foi possivel continuar'}
      </AppText>
      <AppText
        variant="caption"
        color={isSuccess ? 'secondary' : 'danger'}
        style={{ marginTop: 4 }}
      >
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  formShell: {
    padding: 0,
    overflow: 'hidden',
  },
  formContent: {
    padding: 18,
    paddingBottom: 12,
    gap: 18,
  },
  heroBlock: {
    paddingTop: 4,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  summaryPill: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  feedbackBanner: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  feedbackBannerCompact: {
    marginBottom: 0,
  },
  typeSwitch: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inputSpacing: {
    marginBottom: 12,
  },
  dateCard: {
    marginTop: 4,
  },
  dateInput: {
    marginBottom: 8,
  },
  ctaDock: {
    padding: 18,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  primaryCta: {
    minHeight: 54,
  },
  secondaryCta: {
    minHeight: 50,
  },
  optionButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  categoryOption: {
    alignItems: 'flex-start',
  },
  flexOption: {
    flex: 1,
  },
});
