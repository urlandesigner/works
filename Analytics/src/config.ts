// Modo mock: ativo quando o Supabase não está configurado (desenvolvimento sem backend).
// Permite rodar a Home com dados mockados antes da integração real.
export const USE_MOCKS = !(
  import.meta.env.VITE_SUPABASE_URL &&
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY)
);
