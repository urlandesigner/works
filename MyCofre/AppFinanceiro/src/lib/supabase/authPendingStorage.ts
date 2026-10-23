export type PendingPasswordAction = 'recovery' | 'invite' | null

const STORAGE_KEY = 'mycofre.pendingPasswordAction'

export function readPersistedPendingPasswordAction(): PendingPasswordAction {
  if (typeof window === 'undefined') return null
  const value = sessionStorage.getItem(STORAGE_KEY)
  if (value === 'recovery' || value === 'invite') return value
  return null
}

export function persistPendingPasswordAction(
  action: PendingPasswordAction
): void {
  if (typeof window === 'undefined') return
  if (action) {
    sessionStorage.setItem(STORAGE_KEY, action)
  } else {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}
