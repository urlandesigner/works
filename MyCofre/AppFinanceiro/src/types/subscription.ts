export type SubscriptionStatus = 'active' | 'inactive'

export type SubscriptionPeriodicity = 'monthly' | 'annual'

export interface Subscription {
  id: string
  user_id: string
  name: string
  /** Valor cobrado por período: por mês (periodicity monthly) ou por ano (periodicity annual). */
  monthly_amount: number
  /** Periodicidade da cobrança. Ausente = mensal (retrocompat). */
  periodicity?: SubscriptionPeriodicity
  /** Forma de pagamento em texto livre (ex.: Nubank, Cartão Caixa, Débito automático). */
  payment_method?: string | null
  billing_day: number
  /** Mês da cobrança (1-12). Obrigatório quando periodicity = annual. */
  billing_month?: number | null
  status: SubscriptionStatus
  notes?: string | null
  created_at?: string
}
