import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getSupabaseMobileClient } from '../../lib/supabase/client';
import { insertTransaction } from '../../shared/supabase/transactionsRepo';
import type { Account } from '../../shared/types/account';
import type { Category } from '../../shared/types/category';
import type { Transaction } from '../../shared/types/transaction';

import { createDraftFromParsed, formatAssistantReply, resolveCategoryIdForDraft, resolveDefaultAccountId } from './helpers';
import { parseFinanceMessage } from './parseFinanceMessage';
import { loadAssistantMessages, saveAssistantMessages } from './storage';
import type { AssistantMessage, ParsedFinanceAction, TransactionDraft } from './types';

const MAX_MESSAGES = 80;

function createClientId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

type Params = {
  userId: string | null | undefined;
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  onConfirmSuccess?: () => void;
};

export function useFinancialAssistantChat({
  userId,
  categories,
  accounts,
  transactions,
  onConfirmSuccess,
}: Params) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState('');
  const [currentDraft, setCurrentDraft] = useState<TransactionDraft | null>(null);
  const [currentParsed, setCurrentParsed] = useState<ParsedFinanceAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPersisting, setIsPersisting] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const persistGuardRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const stored = await loadAssistantMessages(userId);
      if (!cancelled) {
        setMessages(stored);
        setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!hydrated) return;
    void saveAssistantMessages(
      messages.length > MAX_MESSAGES ? messages.slice(-MAX_MESSAGES) : messages,
      userId,
    );
  }, [messages, hydrated, userId]);

  const categorySuggestions = useMemo(
    () => categories.filter((category) => category.type === (currentDraft?.type ?? 'expense')),
    [categories, currentDraft?.type],
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    setSendError(null);
    setSuccessMessage(null);
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const userMessage: AssistantMessage = {
          id: createClientId('assistant-user'),
          role: 'user',
          content: text,
          createdAt: new Date().toISOString(),
        };

        const parsed = parseFinanceMessage(text);
        const assistantMessage: AssistantMessage = {
          id: createClientId('assistant-reply'),
          role: 'assistant',
          content: formatAssistantReply(parsed),
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage, assistantMessage].slice(-MAX_MESSAGES));
        setCurrentParsed(parsed);
        setCurrentDraft(createDraftFromParsed(parsed));
        setInput('');

        if (parsed.missingFields.includes('valor')) {
          setSendError('Nao encontrei um valor claro no texto. Ajuste o valor na previa antes de confirmar.');
        }
      } catch (error) {
        setSendError(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel interpretar sua mensagem agora.',
        );
      } finally {
        setIsProcessing(false);
      }
    }, 450);
  }, [input]);

  const handleConfirmDraft = useCallback(async () => {
    if (!currentDraft || persistGuardRef.current) return;

    if (!userId) {
      setSendError('Faca login para salvar o lancamento.');
      return;
    }

    if (currentDraft.amount <= 0 || !currentDraft.description.trim()) {
      setSendError('Preencha valor e descricao antes de confirmar.');
      return;
    }

    if (!currentDraft.date) {
      setSendError('Informe a data do lancamento.');
      return;
    }

    const client = getSupabaseMobileClient();
    if (!client) {
      setSendError('Supabase nao configurado.');
      return;
    }

    const categoryId = resolveCategoryIdForDraft(categories, currentDraft);
    if (!categoryId) {
      setSendError('Nao ha categoria disponivel para este tipo de transacao.');
      return;
    }

    const defaultAccountId = resolveDefaultAccountId(accounts, transactions);
    if (!defaultAccountId) {
      setSendError('Cadastre ao menos uma conta ativa antes de salvar pelo assistente.');
      return;
    }

    persistGuardRef.current = true;
    setIsPersisting(true);
    setSendError(null);
    setSuccessMessage(null);

    const { error } = await insertTransaction(client, userId, {
      user_id: userId,
      account_id: defaultAccountId,
      category_id: categoryId,
      type: currentDraft.type,
      description: currentDraft.description.trim(),
      amount: currentDraft.amount,
      transaction_date: currentDraft.date,
      notes: null,
      recurrence: 'none',
      recurring: false,
      credit_card_id: null,
      exclude_from_month_expense_summary: false,
    });

    setIsPersisting(false);
    persistGuardRef.current = false;

    if (error) {
      setSendError(error.message);
      return;
    }

    const successReply: AssistantMessage = {
      id: createClientId('assistant-ack'),
      role: 'assistant',
      content: 'Lancamento salvo com sucesso. Ele ja aparece na Home e em Transacoes.',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, successReply].slice(-MAX_MESSAGES));
    setSuccessMessage('Transacao salva com sucesso.');
    setCurrentDraft(null);
    setCurrentParsed(null);
    setInput('');
    onConfirmSuccess?.();
  }, [accounts, categories, currentDraft, onConfirmSuccess, transactions, userId]);

  const handleCancelDraft = useCallback(() => {
    setCurrentDraft(null);
    setCurrentParsed(null);
    setSendError(null);
    setSuccessMessage(null);
  }, []);

  return {
    messages,
    hydrated,
    input,
    setInput,
    currentDraft,
    currentParsed,
    categorySuggestions,
    isProcessing,
    isPersisting,
    sendError,
    successMessage,
    setCurrentDraft,
    clearSendError: () => setSendError(null),
    handleSend,
    handleConfirmDraft,
    handleCancelDraft,
  };
}
