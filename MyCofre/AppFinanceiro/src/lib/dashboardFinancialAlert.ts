import type { DashboardFinancialAlert } from '../types/alert-card'

/**
 * Só exibe o ícone discreto no header para situações que pedem atenção (warning/danger).
 * Estados positivos permanecem só implícitos na home, sem competir com as métricas.
 */
export function shouldShowDashboardAlertInHeader(
  alert: DashboardFinancialAlert
): boolean {
  return alert.type === 'warning' || alert.type === 'danger'
}

/**
 * Define o alerta estratégico único da home a partir de receitas e despesas do mês
 * (já incluindo faturas de cartão quando o dashboard soma assim).
 */
export function getDashboardFinancialAlert(params: {
  monthIncome: number
  monthExpenses: number
}): DashboardFinancialAlert {
  const { monthIncome, monthExpenses } = params
  const balance = monthIncome - monthExpenses

  const baseAction = {
    label: 'Ver transações',
    to: '/transactions',
  } as const

  if (monthIncome <= 0 && monthExpenses > 0) {
    return {
      type: 'warning',
      title: 'Receitas do mês',
      description:
        'Há despesas registradas, mas nenhuma receita neste mês. Inclua entradas para enxergar o saldo real.',
      action: baseAction,
    }
  }

  if (monthIncome <= 0 && monthExpenses <= 0) {
    return {
      type: 'positive',
      title: 'Controle financeiro saudável',
      description:
        'Sem movimentações neste mês ainda. Quando registrar receitas e despesas, mostramos sua situação aqui.',
      action: { label: 'Nova transação', to: '/transactions/new' },
    }
  }

  const ratio = monthExpenses / monthIncome

  if (monthExpenses > monthIncome || ratio >= 0.95) {
    return {
      type: 'danger',
      title: 'Gastos acima do esperado',
      description:
        'Você já comprometeu grande parte da renda do mês. Vale revisar o que ainda pode ser ajustado.',
      action: baseAction,
    }
  }

  if (ratio >= 0.7) {
    return {
      type: 'warning',
      title: 'Atenção ao ritmo de gastos',
      description:
        'Se continuar assim, você pode ultrapassar seu orçamento antes do fim do mês.',
      action: baseAction,
    }
  }

  return {
    type: 'positive',
    title: 'Controle financeiro saudável',
    description:
      balance > 0
        ? 'Seu saldo do mês está positivo e dentro do esperado.'
        : 'Suas despesas estão abaixo do ritmo de receitas — bom espaço para o restante do mês.',
    action: { label: 'Ver detalhes', to: '/transactions' },
  }
}
