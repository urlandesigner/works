export type MonthlyClosing = {
  id: string
  user_id: string
  year: number
  month: number
  closed_at: string | null
  created_at?: string | null
  total_accounts: number
  total_investments: number
  patrimony_total: number
  month_income: number
  month_expenses: number
  month_balance: number
  notes: string | null
}

export type MonthlyClosingAccount = {
  id: string
  closing_id: string
  user_id: string
  account_id: string | null
  account_name: string
  account_type: string | null
  institution: string | null
  balance: number
  created_at: string
}

export type MonthlyClosingInvestment = {
  id: string
  closing_id: string
  user_id: string
  investment_id: string | null
  investment_name: string
  investment_type: string | null
  institution: string | null
  invested_amount: number
  current_amount: number
  created_at: string
}

export type MonthlyClosingWithDetails = MonthlyClosing & {
  monthly_closing_accounts: MonthlyClosingAccount[]
  monthly_closing_investments: MonthlyClosingInvestment[]
}

