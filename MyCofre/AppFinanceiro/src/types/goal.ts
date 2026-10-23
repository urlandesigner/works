/**
 * manual: valor atual informado e editável pelo usuário.
 * net_worth: valor atual = patrimônio total (getPatrimônio), sempre em tempo real.
 */
export type GoalType = 'manual' | 'net_worth'

export interface Goal {
  id: string
  user_id: string
  name: string
  target_amount: number
  /**
   * Para `net_worth`, ignorado na UI e no progresso; mantido no storage (ex.: 0) por compatibilidade.
   * Para `manual`, é a fonte do valor atual.
   */
  current_amount: number
  /** Ausente em metas antigas: tratar como `manual`. */
  goal_type?: GoalType
  /** Cor opcional (Supabase); não usada na UI atual. */
  color?: string | null
  /** Meta ativa (Supabase); padrão true se ausente. */
  is_active?: boolean
  /** ISO retornado pelo banco; opcional no cliente. */
  created_at?: string
}
