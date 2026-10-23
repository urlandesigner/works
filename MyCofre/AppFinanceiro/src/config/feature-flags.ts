/**
 * Feature flags (Vite: variáveis `VITE_FEATURE_*`).
 * Produção típica: relatórios + assistente ativos; importações desativadas até liberação.
 */
export type FeatureFlagKey =
  | 'reports'
  | 'assistant'
  | 'import_statement'
  | 'import_invoice'

function readEnvBool(key: string, defaultValue: boolean): boolean {
  const raw = import.meta.env[key] as string | undefined
  if (raw === undefined || raw === '') return defaultValue
  const v = String(raw).trim().toLowerCase()
  return v === 'true' || v === '1' || v === 'yes'
}

export const featureFlags: Record<FeatureFlagKey, boolean> = {
  reports: readEnvBool('VITE_FEATURE_REPORTS', true),
  assistant: readEnvBool('VITE_FEATURE_ASSISTANT', true),
  import_statement: readEnvBool('VITE_FEATURE_IMPORT_STATEMENT', false),
  import_invoice: readEnvBool('VITE_FEATURE_IMPORT_INVOICE', false),
}

export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return featureFlags[flag] === true
}
