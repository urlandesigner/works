import type { Transaction } from '../types'

/**
 * Dicas de texto → categoria (mock).
 * Evoluir para serviço/ML; manter padrões em PT-BR.
 */
const DESCRIPTION_CATEGORY_HINTS: {
  pattern: RegExp
  categoryId: string
  types?: ('income' | 'expense')[]
}[] = [
  {
    pattern: /ifood|rappi|uber\s*eats|delivery|zé\s*delivery|zap\s*delivery/i,
    categoryId: 'cat3',
    types: ['expense'],
  },
  {
    pattern: /\buber\b|99\s*taxi|99pop|cabify|taxi|ônibus|metrô|combustível|posto/i,
    categoryId: 'cat4',
    types: ['expense'],
  },
  {
    pattern: /supermercado|mercado|padaria|açougue|restaurante|lanchonete/i,
    categoryId: 'cat3',
    types: ['expense'],
  },
  {
    pattern: /salário|holerite|decimo|13o|13º|folha/i,
    categoryId: 'cat1',
    types: ['income'],
  },
  {
    pattern: /freelance|faturamento|nota\s*fiscal|projeto|cliente/i,
    categoryId: 'cat2',
    types: ['income'],
  },
  {
    pattern: /aluguel|condomínio|iptu|luz|água|energia|internet|gás/i,
    categoryId: 'cat5',
    types: ['expense'],
  },
  {
    pattern: /cinema|netflix|spotify|show|bar\b|festa|viagem/i,
    categoryId: 'cat6',
    types: ['expense'],
  },
]

/**
 * Sugere id de categoria a partir da descrição (regras simples).
 * Retorna undefined se não houver match ou tipo incompatível.
 */
export function suggestCategoryIdFromDescription(
  raw: string,
  transactionType: 'income' | 'expense'
): string | undefined {
  const text = raw.trim()
  if (!text) return undefined
  for (const hint of DESCRIPTION_CATEGORY_HINTS) {
    if (hint.types && !hint.types.includes(transactionType)) continue
    if (hint.pattern.test(text)) return hint.categoryId
  }
  return undefined
}

/**
 * Conta mais usada em transações recentes (apenas contas ainda existentes).
 */
export function getMostUsedAccountId(
  transactions: Transaction[],
  validAccountIds: Set<string>
): string {
  const counts = new Map<string, number>()
  for (const t of transactions) {
    if (t.account_id == null || !validAccountIds.has(t.account_id)) continue
    counts.set(t.account_id, (counts.get(t.account_id) ?? 0) + 1)
  }
  let best = ''
  let max = 0
  for (const [id, n] of counts) {
    if (n > max) {
      max = n
      best = id
    }
  }
  return best
}
