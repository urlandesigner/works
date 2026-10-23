import type { SupabaseClient } from '@supabase/supabase-js'
import type { Investment, InvestmentStatus, InvestmentType } from '../types/investment'

export type InvestmentRow = {
  id: string
  user_id: string
  account_id: string | null
  name: string
  type: string
  /** Valor aplicado (nome pode variar no PostgREST). */
  invested_amount?: number | string | null
  invested_value?: number | string | null
  /** Valor de mercado / atual — nome canônico no app. */
  current_amount?: number | string | null
  /** Alias comum em schemas (ex.: web / migrações). */
  current_value?: number | string | null
  created_at?: string
  institution?: string | null
  notes?: string | null
  status?: string | null
}

function parseNum(v: number | string | null | undefined): number {
  if (v == null || v === '') return 0
  if (typeof v === 'number') return v
  const n = Number.parseFloat(String(v))
  return Number.isFinite(n) ? n : 0
}

/**
 * Valor atual de mercado no patrimônio.
 * O web costuma usar `COALESCE(current_value, current_amount)` (valor de mercado primeiro).
 * Ordem antiga `current_amount ?? current_value` fazia o app somar só `current_amount` quando
 * ambos existiam — se `current_amount` estivesse defasado, a soma ficava menor que no web.
 */
function pickCurrentAmount(row: InvestmentRow): number {
  const raw = firstDefinedRaw(row, ['current_value', 'current_amount'])
  return parseNum(raw)
}

function pickInvestedAmount(row: InvestmentRow): number {
  const raw = firstDefinedRaw(row, ['invested_value', 'invested_amount'])
  return parseNum(raw)
}

/** Primeiro campo definido (não null/undefined/''), igual COALESCE no SQL. */
function firstDefinedRaw(
  row: InvestmentRow,
  keys: (keyof InvestmentRow)[]
): number | string | null | undefined {
  for (const key of keys) {
    const v = row[key]
    if (v !== undefined && v !== null && v !== '') {
      return v as number | string
    }
  }
  return undefined
}

export function mapRowToInvestment(row: InvestmentRow): Investment {
  return {
    id: row.id,
    user_id: row.user_id,
    account_id: row.account_id ?? null,
    name: row.name,
    type: row.type as InvestmentType,
    invested_amount: pickInvestedAmount(row),
    current_amount: pickCurrentAmount(row),
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

  const rows = data as InvestmentRow[]
  if (__DEV__ && rows.length > 0) {
    console.log('[investments fetch audit]', {
      count: rows.length,
      sumPickedCurrent: rows.reduce((s, r) => s + pickCurrentAmount(r), 0),
      rows: rows.map((r) => ({
        id: r.id,
        name: r.name,
        status: r.status,
        current_amount: r.current_amount,
        current_value: r.current_value,
        invested_amount: r.invested_amount,
        invested_value: r.invested_value,
        pickedCurrent: pickCurrentAmount(r),
      })),
    })
  }

  return { data: rows.map(mapRowToInvestment), error: null }
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
