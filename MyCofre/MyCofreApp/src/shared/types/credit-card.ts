export interface CreditCard {
  id: string
  name: string
  brand: string
  lastFourDigits: string
  isActive: boolean
  notes?: string | null
}

export interface CreditCardBill {
  id: string
  creditCardId: string
  month: number
  year: number
  amount: number
  isPaid: boolean
  notes?: string | null
}
