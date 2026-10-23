import type { Goal } from '../types'

export const mockGoals: Goal[] = [
  {
    id: 'g1',
    user_id: 'u1',
    name: 'Reserva de emergência',
    target_amount: 30000,
    current_amount: 18500,
  },
  {
    id: 'g2',
    user_id: 'u1',
    name: 'Viagem',
    target_amount: 8000,
    current_amount: 3200,
  },
  {
    id: 'g3',
    user_id: 'u1',
    name: 'Primeiro milhão',
    target_amount: 1_000_000,
    current_amount: 0,
    goal_type: 'net_worth',
  },
]
