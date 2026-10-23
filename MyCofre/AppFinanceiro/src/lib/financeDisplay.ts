/**
 * Padrão visual para valores monetários (Tailwind).
 * Receita/entrada → verde (emerald, alinhado a feedback de sucesso).
 * Despesa/saída → vermelho (danger, alinhado a feedback de erro).
 */
export const financeIncomeAmount =
  'font-semibold tabular-nums text-emerald-600 dark:text-emerald-400' as const

export const financeExpenseAmount =
  'font-semibold tabular-nums text-danger-600 dark:text-red-400' as const

/** Mesmo padrão com `text-sm` (listas compactas). */
export const financeIncomeAmountSm =
  'text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400' as const

export const financeExpenseAmountSm =
  'text-sm font-semibold tabular-nums text-danger-600 dark:text-red-400' as const

/** Listas com font-display (ex.: últimas transações no dashboard). */
export const financeIncomeAmountDisplay =
  'font-display text-sm font-semibold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400' as const

export const financeExpenseAmountDisplay =
  'font-display text-sm font-semibold tabular-nums tracking-tight text-danger-600 dark:text-red-400' as const

export const financeIncomeIconWrap =
  'shrink-0 rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-200 dark:ring-1 dark:ring-emerald-400/20' as const

export const financeExpenseIconWrap =
  'shrink-0 rounded-full bg-red-100 p-2 text-danger-600 dark:bg-red-950/45 dark:text-red-200 dark:ring-1 dark:ring-red-400/20' as const

/** Rentabilidade / ganho (valor absoluto ou % positivo). */
export const financeGainText =
  'text-emerald-600 dark:text-emerald-400' as const

/** Prejuízo em rentabilidade. */
export const financeLossText = 'text-danger-600 dark:text-red-400' as const
