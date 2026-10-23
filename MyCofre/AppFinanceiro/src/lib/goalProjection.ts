import type { Goal } from '../types'
import { getGoalProgressPercentUI } from './goalProgress'

/**
 * Escolhe a meta para projeção na home: primeira (ordem da lista) ainda não atingida.
 * Usa o mesmo valor atual que a tela de metas (`getGoalCurrentAmount`).
 * Se todas estiverem atingidas, usa a primeira meta válida para mensagem de “já concluída”.
 */
export function selectGoalForDashboardProjection(
  goals: Goal[],
  getCurrent: (g: Goal) => number
): Goal | null {
  const withTarget = goals.filter((g) => g.target_amount > 0)
  if (withTarget.length === 0) return null
  return (
    withTarget.find((g) => getCurrent(g) < g.target_amount) ?? withTarget[0]
  )
}

/** Texto amigável para o tempo estimado a partir de meses decimais. */
export function formatGoalHorizonMonths(monthsDecimal: number): string {
  if (!Number.isFinite(monthsDecimal) || monthsDecimal <= 0) {
    return 'menos de um mês'
  }
  if (monthsDecimal < 1 / 30) {
    return 'menos de um mês'
  }
  if (monthsDecimal < 1) {
    const days = Math.max(1, Math.ceil(monthsDecimal * 30))
    return days === 1 ? 'cerca de 1 dia' : `cerca de ${days} dias`
  }
  const wholeMonths = Math.ceil(monthsDecimal)
  if (wholeMonths < 24) {
    return wholeMonths === 1
      ? 'cerca de 1 mês'
      : `cerca de ${wholeMonths} meses`
  }
  const years = Math.floor(wholeMonths / 12)
  const rem = wholeMonths % 12
  if (rem === 0) {
    return years === 1 ? 'cerca de 1 ano' : `cerca de ${years} anos`
  }
  return `cerca de ${years} ${years === 1 ? 'ano' : 'anos'} e ${rem} ${rem === 1 ? 'mês' : 'meses'}`
}

export type GoalProjectionView =
  | { kind: 'no_goals' }
  | { kind: 'achieved'; goal: Goal; current: number; progressPct: number }
  | {
      kind: 'no_positive_flow'
      goal: Goal
      remaining: number
      monthBalance: number
      progressPct: number
    }
  | {
      kind: 'projected'
      goal: Goal
      remaining: number
      monthBalance: number
      monthsDecimal: number
      horizonLabel: string
      progressPct: number
    }

export function computeGoalProjectionView(
  goal: Goal | null,
  currentAmount: number,
  monthBalance: number
): GoalProjectionView {
  if (!goal || goal.target_amount <= 0) {
    return { kind: 'no_goals' }
  }

  const progressPct = getGoalProgressPercentUI(goal, currentAmount)
  const remaining = goal.target_amount - currentAmount

  if (remaining <= 0) {
    return { kind: 'achieved', goal, current: currentAmount, progressPct }
  }

  if (monthBalance <= 0) {
    return {
      kind: 'no_positive_flow',
      goal,
      remaining,
      monthBalance,
      progressPct,
    }
  }

  const monthsDecimal = remaining / monthBalance
  return {
    kind: 'projected',
    goal,
    remaining,
    monthBalance,
    monthsDecimal,
    horizonLabel: formatGoalHorizonMonths(monthsDecimal),
    progressPct,
  }
}
