import type {
  Account,
  CreditCardBill,
  Goal,
  Investment,
  Transaction,
} from './types'
import type { GoalType } from './types/goal'
import { getNetPatrimony } from './balance'

/** Tipo efetivo da meta (metas legadas sem `goal_type` = manual). */
export function getGoalType(goal: Goal): GoalType {
  return goal.goal_type ?? 'manual'
}

/**
 * Valor atual usado no progresso da meta.
 * `net_worth` → patrimônio líquido (caixa + investimentos − faturas de cartão em aberto),
 * mesma base da visão geral.
 */
export function getGoalCurrentAmount(
  goal: Goal,
  accounts: Account[],
  transactions: Transaction[],
  investments: Investment[],
  creditCardBills: CreditCardBill[]
): number {
  if (getGoalType(goal) === 'net_worth') {
    return getNetPatrimony(
      accounts,
      transactions,
      investments,
      creditCardBills
    )
  }
  return goal.current_amount
}

/** Razão atual ÷ meta (pode ser > 1 se a meta foi ultrapassada). */
export function getGoalProgressRatio(goal: Goal, currentAmount: number): number {
  if (goal.target_amount <= 0) return 0
  return currentAmount / goal.target_amount
}

/** Percentual para barra de progresso na UI (limitado a 100%). */
export function getGoalProgressPercentUI(goal: Goal, currentAmount: number): number {
  return Math.min(100, getGoalProgressRatio(goal, currentAmount) * 100)
}
