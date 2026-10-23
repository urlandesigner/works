import type { InvoiceDraft } from '../types'

const STORAGE_KEY = 'appfinanceiro.invoice-import.draft.v1'

export function saveInvoiceDraft(draft: InvoiceDraft): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function loadInvoiceDraft(): InvoiceDraft | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as InvoiceDraft
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.items)) return null
    return parsed
  } catch {
    return null
  }
}

export function clearInvoiceDraft(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export interface ConsolidatedInvoiceEntry {
  id: string
  createdAt: string
  draftId: string
  fileName: string
  referenceMonth: string | null
  dueDate: string | null
  totalSelected: number
  itemCount: number
  lines: { date: string; description: string; amount: number }[]
}

const CONSOLIDATED_KEY = 'appfinanceiro.invoice-import.last-consolidated.v1'

export function saveConsolidatedEntry(entry: ConsolidatedInvoiceEntry): void {
  localStorage.setItem(CONSOLIDATED_KEY, JSON.stringify(entry))
}

export function loadConsolidatedEntry(): ConsolidatedInvoiceEntry | null {
  const raw = localStorage.getItem(CONSOLIDATED_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ConsolidatedInvoiceEntry
  } catch {
    return null
  }
}
