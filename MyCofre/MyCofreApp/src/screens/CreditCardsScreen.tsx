import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppButton, AppCard, AppHeader, AppInput, AppScreen, AppText, FloatingActionButton, FormBottomSheet } from '../components';
import { useAuth } from '../features/auth';
import { useTransactionsSync } from '../features/transactions';
import { getSupabaseMobileClient } from '../lib/supabase/client';
import {
  getMonthCreditCardBillsTotal,
  getOutstandingCreditCardDebt,
} from '../shared/balance';
import {
  deleteBillRow,
  deleteCreditCardRow,
  fetchBillsForUser,
  fetchCreditCardsForUser,
  insertBillRow,
  insertCreditCard,
  updateBillRow,
  updateCreditCardRow,
} from '../shared/supabase/creditCardsRepo';
import type { CreditCard, CreditCardBill } from '../shared/types/credit-card';
import { useTheme } from '../theme';
import { formatCurrency } from '../utils/formatCurrency';

type ScreenMode = 'list' | 'cardForm' | 'detail' | 'billForm';

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

function parseMoneyInput(value: string): number {
  const normalized = value.replace(/\./g, '').replace(',', '.').trim();
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : Number.NaN;
}

function cardStatusLabel(card: CreditCard): string {
  return card.isActive ? 'Ativo' : 'Inativo';
}

function billStatusLabel(bill: CreditCardBill): string {
  return bill.isPaid ? 'Paga' : 'Em aberto';
}

function formatBillPeriod(month: number, year: number): string {
  const label = MONTH_LABELS[month - 1] ?? `Mês ${month}`;
  return `${label} ${year}`;
}

function formatCardLabel(card: CreditCard): string {
  return `${card.name} · ${card.brand} · final ${card.lastFourDigits}`;
}

