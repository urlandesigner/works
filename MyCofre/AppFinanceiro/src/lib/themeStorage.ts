export const THEME_STORAGE_KEY = 'appfinanceiro-theme'

export type ThemePreference = 'light' | 'dark'

export function getStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'light'
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === 'dark') return 'dark'
  } catch {
    /* ignore */
  }
  return 'light'
}

/** Aplica `class="dark"` em `<html>` conforme o tema escolhido. */
export function applyRootTheme(theme: ThemePreference): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
