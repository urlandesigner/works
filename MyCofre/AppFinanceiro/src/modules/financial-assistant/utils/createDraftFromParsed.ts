import { getTodayIsoLocal } from '../../../lib/format'
import type { ParsedFinanceAction, TransactionDraft } from '../types'

function createClientId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
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
  }
}
