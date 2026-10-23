import type { ReactNode } from 'react'

export type AlertCardType = 'positive' | 'warning' | 'danger'

export interface AlertCardAction {
  label: string
  to?: string
  onClick?: () => void
}

export interface DashboardFinancialAlert {
  type: AlertCardType
  title: string
  description: string
  /** Ícone customizado; se omitido, o AlertCard usa o padrão do tipo. */
  icon?: ReactNode
  action?: AlertCardAction
}
