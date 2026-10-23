import type { SupabaseClient } from '@supabase/supabase-js'

/** Linha em `public.profiles` (complemento ao Auth). */
export type ProfileRow = {
  id: string
  full_name?: string | null
  phone?: string | null
  avatar_url?: string | null
  updated_at?: string | null
}

export async function fetchProfileRow(
  client: SupabaseClient,
  userId: string
): Promise<{ data: ProfileRow | null; error: Error | null }> {
  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, phone, avatar_url, updated_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: data as ProfileRow | null, error: null }
}

export async function upsertProfileRow(
  client: SupabaseClient,
  userId: string,
  patch: { full_name: string; phone: string }
): Promise<{ error: Error | null }> {
  const row = {
    id: userId,
    full_name: patch.full_name,
    phone: patch.phone,
    updated_at: new Date().toISOString(),
  }
  const { error } = await client.from('profiles').upsert(row, {
    onConflict: 'id',
  })

  if (error) return { error: new Error(error.message) }
  return { error: null }
}
