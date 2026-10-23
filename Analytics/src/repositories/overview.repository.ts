import { getSupabase } from '@/integrations/supabase/client';
import type { OverviewRow } from '@/types/db';

// Chama a RPC que agrega o portfólio (variação 7v7 + attention_reason no banco).
export const overviewRepository = {
  async get(days: number): Promise<OverviewRow[]> {
    const { data, error } = await getSupabase().rpc('get_portfolio_overview', { p_days: days });
    if (error) throw error;
    return (data ?? []) as OverviewRow[];
  },
};
