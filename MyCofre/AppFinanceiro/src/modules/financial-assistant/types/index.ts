export type FinanceIntent = 'income' | 'expense' | 'unknown'

export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface ParsedFinanceAction {
  intent: FinanceIntent
  /** 0–1 */
  confidence: number
  data: {
    type?: 'income' | 'expense'
    amount?: number
    description?: string
    /** yyyy-mm-dd */
    date?: string
    category?: string | null
    /** Data padrão (hoje) quando o texto não cita data */
    dateAssumed?: boolean
  }
  missingFields: string[]
}

export interface TransactionDraft {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  /** yyyy-mm-dd */
  date: string
  category: string | null
  source: 'financial_assistant_local'
  status: 'draft' | 'confirmed'
  createdAt: string
  confirmedAt?: string
}
