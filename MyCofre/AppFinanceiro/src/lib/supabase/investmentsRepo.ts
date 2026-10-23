import type { SupabaseClient } from '@supabase/supabase-js'
import type { Investment, InvestmentStatus, InvestmentType } from '../../types/investment'

export type InvestmentRow = {
  id: string
  user_id: string
  account_id: string | null
  name: string
  type: string
  invested_amount: number | string
  current_amount: number | string
  created_at?: string
  institution?: string | null
  notes?: string | null
  status?: string | null
}

function parseNum(v: number | string): number {
  if (typeof v === 'number') return v
  const n = Number.parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

export function mapRowToInvestment(row: InvestmentRow): Investment {
  return {
    id: row.id,
    user_id: row.user_id,
    account_id: row.account_id ?? null,
    name: row.name,
    type: row.type as InvestmentType,
    invested_amount: parseNum(row.invested_amount),
    current_amount: parseNum(row.current_amount),
    created_at: row.created_at,
    institution: row.institution ?? null,
    notes: row.notes ?? null,
    status: (row.status as InvestmentStatus) ?? 'active',
  }
}

function toInsertRow(userId: string, data: Omit<Investment, 'id'>): Record<string, unknown> {
  return {
    user_id: userId,
    account_id: data.account_id ?? null,
    name: data.name,
    type: data.type,
    invested_amount: data.invested_amount,
    current_amount: data.current_amount,
    institution: data.institution ?? null,
    notes: data.notes ?? null,
    status: data.status ?? 'active',
  }
}

export async function fetchInvestmentsForUser(
  client: SupabaseClient,
  userId: string
): Promise<{ data: Investment[]; error: Error | null }> {
  const { data, error } = await client
    .from('investments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

  if (error) return { data: [], error: new Error(error.message) }
  return { data: (data as InvestmentRow[]).map(mapRowToInvestment), error: null }
}

export async function insertInvestment(
  client: SupabaseClient,
  userId: string,
  payload: Omit<Investment, 'id'>
): Promise<{ data: Investment | null; error: Error | null }> {
  const { data, error } = await client
    .from('investments')
    .insert(toInsertRow(userId, payload))
    .select()
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: mapRowToInvestment(data as InvestmentRow), error: null }
}

export async function updateInvestmentRow(
  client: SupabaseClient,
  userId: string,
  id: string,
  patch: Partial<
    Pick<
      Investment,
      | 'account_id'
      | 'name'
      | 'type'
      | 'invested_amount'
      | 'current_amount'
      | 'institution'
      | 'notes'
      | 'status'
    >
  >
): Promise<{ data: Investment | null; error: Error | null }> {
  const body: Record<string, unknown> = {}
  if (patch.account_id !== undefined) body.account_id = patch.account_id ?? null
  if (patch.name !== undefined) body.name = patch.name
  if (patch.type !== undefined) body.type = patch.type
  if (patch.invested_amount !== undefined) body.invested_amount = patch.invested_amount
  if (patch.current_amount !== undefined) body.current_amount = patch.current_amount
  if (patch.institution !== undefined) body.institution = patch.institution
  if (patch.notes !== undefined) body.notes = patch.notes
  if (patch.status !== undefined) body.status = patch.status

  const { data, error } = await client
    .from('investments')
    .update(body)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: mapRowToInvestment(data as InvestmentRow), error: null }
}

export async function deleteInvestmentRow(
  client: SupabaseClient,
  userId: string,
  id: string
): Promise<{ error: Error | null }> {
  const { error } = await client
    .from('investments')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return { error: new Error(error.message) }
  return { error: null }
}
