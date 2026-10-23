import type { Category } from '../../../types'
import type { TransactionDraft } from '../types'

/**
 * Resolve uma categoria do banco a partir do rascunho (nome livre + tipo).
 * Fallback: primeira categoria do mesmo tipo.
 */
export function resolveCategoryIdForDraft(
  categories: Category[],
  draft: TransactionDraft
): string | null {
  const pool = categories.filter((c) => c.type === draft.type)
  if (pool.length === 0) return null

  const wanted = draft.category?.trim().toLowerCase()
  if (wanted) {
    const exact = pool.find((c) => c.name.trim().toLowerCase() === wanted)
    if (exact) return exact.id
    const partial = pool.find(
      (c) =>
        c.name.trim().toLowerCase().includes(wanted) ||
        wanted.includes(c.name.trim().toLowerCase())
    )
    if (partial) return partial.id
  }

  return pool[0].id
}
