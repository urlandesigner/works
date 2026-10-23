import type { TransactionDraft } from '../types'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/** Linha de destaque: "Despesa • R$ 100,00 • Alimentação" */
export function formatPreviewSummaryLine(
  draft: Pick<TransactionDraft, 'type' | 'amount' | 'category'>
): string {
  const tipo = draft.type === 'income' ? 'Receita' : 'Despesa'
  const valor = BRL.format(draft.amount || 0)
  const cat = draft.category?.trim() || 'Sem categoria'
  return `${tipo} • ${valor} • ${cat}`
}
