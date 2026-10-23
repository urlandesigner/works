import { useMemo } from 'react'
import { useInvestments } from '../contexts/InvestmentsContext'
import { useLatestClosingInvestmentCurrentMap } from './useLatestClosingInvestmentCurrentMap'
import { mergeInvestmentsWithClosingCurrentById } from '../lib/investmentClosingOverlay'

/**
 * Fonte única para investimentos usados no cálculo de patrimônio líquido:
 * aplica snapshot de fechamento mensal quando disponível.
 */
export function useInvestmentsForNetWorth() {
  const { investments, loading: investmentsLoading } = useInvestments()
  const { map: closingInvCurrentMap, loading: closingInvSnapshotLoading } =
    useLatestClosingInvestmentCurrentMap({
      investmentCount: investments.length,
    })

  const investmentsForNetWorth = useMemo(
    () => mergeInvestmentsWithClosingCurrentById(investments, closingInvCurrentMap),
    [investments, closingInvCurrentMap]
  )

  return {
    investments,
    investmentsForNetWorth,
    investmentsLoading,
    closingInvSnapshotLoading,
  }
}
