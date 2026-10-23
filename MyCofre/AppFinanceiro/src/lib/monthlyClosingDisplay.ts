import type { MonthlyClosingWithDetails } from '../types/monthly-closing'

/**
 * Total em investimentos alinhado à soma das linhas do snapshot.
 * Evita divergência entre o cabeçalho e a tabela "Investimentos (snapshot)".
 */
export function totalInvestmentsFromClosingDetails(
  c: MonthlyClosingWithDetails
): number {
  const rows = c.monthly_closing_investments
  if (rows.length === 0) return c.total_investments
  return rows.reduce((sum, r) => sum + r.current_amount, 0)
}
