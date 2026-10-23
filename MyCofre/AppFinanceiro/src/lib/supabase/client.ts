import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null | undefined

/**
 * Cliente Supabase para o browser (sessão em localStorage via padrão do SDK).
 * Retorna `null` se `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` não estiverem definidos.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient !== undefined) {
    return browserClient
  }
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!url || !key) {
    browserClient = null
    return null
  }
  browserClient = createClient(url, key, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  })
  return browserClient
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseBrowserClient() !== null
}
