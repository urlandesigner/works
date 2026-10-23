import type { SupabaseClient } from '@supabase/supabase-js'
import type { Transaction, TransactionRecurrence, TransactionType } from '../../types/transaction'

/** Linha retornada pelo PostgREST (tipos amplos para numeric/date). */
export type TransactionRow = {
  id: string
  user_id: string
  account_id: string | null
  category_id: string
  type: string
  description: string | null
  amount: number | string
  date: string
  notes?: string | null
  recurrence?: string | null
  credit_card_id?: string | null
  exclude_from_month_expense_summary?: boolean | null
}

function parseAmount(value: number | string): number {
  if (typeof value === 'number') return value
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

function normalizeDate(value: string): string {
  return value.length >= 10 ? value.slice(0, 10) : value
}

export function mapRowToTransaction(row: TransactionRow): Transaction {
  const recurrence = (row.recurrence as TransactionRecurrence) || 'none'
  return {
    id: row.id,
    user_id: row.user_id,
    account_id: row.account_id,
    category_id: row.category_id,
    type: row.type as TransactionType,
    description: row.description,
    amount: parseAmount(row.amount),
    transaction_date: normalizeDate(row.date),
    notes: row.notes ?? null,
    recurrence,
    recurring: recurrence !== 'none',
    credit_card_id: row.credit_card_id ?? null,
    exclude_from_month_expense_summary:
      row.exclude_from_month_expense_summary === true,
  }
}

type InsertInput = {
  user_id: string
  account_id: string | null
  category_id: string
  type: TransactionType
  description: string | null
  amount: number
  transaction_date: string
  notes?: string | null
  recurrence?: TransactionRecurrence
  credit_card_id?: string | null
  exclude_from_month_expense_summary?: boolean
}

function toInsertRow(input: InsertInput): Record<string, unknown> {
  const isExpense = input.type === 'expense'
  return {
    user_id: input.user_id,
    account_id: input.account_id,
    category_id: input.category_id,
    type: input.type,
    description: input.description,
    amount: input.amount,
    date: input.transaction_date,
    notes: input.notes ?? null,
    recurrence: input.recurrence ?? 'none',
    credit_card_id:
      isExpense && input.credit_card_id ? input.credit_card_id : null,
    exclude_from_month_expense_summary:
      isExpense && (input.exclude_from_month_expense_summary === true),
  }
}

export async function fetchTransactionsForUser(
  client: SupabaseClient,
  userId: string
): Promise<{ data: Transaction[]; error: Error | null }> {
  const { data, error } = await client
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('id', { ascending: false })

  if (error) {
    return { data: [], error: new Error(error.message) }
  }

  const rows = (data ?? []) as TransactionRow[]
  return { data: rows.map(mapRowToTransaction), error: null }
}

export async function insertTransaction(
  client: SupabaseClient,
  userId: string,
  payload: Omit<Transaction, 'id'>
): Promise<{ data: Transaction | null; error: Error | null }> {
  const row = toInsertRow({
    user_id: userId,
    account_id: payload.account_id,
    category_id: payload.category_id,
    type: payload.type,
    description: payload.description,
    amount: payload.amount,
    transaction_date: payload.transaction_date,
    notes: payload.notes ?? null,
    recurrence: payload.recurrence ?? 'none',
    credit_card_id: payload.credit_card_id ?? null,
    exclude_from_month_expense_summary:
      payload.exclude_from_month_expense_summary === true,
  })

  const { data, error } = await client
    .from('transactions')
    .insert(row)
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  if (data == null) {
    return {
      data: null,
      error: new Error('O servidor não devolveu a transação criada.'),
    }
  }

  return { data: mapRowToTransaction(data as TransactionRow), error: null }
}

export async function updateTransactionRow(
  client: SupabaseClient,
  userId: string,
  id: string,
  patch: Partial<
    Pick<
      Transaction,
      | 'account_id'
      | 'category_id'
      | 'type'
      | 'description'
      | 'amount'
      | 'transaction_date'
      | 'notes'
      | 'recurrence'
      | 'recurring'
      | 'credit_card_id'
      | 'exclude_from_month_expense_summary'
    >
  >
): Promise<{ data: Transaction | null; error: Error | null }> {
  const body: Record<string, unknown> = {}

  if (patch.account_id !== undefined) body.account_id = patch.account_id
  if (patch.category_id !== undefined) body.category_id = patch.category_id
  if (patch.type !== undefined) body.type = patch.type
  if (patch.description !== undefined) body.description = patch.description
  if (patch.amount !== undefined) body.amount = patch.amount
  if (patch.transaction_date !== undefined) {
    body.date = patch.transaction_date
  }
  if (patch.notes !== undefined) body.notes = patch.notes
  if (patch.recurrence !== undefined) {
    body.recurrence = patch.recurrence
  } else if (patch.recurring !== undefined) {
    body.recurrence = patch.recurring ? 'monthly' : 'none'
  }
  if (patch.credit_card_id !== undefined) {
    body.credit_card_id = patch.credit_card_id || null
  }
  if (patch.exclude_from_month_expense_summary !== undefined) {
    body.exclude_from_month_expense_summary =
      patch.exclude_from_month_expense_summary === true
  }

  const { data, error } = await client
    .from('transactions')
    .update(body)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data: mapRowToTransaction(data as TransactionRow), error: null }
}

export async function deleteTransactionRow(
  client: SupabaseClient,
  userId: string,
  id: string
): Promise<{ error: Error | null }> {
  const { error } = await client
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    return { error: new Error(error.message) }
  }

  return { error: null }
}

export async function deleteGeneratedClosingAdjustments(
  client: SupabaseClient,
  userId: string,
  closingTag: string,
  adjustmentDate: string
): Promise<{ error: Error | null }> {
  const { error } = await client
    .from('transactions')
    .delete()
    .eq('user_id', userId)
    .eq('date', adjustmentDate)
    .ilike('description', `Ajuste de saldo (${closingTag})%`)
    .ilike(
      'notes',
      'Gerado automaticamente no fechamento mensal para conciliar saldo calculado com saldo real.%'
    )

  if (error) {
    return { error: new Error(error.message) }
  }

  return { error: null }
}