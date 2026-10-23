import type { Investment } from '../types/investment'

/**
 * Sobrescreve `current_amount` com o valor do último fechamento mensal,
 * quando existir linha em `monthly_closing_investments` para o investimento.
 */
export function mergeInvestmentsWithClosingCurrentById(
  investments: Investment[],
  closingCurrentByInvestmentId: ReadonlyMap<string, number>
): Investment[] {
  if (closingCurrentByInvestmentId.size === 0) return investments
  return investments.map((inv) => {
    const snap = closingCurrentByInvestmentId.get(inv.id)
    if (snap === undefined) return inv
    return { ...inv, current_amount: snap }
  })
}
