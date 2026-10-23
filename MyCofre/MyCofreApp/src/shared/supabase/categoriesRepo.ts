import type { SupabaseClient } from '@supabase/supabase-js'
import type { Category, CategoryType } from '../types/category'

export type CategoryRow = {
  id: string
  user_id: string
  name: string
  type: string
}

export function mapRowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    type: row.type as CategoryType,
  }
}

export async function fetchCategoriesForUser(
  client: SupabaseClient,
  userId: string
): Promise<{ data: Category[]; error: Error | null }> {
  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })

  if (error) return { data: [], error: new Error(error.message) }
  return { data: (data as CategoryRow[]).map(mapRowToCategory), error: null }
}
