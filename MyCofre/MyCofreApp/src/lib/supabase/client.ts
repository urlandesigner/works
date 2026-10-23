import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

type SupabaseExtra = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};

function getSupabaseEnv(): { url: string | undefined; anonKey: string | undefined } {
  const extra = Constants.expoConfig?.extra as SupabaseExtra | undefined;
  const url = extra?.SUPABASE_URL?.trim();
  const anonKey = extra?.SUPABASE_ANON_KEY?.trim();
  return { url, anonKey };
}

let mobileClient: SupabaseClient | null | undefined;

/**
 * Cliente Supabase para React Native (sessão em AsyncStorage).
 * Retorna `null` se `SUPABASE_URL` ou `SUPABASE_ANON_KEY` não estiverem em `expo.extra` (via `.env` + `app.config.js`).
 */
export function getSupabaseMobileClient(): SupabaseClient | null {
  if (mobileClient !== undefined) {
    return mobileClient;
  }
  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) {
    mobileClient = null;
    return null;
  }
  mobileClient = createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return mobileClient;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseMobileClient() !== null;
}
