import { useEffect, useMemo, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppButton, AppCard, AppInput, AppText } from '../../components';
import type { Account } from '../../shared/types/account';
import type { Category } from '../../shared/types/category';
import type { Transaction } from '../../shared/types/transaction';
import { useTheme } from '../../theme';
import { formatCurrency } from '../../utils/formatCurrency';

import { useFinancialAssistantChat } from './useFinancialAssistantChat';

type Props = {
  visible: boolean;
  onClose: () => void;
  userId: string | null | undefined;
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  onTransactionSaved: () => void;
};

const SUGGESTIONS = [
  'Gastei 50 reais com mercado ontem',
  'Recebi 3200 de salario hoje',
  'Paguei 89,90 de internet dia 5',
];

export function FinancialAssistantModal({
  visible,
  onClose,
  userId,
  categories,
  accounts,
  transactions,
  onTransactionSaved,
}: Props) {
  const { theme } = useTheme();
  const messagesRef = useRef<ScrollView | null>(null);
  const {
    messages,
    hydrated,
    input,
    setInput,
    currentDraft,
    categorySuggestions,
    isProcessing,
    isPersisting,
    sendError,
    successMessage,
    setCurrentDraft,
    clearSendError,
    handleSend,
    handleConfirmDraft,
    handleCancelDraft,
  } = useFinancialAssistantChat({
    userId,
    categories,
    accounts,
    transactions,
    onConfirmSuccess: onTransactionSaved,
  });

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setTimeout(() => {
      messagesRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timer);
  }, [messages, currentDraft, visible]);

  const hasMessages = messages.length > 0;
  const canSend = input.trim().length > 0 && !isProcessing && !isPersisting;
  const previewCategoryName = useMemo(() => {
    const wanted = currentDraft?.category?.trim().toLowerCase();
    if (!wanted) {
      return categorySuggestions[0]?.name ?? null;
    }

    return (
      categorySuggestions.find((category) => category.name.trim().toLowerCase() === wanted)?.name ??
      categorySuggestions.find((category) =>
        category.name.trim().toLowerCase().includes(wanted),
      )?.name ??
      currentDraft?.category ??
      null
    );
  }, [categorySuggestions, currentDraft]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrap}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.background,
                borderTopLeftRadius: theme.radius.xl,
                borderTopRightRadius: theme.radius.xl,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.handleWrap}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: theme.colors.border, borderRadius: theme.radius.full },
                ]}
              />
            </View>

            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <AppText variant="title3">Assistente financeiro</AppText>
                <AppText variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.xxs }}>
                  Descreva uma transacao em linguagem natural e confirme a previa.
                </AppText>
              </View>
              <AppButton title="Fechar" variant="ghost" onPress={onClose} />
            </View>

            {sendError ? (
              <AppCard
                style={{
                  marginBottom: theme.spacing.md,
                  backgroundColor: 'rgba(217, 56, 56, 0.10)',
                  borderColor: theme.colors.danger,
                }}
              >
                <AppText variant="bodySmall" color="danger">
                  {sendError}
                </AppText>
              </AppCard>
            ) : null}

            {successMessage ? (
              <AppCard
                style={{
                  marginBottom: theme.spacing.md,
                  backgroundColor: 'rgba(11, 143, 95, 0.10)',
                  borderColor: theme.colors.success,
                }}
              >
                <AppText variant="bodySmall" color="success">
                  {successMessage}
                </AppText>
              </AppCard>
            ) : null}

            <ScrollView
              ref={messagesRef}
              style={styles.messages}
              contentContainerStyle={{ gap: theme.spacing.md, paddingBottom: theme.spacing.lg }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {!hydrated ? (
                <AppText variant="bodySmall" color="secondary">
                  Carregando conversa...
                </AppText>
              ) : hasMessages ? (
                messages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageBubble,
                      {
                        alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                        backgroundColor:
                          message.role === 'user'
                            ? theme.colors.accent
                            : theme.colors.surfaceElevated,
                        borderColor:
                          message.role === 'user' ? theme.colors.accent : theme.colors.border,
                      },
                    ]}
                  >
                    <AppText
                      variant="bodySmall"
                      style={{
                        color:
                          message.role === 'user' ? '#FFFFFF' : theme.colors.textPrimary,
                      }}
                    >
                      {message.content}
                    </AppText>
                  </View>
                ))
              ) : (
                <AppCard>
                  <AppText variant="bodySmall" color="secondary">
                    Tente algo como:
                  </AppText>
                  <View style={[styles.suggestionsWrap, { marginTop: theme.spacing.md }]}>
                    {SUGGESTIONS.map((suggestion) => (
                      <Pressable
                        key={suggestion}
                        onPress={() => {
                          clearSendError();
                          setInput(suggestion);
                        }}
                        style={[
                          styles.suggestionChip,
                          {
                            borderRadius: theme.radius.full,
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.surface,
                          },
                        ]}
                      >
                        <AppText variant="caption">{suggestion}</AppText>
                      </Pressable>
                    ))}
                  </View>
                </AppCard>
              )}

              {currentDraft ? (
                <AppCard style={{ gap: theme.spacing.md }}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <AppText variant="label">Previa da transacao</AppText>
                      <AppText variant="caption" color="secondary" style={{ marginTop: theme.spacing.xxs }}>
                        Revise antes de salvar no Supabase.
                      </AppText>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        {
                          borderRadius: theme.radius.full,
                          backgroundColor:
                            currentDraft.type === 'income'
                              ? 'rgba(11, 143, 95, 0.10)'
                              : 'rgba(184, 134, 11, 0.12)',
                        },
                      ]}
                    >
                      <AppText
                        variant="caption"
                        style={{
                          color:
                            currentDraft.type === 'income'
                              ? theme.colors.success
                              : theme.colors.warning,
                        }}
                      >
                        {currentDraft.type === 'income' ? 'Receita' : 'Despesa'}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.typeRow}>
                    <Pressable
                      onPress={() =>
                        setCurrentDraft((draft) =>
                          draft ? { ...draft, type: 'expense', category: null } : draft,
                        )
                      }
                      style={[
                        styles.typeButton,
                        {
                          borderRadius: theme.radius.full,
                          borderColor:
                            currentDraft.type === 'expense'
                              ? theme.colors.accent
                              : theme.colors.border,
                          backgroundColor:
                            currentDraft.type === 'expense'
                              ? theme.colors.accentMuted
                              : theme.colors.surface,
                        },
                      ]}
                    >
                      <AppText variant="label">Despesa</AppText>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        setCurrentDraft((draft) =>
                          draft ? { ...draft, type: 'income', category: null } : draft,
                        )
                      }
                      style={[
                        styles.typeButton,
                        {
                          borderRadius: theme.radius.full,
                          borderColor:
                            currentDraft.type === 'income'
                              ? theme.colors.accent
                              : theme.colors.border,
                          backgroundColor:
                            currentDraft.type === 'income'
                              ? theme.colors.accentMuted
                              : theme.colors.surface,
                        },
                      ]}
                    >
                      <AppText variant="label">Receita</AppText>
                    </Pressable>
                  </View>

                  <AppInput
                    label="Valor"
                    value={currentDraft.amount > 0 ? String(currentDraft.amount) : ''}
                    onChangeText={(value) => {
                      const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
                      const numeric = Number(normalized);
                      setCurrentDraft((draft) =>
                        draft ? { ...draft, amount: Number.isFinite(numeric) ? numeric : 0 } : draft,
                      );
                    }}
                    keyboardType="decimal-pad"
                    placeholder="0,00"
                  />

                  <AppInput
                    label="Descricao"
                    value={currentDraft.description}
                    onChangeText={(value) =>
                      setCurrentDraft((draft) => (draft ? { ...draft, description: value } : draft))
                    }
                    placeholder="Ex: mercado, salario, farmacia"
                  />

                  <AppInput
                    label="Data"
                    value={currentDraft.date}
                    onChangeText={(value) =>
                      setCurrentDraft((draft) => (draft ? { ...draft, date: value } : draft))
                    }
                    autoCapitalize="none"
                    placeholder="AAAA-MM-DD"
                  />

                  <View>
                    <AppText variant="caption" color="secondary">
                      Categoria sugerida
                    </AppText>
                    {categorySuggestions.length === 0 ? (
                      <AppText
                        variant="bodySmall"
                        color="secondary"
                        style={{ marginTop: theme.spacing.sm }}
                      >
                        Nenhuma categoria disponivel para este tipo.
                      </AppText>
                    ) : (
                      <View style={[styles.suggestionsWrap, { marginTop: theme.spacing.sm }]}>
                        {categorySuggestions.slice(0, 8).map((category) => {
                          const selected = previewCategoryName?.trim().toLowerCase() === category.name.trim().toLowerCase();
                          return (
                            <Pressable
                              key={category.id}
                              onPress={() =>
                                setCurrentDraft((draft) =>
                                  draft ? { ...draft, category: category.name } : draft,
                                )
                              }
                              style={[
                                styles.suggestionChip,
                                {
                                  borderRadius: theme.radius.full,
                                  borderColor: selected ? theme.colors.accent : theme.colors.border,
                                  backgroundColor: selected
                                    ? theme.colors.accentMuted
                                    : theme.colors.surface,
                                },
                              ]}
                            >
                              <AppText variant="caption">{category.name}</AppText>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.previewSummary,
                      {
                        borderRadius: theme.radius.lg,
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <AppText variant="bodySmall">
                      {currentDraft.type === 'income' ? 'Receita' : 'Despesa'} de{' '}
                      {formatCurrency(currentDraft.amount || 0)}
                    </AppText>
                    <AppText variant="caption" color="secondary" style={{ marginTop: theme.spacing.xxs }}>
                      {previewCategoryName ?? 'Categoria automatico'} · {currentDraft.date}
                    </AppText>
                  </View>

                  <View style={styles.actionsRow}>
                    <AppButton
                      title="Cancelar"
                      variant="secondary"
                      onPress={handleCancelDraft}
                      style={styles.actionButton}
                    />
                    <AppButton
                      title={isPersisting ? 'Salvando...' : 'Confirmar e salvar'}
                      onPress={handleConfirmDraft}
                      loading={isPersisting}
                      style={styles.actionButton}
                    />
                  </View>
                </AppCard>
              ) : null}
            </ScrollView>

            <View
              style={[
                styles.inputWrap,
                {
                  borderTopColor: theme.colors.border,
                  paddingBottom: theme.spacing.md,
                },
              ]}
            >
              <View style={styles.inputRow}>
                <TextInput
                  value={input}
                  onChangeText={(value) => {
                    if (sendError) {
                      clearSendError();
                    }
                    setInput(value);
                  }}
                  placeholder="Ex: gastei 50 com mercado ontem"
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  editable={!isProcessing && !isPersisting}
                  style={[
                    styles.textComposer,
                    {
                      borderRadius: theme.radius.lg,
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surfaceElevated,
                      color: theme.colors.textPrimary,
                    },
                  ]}
                />
                <AppButton
                  title={isProcessing ? 'Lendo...' : 'Enviar'}
                  onPress={handleSend}
                  disabled={!canSend}
                  loading={isProcessing}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.34)',
  },
  sheetWrap: {
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopWidth: 1,
    minHeight: '72%',
    maxHeight: '92%',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  handle: {
    height: 5,
    width: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  messages: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: '86%',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  previewSummary: {
    borderWidth: 1,
    padding: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  inputWrap: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textComposer: {
    flex: 1,
    minHeight: 52,
    maxHeight: 120,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
});
