import type { SupabaseClient } from '@supabase/supabase-js'
import type { Goal, GoalType } from '../../types/goal'

export type GoalRow = {
  id: string
  user_id: string
  name: string
  target_amount: number | string
  current_amount: number | string
  color: string | null
  is_active: boolean
  created_at?: string
  /** Coluna adicionada na migração; se ausente no banco, o app assume `manual`. */
  goal_type?: string | null
}

function parseNumeric(value: number | string): number {
  if (typeof value === 'number') return value
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

function normalizeGoalType(raw: string | null | undefined): GoalType | undefined {
  if (raw === 'net_worth' || raw === 'manual') return raw
  return undefined
}

/** Linha do PostgREST → modelo do app. */
export function mapRowToGoal(row: GoalRow): Goal {
  const goalType = normalizeGoalType(row.goal_type ?? undefined)
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    target_amount: parseNumeric(row.target_amount),
    current_amount: parseNumeric(row.current_amount),
    ...(goalType !== undefined ? { goal_type: goalType } : {}),
    color: row.color ?? null,
    is_active: row.is_active ?? true,
    ...(row.created_at ? { created_at: row.created_at } : {}),
  }
}

function goalToInsertRow(
  userId: string,
  data: Omit<Goal, 'id'>
): Record<string, unknown> {
  return {
    user_id: userId,
    name: data.name,
    target_amount: data.target_amount,
    current_amount: data.current_amount,
    color: data.color ?? null,
    is_active: data.is_active ?? true,
    goal_type: data.goal_type ?? 'manual',
  }
}

export async function fetchGoalsForUser(
  client: SupabaseClient,
  userId: string
): Promise<{ data: Goal[]; error: Error | null }> {
  const { data, error } = await client
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

  if (error) {
    return { data: [], error: new Error(error.message) }
  }
  const rows = (data ?? []) as GoalRow[]
  return { data: rows.map(mapRowToGoal), error: null }
}

export async function insertGoal(
  client: SupabaseClient,
  userId: string,
  payload: Omit<Goal, 'id'>
): Promise<{ data: Goal | null; error: Error | null }> {
  const row = goalToInsertRow(userId, payload)

  const { data, error } = await client
    .from('goals')
    .insert(row)
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }
  return { data: mapRowToGoal(data as GoalRow), error: null }
}

export async function updateGoalRow(
  client: SupabaseClient,
  userId: string,
  id: string,
  patch: Partial<
    Pick<
      Goal,
      | 'name'
      | 'target_amount'
      | 'current_amount'
      | 'goal_type'
      | 'color'
      | 'is_active'
    >
  >
): Promise<{ data: Goal | null; error: Error | null }> {
  const body: Record<string, unknown> = {}

  if (patch.name !== undefined) body.name = patch.name
  if (patch.target_amount !== undefined) body.target_amount = patch.target_amount
  if (patch.current_amount !== undefined) {
    body.current_amount = patch.current_amount
  }
  if (patch.goal_type !== undefined) body.goal_type = patch.goal_type
  if (patch.color !== undefined) body.color = patch.color
  if (patch.is_active !== undefined) body.is_active = patch.is_active

  const { data, error } = await client
    .from('goals')
    .update(body)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }
  return { data: mapRowToGoal(data as GoalRow), error: null }
}

export async function deleteGoalRow(
  client: SupabaseClient,
  userId: string,
  id: string
): Promise<{ error: Error | null }> {
  const { error } = await client
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    return { error: new Error(error.message) }
  }
  return { error: null }
}
