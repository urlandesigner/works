import { getSupabase } from '@/integrations/supabase/client';
import type { CardsRow, TrendRow, ChannelMetricRow, PageMetricRow } from '@/types/db';

const PAGES_LIMIT = 10;

export const siteDetailRepository = {
  async getCards(siteId: string, days: number): Promise<CardsRow | null> {
    const { data, error } = await getSupabase().rpc('get_site_cards', {
      p_site_id: siteId,
      p_days: days,
    });
    if (error) throw error;
    const rows = (data ?? []) as CardsRow[];
    return rows[0] ?? null;
  },

  async getTrend(siteId: string, days: number): Promise<TrendRow[]> {
    const { data, error } = await getSupabase().rpc('get_site_trend', {
      p_site_id: siteId,
      p_days: days,
    });
    if (error) throw error;
    return (data ?? []) as TrendRow[];
  },

  async getChannels(siteId: string, days: number): Promise<ChannelMetricRow[]> {
    const { data, error } = await getSupabase().rpc('get_site_channels', {
      p_site_id: siteId,
      p_days: days,
    });
    if (error) throw error;
    return (data ?? []) as ChannelMetricRow[];
  },

  async getPages(siteId: string, days: number): Promise<PageMetricRow[]> {
    const { data, error } = await getSupabase().rpc('get_site_pages', {
      p_site_id: siteId,
      p_days: days,
      p_limit: PAGES_LIMIT,
    });
    if (error) throw error;
    return (data ?? []) as PageMetricRow[];
  },
};
