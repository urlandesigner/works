export type TransactionType = 'income' | 'expense'

export type TransactionRecurrence = 'none' | 'monthly' | 'yearly'

export interface Transaction {
  id: string
  user_id: string
  /** Conta vinculada; null quando a transação não está vinculada a nenhuma conta. */
  account_id: string | null
  category_id: string
  type: TransactionType
  description: string | null
  amount: number
  transaction_date: string
  /** Observações ou notas da transação. */
  notes?: string | null
  /** Indica se a transação é recorrente (legado). Preferir recurrence. */
  recurring?: boolean
  /** Recorrência: none = data única, monthly = mesmo dia do mês, yearly = mesmo dia e mês. */
  recurrence?: TransactionRecurrence
  /**
   * Compra neste cartão: não entra no total de despesas do mês da visão consolidada
   * (o gasto entra pela fatura com competência no mês).
   */
  credit_card_id?: string | null
  /**
   * Ex.: pagamento de fatura — continua afetando saldo da conta, mas não o total de despesas do mês (competência).
   */
  exclude_from_month_expense_summary?: boolean | null
}
