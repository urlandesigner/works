import { sitesRepository } from '@/repositories/sites.repository';
import { syncRepository } from '@/repositories/sync.repository';
import type { Site, SiteInput, SiteStatus } from '@/types';
import type { SiteRow } from '@/types/db';

function toSite(row: SiteRow): Site {
  return {
    id: row.id,
    nome: row.nome,
    url: row.url,
    ga4PropertyId: row.ga4_property_id,
    cliente: row.cliente,
    segmento: row.segmento,
    status: row.status as SiteStatus,
    createdAt: row.created_at,
  };
}

export const sitesService = {
  async list(): Promise<Site[]> {
    const rows = await sitesRepository.list();
    return rows.map(toSite);
  },

  async get(id: string): Promise<Site | null> {
    const row = await sitesRepository.getById(id);
    return row ? toSite(row) : null;
  },

  async create(input: SiteInput): Promise<Site> {
    const site = toSite(await sitesRepository.create(input));
    // Dispara o primeiro sync (backfill 30 dias). Se falhar, o site já existe e o cron
    // diário recupera — a falha fica visível em sync_state, não bloqueia o cadastro.
    try {
      await syncRepository.trigger(site.id);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível iniciar a sincronização inicial com o GA4.';

      try {
        await syncRepository.setState({
          siteId: site.id,
          status: 'error',
          errorMessage: message,
        });
      } catch {
        // Se nem isso funcionar, o site continua criado; o problema fica para retry manual.
      }
    }
    return site;
  },

  async update(id: string, input: SiteInput): Promise<Site> {
    return toSite(await sitesRepository.update(id, input));
  },

  async archive(id: string): Promise<void> {
    await sitesRepository.archive(id);
  },
};