export function CreditCardsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { refreshKey, notifyTransactionsChanged } = useTransactionsSync();

  const [cards, setCards] = useState<CreditCard[]>([]);
  const [bills, setBills] = useState<CreditCardBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCard, setSavingCard] = useState(false);
  const [savingBill, setSavingBill] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null);
  const [mode, setMode] = useState<ScreenMode>('list');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [cardName, setCardName] = useState('');
  const [cardBrand, setCardBrand] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [cardNotes, setCardNotes] = useState('');
  const [cardIsActive, setCardIsActive] = useState(true);

  const [billMonth, setBillMonth] = useState('');
  const [billYear, setBillYear] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billNotes, setBillNotes] = useState('');
  const [billIsPaid, setBillIsPaid] = useState(false);

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedCardId) ?? null,
    [cards, selectedCardId],
  );

  const selectedCardBills = useMemo(() => {
    if (!selectedCardId) return [];
    return bills
      .filter((bill) => bill.creditCardId === selectedCardId)
      .slice()
      .sort((a, b) => (a.year === b.year ? b.month - a.month : b.year - a.year));
  }, [bills, selectedCardId]);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const totalOpenBills = useMemo(() => getOutstandingCreditCardDebt(bills), [bills]);
  const totalCurrentMonth = useMemo(
    () => getMonthCreditCardBillsTotal(bills, currentYear, currentMonth),
    [bills, currentMonth, currentYear],
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
          setError('Supabase não configurado.');
          setCards([]);
          setBills([]);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError(null);
      }

      const [cardsRes, billsRes] = await Promise.all([
        fetchCreditCardsForUser(client, user.id),
        fetchBillsForUser(client, user.id),
      ]);

      if (cancelled) {
        return;
      }

      if (cardsRes.error) {
        setError(cardsRes.error.message);
        setLoading(false);
        return;
      }

      if (billsRes.error) {
        setError(billsRes.error.message);
        setLoading(false);
        return;
      }

      setCards(cardsRes.data);
      setBills(billsRes.data);
      setLoading(false);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, user?.id]);

  async function handleSaveCard() {
    if (!user?.id) {
      setError('Usuário não autenticado.');
      return;
    }

    const client = getSupabaseMobileClient();
    if (!client) {
      setError('Supabase não configurado.');
      return;
    }

    if (!cardName.trim()) {
      setError('Informe o nome do cartão.');
      return;
    }

    if (!cardBrand.trim()) {
      setError('Informe a bandeira.');
      return;
    }

    if (!/^\d{4}$/.test(lastFourDigits.trim())) {
      setError('Informe os 4 últimos dígitos.');
      return;
    }

    setSavingCard(true);
    setError(null);
    setSuccessMessage(null);

    if (editingCardId) {
      const { error: updateError } = await updateCreditCardRow(client, user.id, editingCardId, {
        name: cardName.trim(),
        brand: cardBrand.trim(),
        lastFourDigits: lastFourDigits.trim(),
        isActive: cardIsActive,
        notes: cardNotes.trim() || null,
      });

      setSavingCard(false);

      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await insertCreditCard(client, user.id, {
        name: cardName.trim(),
        brand: cardBrand.trim(),
        lastFourDigits: lastFourDigits.trim(),
        isActive: cardIsActive,
        notes: cardNotes.trim() || null,
      });

      setSavingCard(false);

      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    closeCardForm();
    setSuccessMessage(editingCardId ? 'Cartão atualizado com sucesso.' : 'Cartão criado com sucesso.');
    notifyTransactionsChanged();
  }

  async function handleSaveBill() {
    if (!user?.id || !selectedCardId) {
      setError('Selecione um cartão.');
      return;
    }

    const client = getSupabaseMobileClient();
    if (!client) {
      setError('Supabase não configurado.');
      return;
    }

    const parsedMonth = Number.parseInt(billMonth, 10);
    const parsedYear = Number.parseInt(billYear, 10);
    const parsedAmount = parseMoneyInput(billAmount);

    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      setError('Informe um mês válido.');
      return;
    }

    if (!Number.isInteger(parsedYear) || parsedYear < 2000) {
      setError('Informe um ano válido.');
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setError('Informe um valor válido para a fatura.');
      return;
    }

    setSavingBill(true);
    setError(null);
    setSuccessMessage(null);

    if (editingBillId) {
      const { error: updateError } = await updateBillRow(client, user.id, editingBillId, {
        creditCardId: selectedCardId,
        month: parsedMonth,
        year: parsedYear,
        amount: parsedAmount,
        isPaid: billIsPaid,
        notes: billNotes.trim() || null,
      });

      setSavingBill(false);

      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await insertBillRow(client, user.id, {
        creditCardId: selectedCardId,
        month: parsedMonth,
        year: parsedYear,
        amount: parsedAmount,
        isPaid: billIsPaid,
        notes: billNotes.trim() || null,
      });

      setSavingBill(false);

      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    closeBillForm();
    setSuccessMessage(editingBillId ? 'Fatura atualizada com sucesso.' : 'Fatura criada com sucesso.');
    notifyTransactionsChanged();
  }

  function openCardForm(card?: CreditCard) {
    if (card) {
      setEditingCardId(card.id);
      setCardName(card.name);
      setCardBrand(card.brand);
      setLastFourDigits(card.lastFourDigits);
      setCardNotes(card.notes ?? '');
      setCardIsActive(card.isActive);
    } else {
      setEditingCardId(null);
      setCardName('');
      setCardBrand('');
      setLastFourDigits('');
      setCardNotes('');
      setCardIsActive(true);
    }
    setError(null);
    setSuccessMessage(null);
    setMode('cardForm');
  }

  function closeCardForm() {
    setEditingCardId(null);
    setCardName('');
    setCardBrand('');
    setLastFourDigits('');
    setCardNotes('');
    setCardIsActive(true);
    setMode(selectedCardId ? 'detail' : 'list');
  }

  function openCardDetail(card: CreditCard) {
    setSelectedCardId(card.id);
    setEditingBillId(null);
    setError(null);
    setSuccessMessage(null);
    setMode('detail');
  }

  function closeCardDetail() {
    setSelectedCardId(null);
    setEditingBillId(null);
    setMode('list');
  }

  function openBillForm(bill?: CreditCardBill) {
    if (bill) {
      setEditingBillId(bill.id);
      setBillMonth(String(bill.month));
      setBillYear(String(bill.year));
      setBillAmount(String(bill.amount).replace('.', ','));
      setBillNotes(bill.notes ?? '');
      setBillIsPaid(bill.isPaid);
    } else {
      setEditingBillId(null);
      setBillMonth(String(currentMonth));
      setBillYear(String(currentYear));
      setBillAmount('');
      setBillNotes('');
      setBillIsPaid(false);
    }
    setError(null);
    setSuccessMessage(null);
    setMode('billForm');
  }

  function closeBillForm() {
    setEditingBillId(null);
    setBillMonth('');
    setBillYear('');
    setBillAmount('');
    setBillNotes('');
    setBillIsPaid(false);
    setMode(selectedCardId ? 'detail' : 'list');
  }

  function confirmDeleteCard(card: CreditCard) {
    Alert.alert(
      'Excluir cartão',
      'Tem certeza que deseja excluir este cartão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void handleDeleteCard(card);
          },
        },
      ],
    );
  }

  async function handleDeleteCard(card: CreditCard) {
    if (!user?.id) {
      setError('Usuário não autenticado.');
      return;
    }

    const client = getSupabaseMobileClient();
    if (!client) {
      setError('Supabase não configurado.');
      return;
    }

    setDeletingCardId(card.id);
    setError(null);
    setSuccessMessage(null);

    const { error: deleteError } = await deleteCreditCardRow(client, user.id, card.id);

    setDeletingCardId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (selectedCardId === card.id) {
      closeCardDetail();
    }

    setSuccessMessage('Cartão excluído com sucesso.');
    notifyTransactionsChanged();
  }

  function confirmDeleteBill(bill: CreditCardBill) {
    Alert.alert(
      'Excluir fatura',
      'Tem certeza que deseja excluir esta fatura?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void handleDeleteBill(bill);
          },
        },
      ],
    );
  }

  async function handleDeleteBill(bill: CreditCardBill) {
    if (!user?.id) {
      setError('Usuário não autenticado.');
      return;
    }

    const client = getSupabaseMobileClient();
    if (!client) {
      setError('Supabase não configurado.');
      return;
    }

    setDeletingBillId(bill.id);
    setError(null);
    setSuccessMessage(null);

    const { error: deleteError } = await deleteBillRow(client, user.id, bill.id);

    setDeletingBillId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (editingBillId === bill.id) {
      closeBillForm();
    }

    setSuccessMessage('Fatura excluída com sucesso.');
    notifyTransactionsChanged();
  }

  const screenTitle =
    mode === 'cardForm' && editingCardId
      ? 'Editar cartão'
      : mode === 'detail'
        ? 'Detalhe do cartão'
        : mode === 'billForm' && editingBillId
          ? 'Editar fatura'
          : 'Cartões';
  const isCreateCardSheetOpen = mode === 'cardForm' && editingCardId === null;
  const isEditCardScreen = mode === 'cardForm' && editingCardId !== null;
  const isCreateBillSheetOpen = mode === 'billForm' && editingBillId === null;
  const isEditBillScreen = mode === 'billForm' && editingBillId !== null;

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

        {!loading && (mode === 'list' || isCreateCardSheetOpen) ? (
        <>
          <AppCard style={{ marginBottom: theme.spacing.lg, ...theme.shadows.sm }}>
            <MetricRow label="Faturas em aberto" value={formatCurrency(totalOpenBills)} />
            <View style={{ height: theme.spacing.sm }} />
            <MetricRow
              label={`Total de ${MONTH_LABELS[currentMonth - 1]}`}
              value={formatCurrency(totalCurrentMonth)}
            />
          </AppCard>

          {cards.length === 0 ? (
            <AppText variant="bodySmall" color="secondary">
              Nenhum cartão cadastrado
            </AppText>
          ) : (
            <View style={{ gap: theme.spacing.lg }}>
              {cards.map((card) => {
                const cardBills = bills.filter((bill) => bill.creditCardId === card.id);
                const cardOpenTotal = getOutstandingCreditCardDebt(cardBills);
                const cardCurrentMonth = getMonthCreditCardBillsTotal(
                  cardBills,
                  currentYear,
                  currentMonth,
                );

                return (
                  <AppCard key={card.id} style={{ ...theme.shadows.sm }}>
                    <Pressable onPress={() => openCardDetail(card)}>
                      <View style={styles.headerRow}>
                        <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
                          <AppText variant="title3">{card.name}</AppText>
                          <AppText
                            variant="caption"
                            color="muted"
                            style={{ marginTop: theme.spacing.xs }}
                          >
                            {card.brand} · final {card.lastFourDigits} · {cardStatusLabel(card)}
                          </AppText>
                        </View>
                        <View style={styles.actionsRow}>
                          <Pressable
                            onPress={() => openCardForm(card)}
                            style={styles.actionButton}
                          >
                            <AppText variant="caption" color="accent">
                              Editar
                            </AppText>
                          </Pressable>
                          <Pressable
                            onPress={() => confirmDeleteCard(card)}
                            disabled={deletingCardId === card.id}
                            style={styles.actionButton}
                          >
                            <AppText
                              variant="caption"
                              color={deletingCardId === card.id ? 'muted' : 'danger'}
                            >
                              {deletingCardId === card.id ? 'Excluindo...' : 'Excluir'}
                            </AppText>
                          </Pressable>
                        </View>
                      </View>

                      <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
                        <MetricRow label="Status" value={cardStatusLabel(card)} />
                        <MetricRow label="Faturas" value={String(cardBills.length)} />
                        <MetricRow label="Em aberto" value={formatCurrency(cardOpenTotal)} />
                        <MetricRow
                          label={`Total de ${MONTH_LABELS[currentMonth - 1]}`}
                          value={formatCurrency(cardCurrentMonth)}
                        />
                      </View>
                    </Pressable>
                  </AppCard>
                );
              })}
            </View>
          )}
        </>
        ) : null}

        {!loading && isEditCardScreen ? (
        <AppCard style={{ ...theme.shadows.sm }}>
          <AppInput
            label="Nome"
            placeholder="Ex.: Nubank, Inter Black, Itaú Azul"
            value={cardName}
            onChangeText={setCardName}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Bandeira"
            placeholder="Ex.: Visa, Mastercard, Elo"
            value={cardBrand}
            onChangeText={setCardBrand}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="4 últimos dígitos"
            placeholder="1234"
            keyboardType="number-pad"
            maxLength={4}
            value={lastFourDigits}
            onChangeText={setLastFourDigits}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Observações"
            placeholder="Opcional"
            value={cardNotes}
            onChangeText={setCardNotes}
            style={{ marginBottom: theme.spacing.lg }}
          />

          <View
            style={{
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
              <AppText variant="bodySmall">Cartão ativo</AppText>
              <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.xs }}>
                Cartões inativos continuam visíveis, mas sinalizados.
              </AppText>
            </View>
            <Switch
              value={cardIsActive}
              onValueChange={setCardIsActive}
              trackColor={{ false: theme.colors.border, true: theme.colors.accentMuted }}
              thumbColor={cardIsActive ? theme.colors.accent : '#FFFFFF'}
              ios_backgroundColor={theme.colors.border}
            />
          </View>

          <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.xl }}>
            <AppButton
              title={editingCardId ? 'Salvar edição' : 'Salvar cartão'}
              onPress={() => void handleSaveCard()}
              loading={savingCard}
              fullWidth
            />
            <AppButton
              title="Cancelar"
              variant="secondary"
              onPress={closeCardForm}
              fullWidth
            />
          </View>
        </AppCard>
        ) : null}

        {!loading && (mode === 'detail' || isCreateBillSheetOpen) && selectedCard ? (
        <>
          <View style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.sm }}>
            <AppButton title="Voltar para cartões" variant="secondary" onPress={closeCardDetail} fullWidth />
          </View>

          <AppCard style={{ marginBottom: theme.spacing.lg, ...theme.shadows.sm }}>
            <AppText variant="title3">{selectedCard.name}</AppText>
            <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.xs }}>
              {formatCardLabel(selectedCard)}
            </AppText>

            <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
              <MetricRow label="Status" value={cardStatusLabel(selectedCard)} />
              <MetricRow label="Faturas totais" value={String(selectedCardBills.length)} />
              <MetricRow
                label="Total em aberto"
                value={formatCurrency(getOutstandingCreditCardDebt(selectedCardBills))}
              />
              {selectedCard.notes ? (
                <MetricRow label="Observações" value={selectedCard.notes} />
              ) : null}
            </View>
          </AppCard>

          {selectedCardBills.length === 0 ? (
            <AppText variant="bodySmall" color="secondary">
              Nenhuma fatura cadastrada para este cartão
            </AppText>
          ) : (
            <View style={{ gap: theme.spacing.lg }}>
              {selectedCardBills.map((bill) => (
                <AppCard key={bill.id} style={{ ...theme.shadows.sm }}>
                  <View style={styles.headerRow}>
                    <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
                      <AppText variant="bodySmall" style={{ fontWeight: '600' }}>
                        {formatBillPeriod(bill.month, bill.year)}
                      </AppText>
                      <AppText
                        variant="caption"
                        color="muted"
                        style={{ marginTop: theme.spacing.xs }}
                      >
                        {billStatusLabel(bill)}
                      </AppText>
                    </View>
                    <View style={styles.actionsRow}>
                      <Pressable onPress={() => openBillForm(bill)} style={styles.actionButton}>
                        <AppText variant="caption" color="accent">
                          Editar
                        </AppText>
                      </Pressable>
                      <Pressable
                        onPress={() => confirmDeleteBill(bill)}
                        disabled={deletingBillId === bill.id}
                        style={styles.actionButton}
                      >
                        <AppText
                          variant="caption"
                          color={deletingBillId === bill.id ? 'muted' : 'danger'}
                        >
                          {deletingBillId === bill.id ? 'Excluindo...' : 'Excluir'}
                        </AppText>
                      </Pressable>
                    </View>
                  </View>

                  <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
                    <MetricRow label="Período" value={formatBillPeriod(bill.month, bill.year)} />
                    <MetricRow label="Valor total" value={formatCurrency(bill.amount)} />
                    <MetricRow label="Status" value={billStatusLabel(bill)} />
                    {bill.notes ? <MetricRow label="Observações" value={bill.notes} /> : null}
                  </View>
                </AppCard>
              ))}
            </View>
          )}
        </>
        ) : null}

        {!loading && isEditBillScreen && selectedCard ? (
        <AppCard style={{ ...theme.shadows.sm }}>
          <AppText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.md }}>
            Cartão: {formatCardLabel(selectedCard)}
          </AppText>

          <AppInput
            label="Mês"
            placeholder="1 a 12"
            keyboardType="number-pad"
            value={billMonth}
            onChangeText={setBillMonth}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Ano"
            placeholder="2025"
            keyboardType="number-pad"
            value={billYear}
            onChangeText={setBillYear}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Valor total"
            placeholder="0,00"
            keyboardType="decimal-pad"
            value={billAmount}
            onChangeText={setBillAmount}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Observações"
            placeholder="Opcional"
            value={billNotes}
            onChangeText={setBillNotes}
            style={{ marginBottom: theme.spacing.lg }}
          />

          <View
            style={{
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
              <AppText variant="bodySmall">Fatura paga</AppText>
              <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.xs }}>
                Marque se esta fatura já foi quitada.
              </AppText>
            </View>
            <Switch
              value={billIsPaid}
              onValueChange={setBillIsPaid}
              trackColor={{ false: theme.colors.border, true: theme.colors.accentMuted }}
              thumbColor={billIsPaid ? theme.colors.accent : '#FFFFFF'}
              ios_backgroundColor={theme.colors.border}
            />
          </View>

          <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.xl }}>
            <AppButton
              title={editingBillId ? 'Salvar edição' : 'Salvar fatura'}
              onPress={() => void handleSaveBill()}
              loading={savingBill}
              fullWidth
            />
            <AppButton
              title="Cancelar"
              variant="secondary"
              onPress={closeBillForm}
              fullWidth
            />
          </View>
        </AppCard>
        ) : null}
      </AppScreen>

      {!loading && (mode === 'list' || isCreateCardSheetOpen) ? (
        <FloatingActionButton
          accessibilityLabel="Criar novo cartão"
          onPress={() => openCardForm()}
        />
      ) : null}

      {!loading && (mode === 'detail' || isCreateBillSheetOpen) && selectedCard ? (
        <FloatingActionButton
          accessibilityLabel="Criar nova fatura"
          onPress={() => openBillForm()}
        />
      ) : null}

      {!loading ? (
        <FormBottomSheet
          visible={isCreateCardSheetOpen}
          title="Novo cartão"
          subtitle="Adicione um cartão sem sair da lista."
          onClose={closeCardForm}
          footer={
            <View style={{ gap: theme.spacing.sm }}>
              <AppButton
                title={savingCard ? 'Salvando cartão...' : 'Salvar cartão'}
                onPress={() => void handleSaveCard()}
                loading={savingCard}
                fullWidth
              />
              <AppButton title="Cancelar" variant="secondary" onPress={closeCardForm} fullWidth />
            </View>
          }
        >
          <AppInput
            label="Nome"
            placeholder="Ex.: Nubank, Inter Black, Itaú Azul"
            value={cardName}
            onChangeText={setCardName}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Bandeira"
            placeholder="Ex.: Visa, Mastercard, Elo"
            value={cardBrand}
            onChangeText={setCardBrand}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="4 últimos dígitos"
            placeholder="1234"
            keyboardType="number-pad"
            maxLength={4}
            value={lastFourDigits}
            onChangeText={setLastFourDigits}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Observações"
            placeholder="Opcional"
            value={cardNotes}
            onChangeText={setCardNotes}
            style={{ marginBottom: theme.spacing.lg }}
          />

          <View
            style={{
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
              <AppText variant="bodySmall">Cartão ativo</AppText>
              <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.xs }}>
                Cartões inativos continuam visíveis, mas sinalizados.
              </AppText>
            </View>
            <Switch
              value={cardIsActive}
              onValueChange={setCardIsActive}
              trackColor={{ false: theme.colors.border, true: theme.colors.accentMuted }}
              thumbColor={cardIsActive ? theme.colors.accent : '#FFFFFF'}
              ios_backgroundColor={theme.colors.border}
            />
          </View>
        </FormBottomSheet>
      ) : null}

      {!loading && selectedCard ? (
        <FormBottomSheet
          visible={isCreateBillSheetOpen}
          title="Nova fatura"
          subtitle={`Cartão: ${formatCardLabel(selectedCard)}`}
          onClose={closeBillForm}
          footer={
            <View style={{ gap: theme.spacing.sm }}>
              <AppButton
                title={savingBill ? 'Salvando fatura...' : 'Salvar fatura'}
                onPress={() => void handleSaveBill()}
                loading={savingBill}
                fullWidth
              />
              <AppButton title="Cancelar" variant="secondary" onPress={closeBillForm} fullWidth />
            </View>
          }
        >
          <AppInput
            label="Mês"
            placeholder="1 a 12"
            keyboardType="number-pad"
            value={billMonth}
            onChangeText={setBillMonth}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Ano"
            placeholder="2025"
            keyboardType="number-pad"
            value={billYear}
            onChangeText={setBillYear}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Valor total"
            placeholder="0,00"
            keyboardType="decimal-pad"
            value={billAmount}
            onChangeText={setBillAmount}
            style={{ marginBottom: theme.spacing.md }}
          />

          <AppInput
            label="Observações"
            placeholder="Opcional"
            value={billNotes}
            onChangeText={setBillNotes}
            style={{ marginBottom: theme.spacing.lg }}
          />

          <View
            style={{
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
              <AppText variant="bodySmall">Fatura paga</AppText>
              <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.xs }}>
                Marque se esta fatura já foi quitada.
              </AppText>
            </View>
            <Switch
              value={billIsPaid}
              onValueChange={setBillIsPaid}
              trackColor={{ false: theme.colors.border, true: theme.colors.accentMuted }}
              thumbColor={billIsPaid ? theme.colors.accent : '#FFFFFF'}
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

const styles = StyleSheet.create({
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
