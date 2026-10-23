import type { Investment } from '../types'

export const mockInvestments: Investment[] = [
  {
    id: 'inv1',
    user_id: 'u1',
    account_id: 'ac3',
    name: 'Tesouro Direto',
    type: 'fixed_income',
    invested_amount: 15000,
    current_amount: 15750,
    created_at: '2025-01-20T00:00:00Z',
    notes: null,
    institution: null,
    status: 'active',
  },
  {
    id: 'inv2',
    user_id: 'u1',
    account_id: 'ac3',
    name: 'CDB',
    type: 'fixed_income',
    invested_amount: 5000,
    current_amount: 5150,
    created_at: '2025-02-01T00:00:00Z',
    notes: null,
    institution: null,
    status: 'active',
  },
]
