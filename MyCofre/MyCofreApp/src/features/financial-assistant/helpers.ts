import type { Account } from '../../shared/types/account';
import type { Category } from '../../shared/types/category';
import type { Transaction } from '../../shared/types/transaction';

import type { ParsedFinanceAction, TransactionDraft } from './types';

function createClientId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getTodayIsoLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createDraftFromParsed(parsed: ParsedFinanceAction): TransactionDraft {
  return {
    id: createClientId('assistant-draft'),
    type: parsed.data.type ?? 'expense',
    amount: parsed.data.amount && parsed.data.amount > 0 ? parsed.data.amount : 0,
    description: parsed.data.description ?? '',
    date: parsed.data.date ?? getTodayIsoLocal(),
    category: parsed.data.category ?? null,
    source: 'financial_assistant_local',
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
}

export function formatAssistantReply(parsed: ParsedFinanceAction): string {
  const money =
    parsed.data.amount != null && parsed.data.amount > 0
      ? new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(parsed.data.amount)
      : null;

  if (!money && parsed.intent === 'unknown') {
    return 'Nao consegui montar o lancamento so com essa frase. Inclua um valor ou ajuste na previa.';
  }

  if (money) {
    return `Previa criada para ${parsed.data.type === 'income' ? 'receita' : 'despesa'} de ${money}. Confira e confirme abaixo.`;
  }

  return 'Criei uma previa parcial. Ajuste os campos e confirme quando estiver pronta.';
}

export function resolveCategoryIdForDraft(
  categories: Category[],
  draft: TransactionDraft,
): string | null {
  const pool = categories.filter((category) => category.type === draft.type);
  if (pool.length === 0) return null;

  const wanted = draft.category?.trim().toLowerCase();
  if (wanted) {
    const exact = pool.find((category) => category.name.trim().toLowerCase() === wanted);
    if (exact) return exact.id;

    const partial = pool.find(
      (category) =>
        category.name.trim().toLowerCase().includes(wanted) ||
        wanted.includes(category.name.trim().toLowerCase()),
    );
    if (partial) return partial.id;
  }

  return pool[0].id;
}

export function resolveDefaultAccountId(
  accounts: Account[],
  transactions: Transaction[],
): string | null {
  const activeAccounts = accounts.filter((account) => account.status !== 'closed');
  const recentWithAccount = transactions.find((transaction) => transaction.account_id);

  if (recentWithAccount?.account_id && activeAccounts.some((account) => account.id === recentWithAccount.account_id)) {
    return recentWithAccount.account_id;
  }

  return activeAccounts[0]?.id ?? null;
}
