import type {
  Account,
  Transaction,
  Investment,
  Goal,
  CreditCard,
  CreditCardBill,
  UserProfile,
} from '../types'
import { DEFAULT_USER_PROFILE } from '../types/user-profile'

const KEY_ACCOUNTS = 'appfinanceiro.accounts'
const KEY_TRANSACTIONS = 'appfinanceiro.transactions'
const KEY_INVESTMENTS = 'appfinanceiro.investments'
const KEY_GOALS = 'appfinanceiro.goals'
const KEY_CREDIT_CARDS = 'appfinanceiro.creditCards'
const KEY_CREDIT_CARD_BILLS = 'appfinanceiro.creditCardBills'
const KEY_VALUES_HIDDEN = 'appfinanceiro.valuesHidden'
const KEY_SIDEBAR_EXPANDED = 'appfinanceiro.sidebarExpanded'

/** Chave do perfil (nome, e-mail, telefone). Deve existir — ausência quebrava o save silenciosamente (ReferenceError no catch). */
export const USER_PROFILE_STORAGE_KEY = 'appfinanceiro.userProfile' as const

/** Chaves que a importação em Configurações pode gravar (evita sobrescrever outras chaves do localStorage). */
export const APP_FINANCEIRO_IMPORTABLE_KEYS: ReadonlySet<string> = new Set([
  KEY_ACCOUNTS,
  KEY_TRANSACTIONS,
  KEY_INVESTMENTS,
  KEY_GOALS,
  KEY_CREDIT_CARDS,
  KEY_CREDIT_CARD_BILLS,
  KEY_VALUES_HIDDEN,
  KEY_SIDEBAR_EXPANDED,
  USER_PROFILE_STORAGE_KEY,
])

/** Valores que devem ser arrays JSON ao importar. */
export const APP_FINANCEIRO_JSON_ARRAY_STORAGE_KEYS: ReadonlySet<string> =
  new Set([
    KEY_ACCOUNTS,
    KEY_TRANSACTIONS,
    KEY_INVESTMENTS,
    KEY_GOALS,
    KEY_CREDIT_CARDS,
    KEY_CREDIT_CARD_BILLS,
  ])

/** Preferências booleanas importáveis (valores hidden, sidebar). */
export const APP_FINANCEIRO_BOOLEAN_PREF_KEYS: ReadonlySet<string> = new Set([
  KEY_VALUES_HIDDEN,
  KEY_SIDEBAR_EXPANDED,
])

/** Resultado explícito da gravação do perfil (quota, segurança, etc.). */
export type SaveUserProfileResult =
  | { ok: true }
  | {
      ok: false
      reason:
        | 'quota'
        | 'security'
        | 'serialize'
        | 'unknown'
        | 'auth'
        | 'network'
        | 'not_configured'
      /** Mensagem segura para exibir ao usuário */
      userMessage: string
    }

function estimateAppFinanceiroStorageChars(): number {
  let total = 0
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k == null || !k.startsWith('appfinanceiro.')) continue
      const v = localStorage.getItem(k) ?? ''
      total += k.length + v.length
    }
  } catch {
    /* localStorage indisponível */
  }
  return total
}

function logUserProfileStorageFailure(
  phase: 'getItem' | 'parse' | 'stringify' | 'setItem',
  err: unknown,
  meta?: { payloadBytes?: number; rawPreview?: string }
) {
  const debug =
    import.meta.env.DEV ||
    (typeof localStorage !== 'undefined' &&
      localStorage.getItem('appfinanceiro.debugProfileStorage') === '1')
  if (!debug) return

  console.error('[MyCofre][UserProfile]', {
    phase,
    key: USER_PROFILE_STORAGE_KEY,
    payloadBytes: meta?.payloadBytes ?? meta?.rawPreview?.length ?? 0,
    rawPreview: meta?.rawPreview,
    approxAppFinanceiroChars: estimateAppFinanceiroStorageChars(),
    error:
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : err,
  })
}

/**
 * Grava perfil (somente texto) com tratamento explícito de erros.
 * Não inclui foto nem campos extras — objeto serializado é sempre pequeno.
 */
export function saveUserProfileToStorage(profile: UserProfile): SaveUserProfileResult {
  const light: Record<string, string> = {
    name: String(profile.name ?? ''),
    email: String(profile.email ?? ''),
    phone: String(profile.phone ?? ''),
  }
  if (profile.updated_at) {
    light.updated_at = String(profile.updated_at)
  }

  let json: string
  try {
    json = JSON.stringify(light)
  } catch (err) {
    logUserProfileStorageFailure('stringify', err)
    return {
      ok: false,
      reason: 'serialize',
      userMessage:
        'Não foi possível preparar os dados do perfil. Tente novamente.',
    }
  }

  try {
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, json)
    return { ok: true }
  } catch (err) {
    logUserProfileStorageFailure('setItem', err, { payloadBytes: json.length })

    if (err instanceof DOMException) {
      if (
        err.name === 'QuotaExceededError' ||
        err.code === 22 ||
        err.code === 1014
      ) {
        return {
          ok: false,
          reason: 'quota',
          userMessage:
            'O armazenamento do navegador está cheio. Libere espaço (dados do site ou outras abas) e tente de novo.',
        }
      }
      if (err.name === 'SecurityError') {
        return {
          ok: false,
          reason: 'security',
          userMessage:
            'O navegador bloqueou o armazenamento local. Verifique permissões ou se o app não está em modo restrito.',
        }
      }
    }

    const msg = err instanceof Error ? err.message : String(err)
    if (/quota|exceeded|storage.*full/i.test(msg)) {
      return {
        ok: false,
        reason: 'quota',
        userMessage:
          'Armazenamento cheio. Reduza dados salvos pelo app ou limpe o histórico deste site.',
      }
    }

    return {
      ok: false,
      reason: 'unknown',
      userMessage:
        'Não foi possível salvar o perfil. Tente novamente ou use outro navegador.',
    }
  }
}

