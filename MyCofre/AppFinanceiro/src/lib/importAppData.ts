import { branding } from '../../config/branding'
import {
  APP_FINANCEIRO_BOOLEAN_PREF_KEYS,
  APP_FINANCEIRO_IMPORTABLE_KEYS,
  APP_FINANCEIRO_JSON_ARRAY_STORAGE_KEYS,
  USER_PROFILE_STORAGE_KEY,
} from './storage'

export type ImportAppFinanceiroResult =
  | { ok: true; keysWritten: number }
  | { ok: false; message: string }

function normalizeToArray(raw: unknown): unknown[] | null {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      const v = JSON.parse(raw)
      return Array.isArray(v) ? v : null
    } catch {
      return null
    }
  }
  return null
}

function normalizeToProfileObject(
  raw: unknown
): Record<string, unknown> | null {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }
  if (typeof raw === 'string') {
    try {
      const v = JSON.parse(raw)
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        return v as Record<string, unknown>
      }
    } catch {
      return null
    }
  }
  return null
}

function normalizeToBoolean(raw: unknown): boolean | null {
  if (typeof raw === 'boolean') return raw
  if (typeof raw === 'string') {
    try {
      const v = JSON.parse(raw)
      if (typeof v === 'boolean') return v
    } catch {
      return null
    }
  }
  return null
}

function prepareEntry(
  key: string,
  raw: unknown
): { ok: true; stored: string } | { ok: false; message: string } {
  if (APP_FINANCEIRO_JSON_ARRAY_STORAGE_KEYS.has(key)) {
    const arr = normalizeToArray(raw)
    if (!arr) {
      return {
        ok: false,
        message: `A chave "${key}" deve ser um array JSON.`,
      }
    }
    return { ok: true, stored: JSON.stringify(arr) }
  }
  if (key === USER_PROFILE_STORAGE_KEY) {
    const obj = normalizeToProfileObject(raw)
    if (!obj) {
      return {
        ok: false,
        message: 'O perfil (appfinanceiro.userProfile) deve ser um objeto JSON.',
      }
    }
    return { ok: true, stored: JSON.stringify(obj) }
  }
  if (APP_FINANCEIRO_BOOLEAN_PREF_KEYS.has(key)) {
    const b = normalizeToBoolean(raw)
    if (typeof b !== 'boolean') {
      return {
        ok: false,
        message: `A chave "${key}" deve ser true ou false.`,
      }
    }
    return { ok: true, stored: JSON.stringify(b) }
  }
  return { ok: false, message: `Chave não suportada: ${key}` }
}

/**
 * Grava no localStorage apenas chaves reconhecidas do app, com tipos validados.
 * Ignora chaves estranhas no JSON (não apaga o restante do localStorage).
 */
export function importAppFinanceiroDataFromObject(
  data: Record<string, unknown>
): ImportAppFinanceiroResult {
  let keysWritten = 0

  for (const [key, raw] of Object.entries(data)) {
    if (!APP_FINANCEIRO_IMPORTABLE_KEYS.has(key)) continue

    const prep = prepareEntry(key, raw)
    if (!prep.ok) return prep

    try {
      localStorage.setItem(key, prep.stored)
    } catch {
      return {
        ok: false,
        message:
          'Não foi possível gravar no armazenamento do navegador (quota ou permissão).',
      }
    }
    keysWritten++
  }

  if (keysWritten === 0) {
    return {
      ok: false,
      message:
        `Nenhuma chave reconhecida do ${branding.name} no arquivo. Confira se o backup é deste aplicativo.`,
    }
  }

  return { ok: true, keysWritten }
}
