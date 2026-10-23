import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Subscription,
  SubscriptionPeriodicity,
  SubscriptionStatus,
} from '../../types/subscription'

export type SubscriptionRow = {
  id: string
  user_id: string
  name: string
  monthly_amount: number | string
  periodicity?: string | null
  payment_method?: string | null
  billing_day: number
  billing_month?: number | null
  status: string
  notes?: string | null
  created_at?: string
}

function parseNum(v: number | string): number {
  if (typeof v === 'number') return v
  const n = Number.parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

export function mapRowToSubscription(row: SubscriptionRow): Subscription {
  const periodicity = (row.periodicity as SubscriptionPeriodicity | null) ?? undefined
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    monthly_amount: parseNum(row.monthly_amount),
    ...(periodicity ? { periodicity } : {}),
    payment_method: row.payment_method ?? null,
    billing_day: row.billing_day,
    billing_month: row.billing_month ?? null,
    status: row.status as SubscriptionStatus,
    notes: row.notes ?? null,
    created_at: row.created_at,
  }
}

function toInsertRow(
  userId: string,
  data: Omit<Subscription, 'id'>
): Record<string, unknown> {
  return {
    user_id: userId,
    name: data.name,
    monthly_amount: data.monthly_amount,
    periodicity: data.periodicity ?? 'monthly',
    payment_method: data.payment_method ?? null,
    billing_day: data.billing_day,
    billing_month: data.billing_month ?? null,
    status: data.status,
    notes: data.notes ?? null,
  }
}

export async function fetchSubscriptionsForUser(
  client: SupabaseClient,
  userId: string
): Promise<{ data: Subscription[]; error: Error | null }> {
  const { data, error } = await client
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })

  if (error) return { data: [], error: new Error(error.message) }
  return {
    data: (data as SubscriptionRow[]).map(mapRowToSubscription),
    error: null,
  }
}

export async function insertSubscription(
  client: SupabaseClient,
  userId: string,
  payload: Omit<Subscription, 'id'>
): Promise<{ data: Subscription | null; error: Error | null }> {
  const { data, error } = await client
    .from('subscriptions')
    .insert(toInsertRow(userId, { ...payload, user_id: userId }))
    .select()
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: mapRowToSubscription(data as SubscriptionRow), error: null }
}

export async function updateSubscriptionRow(
  client: SupabaseClient,
  userId: string,
  id: string,
  patch: Partial<
    Pick<
      Subscription,
      | 'name'
      | 'monthly_amount'
      | 'periodicity'
      | 'payment_method'
      | 'billing_day'
      | 'billing_month'
      | 'status'
      | 'notes'
    >
  >
): Promise<{ data: Subscription | null; error: Error | null }> {
  const body: Record<string, unknown> = {}
  if (patch.name !== undefined) body.name = patch.name
  if (patch.monthly_amount !== undefined) body.monthly_amount = patch.monthly_amount
  if (patch.periodicity !== undefined) body.periodicity = patch.periodicity
  if (patch.payment_method !== undefined) body.payment_method = patch.payment_method
  if (patch.billing_day !== undefined) body.billing_day = patch.billing_day
  if (patch.billing_month !== undefined) body.billing_month = patch.billing_month
  if (patch.status !== undefined) body.status = patch.status
  if (patch.notes !== undefined) body.notes = patch.notes

  const { data, error } = await client
    .from('subscriptions')
    .update(body)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: mapRowToSubscription(data as SubscriptionRow), error: null }
}

export async function deleteSubscriptionRow(
  client: SupabaseClient,
  userId: string,
  id: string
): Promise<{ error: Error | null }> {
  const { error } = await client
    .from('subscriptions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return { error: new Error(error.message) }
  return { error: null }
}
