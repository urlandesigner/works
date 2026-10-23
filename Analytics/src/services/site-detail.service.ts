import { siteDetailRepository } from '@/repositories/site-detail.repository';
import { toVariation } from '@/lib/variation';
import type { SiteDetail, SiteCards, MetricPair } from '@/types';
import type { CardsRow } from '@/types/db';

const EMPTY_PAIR: MetricPair = { atual: 0, anterior: 0, variation: { pct: null, direction: 'new' } };

function toCards(row: CardsRow | null): SiteCards {
  if (!row) {
    return { usuarios: EMPTY_PAIR, sessoes: EMPTY_PAIR, pageviews: EMPTY_PAIR, conversoes: EMPTY_PAIR };
  }
  return {
    usuarios: {
      atual: row.usuarios_atual,
      anterior: row.usuarios_anterior,
      variation: toVariation(row.var_usuarios),
    },
    sessoes: {
      atual: row.sessoes_atual,
      anterior: row.sessoes_anterior,
      variation: toVariation(row.var_sessoes),
    },
    pageviews: {
      atual: row.pageviews_atual,
      anterior: row.pageviews_anterior,
      variation: toVariation(row.var_pageviews),
    },
    conversoes: {
      atual: row.conversoes_atual,
      anterior: row.conversoes_anterior,
      variation: toVariation(row.var_conversoes),
    },
  };
}

export const siteDetailService = {
  async get(siteId: string, days: number): Promise<SiteDetail> {
    const [cards, trend, channels, pages] = await Promise.all([
      siteDetailRepository.getCards(siteId, days),
      siteDetailRepository.getTrend(siteId, days),
      siteDetailRepository.getChannels(siteId, days),
      siteDetailRepository.getPages(siteId, days),
    ]);

    return {
      cards: toCards(cards),
      trend: trend.map((t) => ({
        dia: t.dia,
        atual: t.usuarios_atual,
        anterior: t.usuarios_anterior,
      })),
      channels: channels.map((c) => ({
        canal: c.canal,
        usuarios: c.usuarios,
        sessoes: c.sessoes,
        conversoes: c.conversoes,
        varUsuarios: toVariation(c.var_usuarios),
      })),
      pages: pages.map((p) => ({
        pagePath: p.page_path,
        pageTitle: p.page_title,
        pageviews: p.pageviews,
        varPageviews: toVariation(p.var_pageviews),
        pctTotal: p.pct_total,
      })),
    };
  },
};
