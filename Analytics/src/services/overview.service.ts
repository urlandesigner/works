import { overviewRepository } from '@/repositories/overview.repository';
import { toVariation } from '@/lib/variation';
import { attentionRank } from '@/lib/attention';
import type { SiteSignal, SiteStatus, SyncStatus, AttentionReason } from '@/types';

export const overviewService = {
  // Retorna os sinais já ordenados pela prioridade de atenção (técnico > queda > pico > estável),
  // desempatando por nome. A Home renderiza direto — sem recalcular nada.
  async getSignals(days: number): Promise<SiteSignal[]> {
    const rows = await overviewRepository.get(days);

    const signals: SiteSignal[] = rows.map((r) => ({
      siteId: r.site_id,
      nome: r.nome,
      cliente: r.cliente,
      status: r.status as SiteStatus,
      syncStatus: (r.sync_status as SyncStatus | null) ?? null,
      lastSyncAt: r.last_sync_at,
      usuarios: {
        atual: r.usuarios_atual,
        anterior: r.usuarios_anterior,
        variation: toVariation(r.var_usuarios),
      },
      conversoes: {
        atual: r.conversoes_atual,
        anterior: r.conversoes_anterior,
        variation: toVariation(r.var_conversoes),
      },
      attentionReason: (r.attention_reason as AttentionReason) ?? null,
    }));

    return signals.sort(
      (a, b) =>
        attentionRank(a.attentionReason) - attentionRank(b.attentionReason) ||
        a.nome.localeCompare(b.nome),
    );
  },
};