/** Sem dados salvos ou JSON inválido: retorna array vazio (início limpo para uso real). */
function safeParse<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed as T[]
  } catch {
    return []
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignora falha de quota ou localStorage desabilitado (POC)
  }
}

export function getAccounts(): Account[] {
  return safeParse<Account>(KEY_ACCOUNTS)
}

export function setAccounts(accounts: Account[]): void {
  safeSet(KEY_ACCOUNTS, accounts)
}

export function getTransactions(): Transaction[] {
  return safeParse<Transaction>(KEY_TRANSACTIONS)
}

export function setTransactions(transactions: Transaction[]): void {
  safeSet(KEY_TRANSACTIONS, transactions)
}

export function getInvestments(): Investment[] {
  return safeParse<Investment>(KEY_INVESTMENTS)
}

export function setInvestments(investments: Investment[]): void {
  safeSet(KEY_INVESTMENTS, investments)
}

export function getGoals(): Goal[] {
  return safeParse<Goal>(KEY_GOALS)
}

export function setGoals(goals: Goal[]): void {
  safeSet(KEY_GOALS, goals)
}

export function getCreditCards(): CreditCard[] {
  return safeParse<CreditCard>(KEY_CREDIT_CARDS)
}

export function setCreditCards(cards: CreditCard[]): void {
  safeSet(KEY_CREDIT_CARDS, cards)
}

export function getCreditCardBills(): CreditCardBill[] {
  return safeParse<CreditCardBill>(KEY_CREDIT_CARD_BILLS)
}

export function setCreditCardBills(bills: CreditCardBill[]): void {
  safeSet(KEY_CREDIT_CARD_BILLS, bills)
}

/** Preferência global: esconder valores monetários na interface. */
export function getValuesHidden(): boolean {
  try {
    const raw = localStorage.getItem(KEY_VALUES_HIDDEN)
    if (raw == null) return false
    return JSON.parse(raw) === true
  } catch {
    return false
  }
}

export function setValuesHidden(hidden: boolean): void {
  safeSet(KEY_VALUES_HIDDEN, hidden)
}

/** Sidebar expandido (true) ou colapsado (false). Default true. */
export function getSidebarExpanded(): boolean {
  try {
    const raw = localStorage.getItem(KEY_SIDEBAR_EXPANDED)
    if (raw == null) return true
    return JSON.parse(raw) === true
  } catch {
    return true
  }
}

export function setSidebarExpanded(expanded: boolean): void {
  safeSet(KEY_SIDEBAR_EXPANDED, expanded)
}

/**
 * Perfil (somente texto). Ignora chaves legadas (ex.: avatar em base64).
 * Parse inválido ou `localStorage` indisponível → defaults (sem apagar outras chaves).
 */
export function getUserProfile(): UserProfile {
  let raw: string | null
  try {
    raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY)
  } catch (err) {
    logUserProfileStorageFailure('getItem', err)
    return { ...DEFAULT_USER_PROFILE }
  }

  if (raw == null) return { ...DEFAULT_USER_PROFILE }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    logUserProfileStorageFailure('parse', err, {
      payloadBytes: raw.length,
      rawPreview: raw.length > 200 ? `${raw.slice(0, 200)}…` : raw,
    })
    return { ...DEFAULT_USER_PROFILE }
  }

  if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    if (import.meta.env.DEV) {
      console.warn(
        '[MyCofre][UserProfile] Formato inesperado — usando defaults',
        { key: USER_PROFILE_STORAGE_KEY }
      )
    }
    return { ...DEFAULT_USER_PROFILE }
  }

  const p = parsed as Record<string, unknown>
  return {
    name: typeof p.name === 'string' ? p.name : DEFAULT_USER_PROFILE.name,
    email: typeof p.email === 'string' ? p.email : DEFAULT_USER_PROFILE.email,
    phone: typeof p.phone === 'string' ? p.phone : DEFAULT_USER_PROFILE.phone,
    updated_at:
      typeof p.updated_at === 'string' ? p.updated_at : undefined,
  }
}

/** Compat: retorna só sucesso/fracasso. Preferir `saveUserProfileToStorage` para mensagens. */
export function setUserProfile(profile: UserProfile): boolean {
  return saveUserProfileToStorage(profile).ok
}
