import type { StatementImportTransactionType } from '../types'

/**
 * Inferência de income / expense / needs_review a partir da descrição e do trecho do valor no PDF.
 * Ordem: heurísticas de entrada → saída → sinal explícito → ambíguo = needs_review (nunca assumir despesa por padrão).
 */

const INCOME_PHRASES: string[] = [
  'salario',
  'pix recebido',
  'transferencia recebida',
  'ted recebida',
  'doc recebido',
  'deposito',
  'credito em conta',
  'rendimento',
  'estorno',
  'devolucao',
  'reembolso',
  'recebimento',
  'pagamento recebido',
  'provento',
  'proventos',
  'liquido',
  'credito salario',
]

const EXPENSE_PHRASES: string[] = [
  'pix enviado',
  'transferencia enviada',
  'transferência enviada',
  'ted enviada',
  'doc enviado',
  'debito',
  'débito',
  'debito em conta',
  'compra',
  'pagamento de',
  'pagamento a',
  'pagamento para',
  'pagamento boleto',
  'saque',
  'tarifa',
  'fatura',
  'boleto',
  'imposto',
  'ifood',
  'uber',
  '99 ',
  'farmacia',
  'farmácia',
  'mercado',
  'supermercado',
  'posto',
  'combustivel',
  'combustível',
]

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function hasPhrase(haystack: string, phrases: string[]): boolean {
  return phrases.some((p) => haystack.includes(normalize(p)))
}

export function inferTransactionType(
  rawDescription: string,
  rawAmountToken: string
): StatementImportTransactionType {
  const d = normalize(rawDescription)

  const incomeHit = hasPhrase(d, INCOME_PHRASES)
  let expenseHit = hasPhrase(d, EXPENSE_PHRASES)

  if (!expenseHit && d.includes('pagamento') && !d.includes('recebido')) {
    expenseHit = true
  }

  if (incomeHit && !expenseHit) return 'income'
  if (expenseHit && !incomeHit) return 'expense'
  if (incomeHit && expenseHit) return 'needs_review'

  const trimmed = rawAmountToken.trim()
  const explicitNegative = trimmed.startsWith('-') || /-\s*\d/.test(trimmed)
  const explicitPositive = trimmed.startsWith('+')

  if (explicitNegative) return 'expense'
  if (explicitPositive) return 'income'

  // Sem palavra-chave e sem sinal explícito: não inferir despesa
  return 'needs_review'
}

export { inferTransactionType as inferTransactionTypeFromDescription }
