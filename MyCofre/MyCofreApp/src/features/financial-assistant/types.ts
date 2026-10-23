import type { TransactionType } from '../../shared/types/transaction';

export type FinanceIntent = 'income' | 'expense' | 'unknown';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ParsedFinanceAction {
  intent: FinanceIntent;
  confidence: number;
  data: {
    type?: TransactionType;
    amount?: number;
    description?: string;
    date?: string;
    category?: string | null;
    dateAssumed?: boolean;
  };
  missingFields: string[];
}

export interface TransactionDraft {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  category: string | null;
  source: 'financial_assistant_local';
  status: 'draft' | 'confirmed';
  createdAt: string;
  confirmedAt?: string;
}
