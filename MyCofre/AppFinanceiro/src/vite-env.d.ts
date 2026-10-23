/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_APP_URL?: string
  readonly VITE_FEATURE_REPORTS?: string
  readonly VITE_FEATURE_ASSISTANT?: string
  readonly VITE_FEATURE_IMPORT_STATEMENT?: string
  readonly VITE_FEATURE_IMPORT_INVOICE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
