import type { CreditCardBill, Investment, Transaction } from '../types'

/**
 * IDs duplicados ou vazios quebram listas React e updates por id.
 * Mantém a primeira ocorrência e gera novo id para as demais.
 */
export function ensureUniqueIds<T extends { id: string }>(
  items: T[],
  newId: () => string
): { items: T[]; changed: boolean } {
  const seen = new Set<string>()
  let changed = false
  const result = items.map((item) => {
    const id = item.id?.trim() ?? ''
    if (id !== '' && !seen.has(id)) {
      seen.add(id)
      return item
    }
    changed = true
    const nextId = newId()
    seen.add(nextId)
    return { ...item, id: nextId }
  })
  return { items: result, changed }
}

/** Transações com conta inexistente viram sem conta (null), como o tipo já permite. */
export function fixTransactionAccountRefs(
  transactions: Transaction[],
  validAccountIds: Set<string>
): { items: Transaction[]; changed: boolean } {
  let changed = false
  const items = transactions.map((t) => {
    const raw = t.account_id
    if (raw == null || (typeof raw === 'string' && raw.trim() === '')) {
      if (t.account_id !== null) {
        changed = true
        return { ...t, account_id: null }
      }
      return t
    }
    const id = raw.trim()
    if (!validAccountIds.has(id)) {
      changed = true
      return { ...t, account_id: null }
    }
    if (id !== raw) {
      changed = true
      return { ...t, account_id: id }
    }
    return t
  })
  return { items, changed }
}

/** Investimentos cuja conta não existe mais distorcem totais de patrimônio. */
export function dropInvestmentsWithInvalidAccount(
  investments: Investment[],
  validAccountIds: Set<string>
): { items: Investment[]; changed: boolean } {
  const items = investments.filter((i) => {
    if (i.account_id == null) return true
    return validAccountIds.has(i.account_id)
  })
  return {
    items,
    changed: items.length !== investments.length,
  }
}

/** Faturas órfãs (cartão removido ou id inválido) são descartadas para evitar dados inconsistentes. */
export function dropOrphanCreditCardBills(
  bills: CreditCardBill[],
  validCardIds: Set<string>
): { items: CreditCardBill[]; changed: boolean } {
  const items = bills.filter((b) => validCardIds.has(b.creditCardId))
  return {
    items,
    changed: items.length !== bills.length,
  }
}
