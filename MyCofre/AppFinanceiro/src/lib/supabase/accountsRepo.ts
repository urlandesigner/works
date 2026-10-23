import type { SupabaseClient } from '@supabase/supabase-js'
import type { Account, AccountStatus, AccountType } from '../../types/account'

export type AccountRow = {
  id: string
  user_id: string
  name: string
  type: string
  initial_balance: number | string
  created_at?: string
  institution?: string | null
  allows_investments?: boolean | null
  status?: string | null
  notes?: string | null
  include_in_net_worth?: boolean | null
}

function parseNum(v: number | string): number {
  if (typeof v === 'number') return v
  const n = Number.parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

export function mapRowToAccount(row: AccountRow): Account {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    type: row.type as AccountType,
    initial_balance: parseNum(row.initial_balance),
    institution: row.institution ?? null,
    allows_investments: row.allows_investments ?? false,
    created_at: row.created_at ?? new Date().toISOString(),
    status: (row.status as AccountStatus) ?? 'active',
    notes: row.notes ?? null,
    include_in_net_worth:
      row.include_in_net_worth === null || row.include_in_net_worth === undefined
        ? true
        : row.include_in_net_worth,
  }
}

function toInsertRow(userId: string, data: Omit<Account, 'id'>): Record<string, unknown> {
  return {
    user_id: userId,
    name: data.name,
    type: data.type,
    initial_balance: data.initial_balance,
    institution: data.institution ?? null,
    allows_investments: data.allows_investments ?? false,
    status: data.status ?? 'active',
    notes: data.notes ?? null,
    include_in_net_worth: data.include_in_net_worth !== false,
  }
}

export async function fetchAccountsForUser(
  client: SupabaseClient,
  userId: string
): Promise<{ data: Account[]; error: Error | null }> {
  const { data, error } = await client
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

  if (error) return { data: [], error: new Error(error.message) }
  return { data: (data as AccountRow[]).map(mapRowToAccount), error: null }
}

export async function insertAccount(
  client: SupabaseClient,
  userId: string,
  payload: Omit<Account, 'id'>
): Promise<{ data: Account | null; error: Error | null }> {
  const { data, error } = await client
    .from('accounts')
    .insert(toInsertRow(userId, payload))
    .select()
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: mapRowToAccount(data as AccountRow), error: null }
}

export async function updateAccountRow(
  client: SupabaseClient,
  userId: string,
  id: string,
  patch: Partial<
    Pick<
      Account,
      | 'name'
      | 'type'
      | 'initial_balance'
      | 'institution'
      | 'allows_investments'
      | 'status'
      | 'notes'
      | 'include_in_net_worth'
    >
  >
): Promise<{ data: Account | null; error: Error | null }> {
  const body: Record<string, unknown> = {}
  if (patch.name !== undefined) body.name = patch.name
  if (patch.type !== undefined) body.type = patch.type
  if (patch.initial_balance !== undefined) body.initial_balance = patch.initial_balance
  if (patch.institution !== undefined) body.institution = patch.institution
  if (patch.allows_investments !== undefined) {
    body.allows_investments = patch.allows_investments
  }
  if (patch.status !== undefined) body.status = patch.status
  if (patch.notes !== undefined) body.notes = patch.notes
  if (patch.include_in_net_worth !== undefined) {
    body.include_in_net_worth = patch.include_in_net_worth
  }

  const { data, error } = await client
    .from('accounts')
    .update(body)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: mapRowToAccount(data as AccountRow), error: null }
}

export async function deleteAccountRow(
  client: SupabaseClient,
  userId: string,
  id: string
): Promise<{ error: Error | null }> {
  const { error } = await client
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return { error: new Error(error.message) }
  return { error: null }
}
