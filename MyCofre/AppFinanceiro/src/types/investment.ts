export type InvestmentType = 'fixed_income' | 'variable_income' | 'crypto'

export type InvestmentStatus = 'active' | 'sold' | 'closed'

export interface Investment {
  id: string
  user_id: string
  /** Conta à qual o investimento pertence (ex.: corretora). */
  account_id: string | null
  name: string
  type: InvestmentType
  invested_amount: number
  current_amount: number
  created_at?: string
  /** Observações sobre o investimento. */
  notes?: string | null
  /** Instituição (ex.: corretora), quando diferente da conta. */
  institution?: string | null
  /** Status do investimento. */
  status?: InvestmentStatus | null
}
