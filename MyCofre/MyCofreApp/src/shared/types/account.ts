export type AccountType = 'checking' | 'savings' | 'investment' | 'other'

export type AccountStatus = 'active' | 'closed'

export interface Account {
  id: string
  user_id: string
  name: string
  /** Nome da instituição (banco, corretora, etc.). */
  institution?: string | null
  type: AccountType
  initial_balance: number
  /** Indica se a conta pode ter investimentos vinculados (ex.: corretora). */
  allows_investments: boolean
  created_at: string
  /** Status da conta. */
  status?: AccountStatus | null
  /** Observações sobre a conta. */
  notes?: string | null
}
