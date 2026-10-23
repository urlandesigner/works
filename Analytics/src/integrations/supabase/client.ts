import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Construção lazy: só instancia quando algo realmente usa o Supabase.
// Em modo mock (sem env), nunca é chamado — a Home roda sem backend.
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const publicKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !publicKey) {
    throw new Error(
      'Supabase não configurado: defina VITE_SUPABASE_URL e uma chave pública em .env.local',
    );
  }

  client = createClient(url, publicKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}
