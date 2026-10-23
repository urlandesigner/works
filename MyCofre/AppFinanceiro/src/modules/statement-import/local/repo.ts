import type { StatementImportItemDraft } from '../types'

const STORAGE_KEY = 'appfinanceiro.statement-import.draft.v1'

export interface LocalStatementImportDraft {
  id: string
  fileName: string
  rawText: string
  createdAt: string
  items: StatementImportItemDraft[]
}

export function createLocalDraft(
  fileName: string,
  rawText: string,
  items: StatementImportItemDraft[]
): LocalStatementImportDraft {
  return {
    id: crypto.randomUUID(),
    fileName,
    rawText,
    createdAt: new Date().toISOString(),
    items,
  }
}

export function saveLocalDraft(draft: LocalStatementImportDraft): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function loadLocalDraft(): LocalStatementImportDraft | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as LocalStatementImportDraft
    if (!parsed || typeof parsed !== 'object') return null
    if (!Array.isArray(parsed.items)) return null
    return parsed
  } catch {
    return null
  }
}

export function clearLocalDraft(): void {
  localStorage.removeItem(STORAGE_KEY)
}
