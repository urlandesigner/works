import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com service role — APENAS em Route Handlers / Server Components / server utilities.
 * Nunca importar em `"use client"`.
 *
 * Env:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (segredo; não usar NEXT_PUBLIC_)
 */
/** Cliente criado com sucesso (nunca cachear `null`: evita “travar” se env aparecer depois no mesmo processo). */
let cachedClient: SupabaseClient | undefined;

export function getSupabaseServiceRoleClient(): SupabaseClient | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return null;
  }
  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cachedClient;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseServiceRoleClient() !== null;
}
