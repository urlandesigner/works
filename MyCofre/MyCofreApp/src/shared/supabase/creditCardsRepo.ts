import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreditCard, CreditCardBill } from '../types/credit-card'

export type CreditCardRow = {
  id: string
  user_id: string
  name: string
  brand: string
  last_four_digits: string
  is_active: boolean
  notes?: string | null
  created_at?: string
}

export type CreditCardBillRow = {
  id: string
  user_id: string
  credit_card_id: string
  month: number
  year: number
  amount: number | string
  is_paid: boolean
  notes?: string | null
  created_at?: string
}

function parseNum(v: number | string): number {
  if (typeof v === 'number') return v
  const n = Number.parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

export function mapRowToCard(row: CreditCardRow): CreditCard {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    lastFourDigits: row.last_four_digits,
    isActive: row.is_active,
    notes: row.notes ?? null,
  }
}

export function mapRowToBill(row: CreditCardBillRow): CreditCardBill {
  return {
    id: row.id,
    creditCardId: row.credit_card_id,
    month: row.month,
    year: row.year,
    amount: parseNum(row.amount),
    /** Só `true` explícito conta como pago (alinha a soma de dívidas ao web). */
    isPaid: row.is_paid === true,
    notes: row.notes ?? null,
  }
}

export async function fetchCreditCardsForUser(
  client: SupabaseClient,
  userId: string
): Promise<{ data: CreditCard[]; error: Error | null }> {
  const { data, error } = await client
    .from('credit_cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return { data: [], error: new Error(error.message) }
  return { data: (data as CreditCardRow[]).map(mapRowToCard), error: null }
}

export async function fetchBillsForUser(
  client: SupabaseClient,
  userId: string
): Promise<{ data: CreditCardBill[]; error: Error | null }> {
  const { data, error } = await client
    .from('credit_card_bills')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: true })
    .order('month', { ascending: true })

  if (error) return { data: [], error: new Error(error.message) }
  return { data: (data as CreditCardBillRow[]).map(mapRowToBill), error: null }
}

export async function insertCreditCard(
  client: SupabaseClient,
  userId: string,
  data: Omit<CreditCard, 'id'>
): Promise<{ data: CreditCard | null; error: Error | null }> {
  const row = {
    user_id: userId,
    name: data.name,
    brand: data.brand,
    last_four_digits: data.lastFourDigits,
    is_active: data.isActive,
    notes: data.notes ?? null,
  }
  const { data: inserted, error } = await client
    .from('credit_cards')
    .insert(row)
    .select()
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: mapRowToCard(inserted as CreditCardRow), error: null }
}

export async function updateCreditCardRow(
  client: SupabaseClient,
  userId: string,
  id: string,
  patch: Partial<Pick<CreditCard, 'name' | 'brand' | 'lastFourDigits' | 'isActive' | 'notes'>>
): Promise<{ data: CreditCard | null; error: Error | null }> {
  const body: Record<string, unknown> = {}
  if (patch.name !== undefined) body.name = patch.name
  if (patch.brand !== undefined) body.brand = patch.brand
  if (patch.lastFourDigits !== undefined) body.last_four_digits = patch.lastFourDigits
  if (patch.isActive !== undefined) body.is_active = patch.isActive
  if (patch.notes !== undefined) body.notes = patch.notes

  const { data, error } = await client
    .from('credit_cards')
    .update(body)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: mapRowToCard(data as CreditCardRow), error: null }
}

export async function deleteCreditCardRow(
  client: SupabaseClient,
  userId: string,
  id: string
): Promise<{ error: Error | null }> {
  const { error } = await client
    .from('credit_cards')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return { error: new Error(error.message) }
  return { error: null }
}

export async function insertBillRow(
  client: SupabaseClient,
  userId: string,
  data: Omit<CreditCardBill, 'id'>
): Promise<{ data: CreditCardBill | null; error: Error | null }> {
  const row = {
    user_id: userId,
    credit_card_id: data.creditCardId,
    month: data.month,
    year: data.year,
    amount: data.amount,
    is_paid: data.isPaid,
    notes: data.notes ?? null,
  }
  const { data: inserted, error } = await client
    .from('credit_card_bills')
    .insert(row)
    .select()
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: mapRowToBill(inserted as CreditCardBillRow), error: null }
}

export async function updateBillRow(
  client: SupabaseClient,
  userId: string,
  id: string,
  patch: Partial<
    Pick<CreditCardBill, 'month' | 'year' | 'amount' | 'isPaid' | 'notes' | 'creditCardId'>
  >
): Promise<{ data: CreditCardBill | null; error: Error | null }> {
  const body: Record<string, unknown> = {}
  if (patch.creditCardId !== undefined) body.credit_card_id = patch.creditCardId
  if (patch.month !== undefined) body.month = patch.month
  if (patch.year !== undefined) body.year = patch.year
  if (patch.amount !== undefined) body.amount = patch.amount
  if (patch.isPaid !== undefined) body.is_paid = patch.isPaid
  if (patch.notes !== undefined) body.notes = patch.notes

  const { data, error } = await client
    .from('credit_card_bills')
    .update(body)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: mapRowToBill(data as CreditCardBillRow), error: null }
}

export async function deleteBillRow(
  client: SupabaseClient,
  userId: string,
  id: string
): Promise<{ error: Error | null }> {
  const { error } = await client
    .from('credit_card_bills')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return { error: new Error(error.message) }
  return { error: null }
}
