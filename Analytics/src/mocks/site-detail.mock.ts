import type { Site, SiteDetail, SyncState } from '@/types';
import { getMockSiteById, getMockSiteDetailSnapshot, getMockSyncStateBySiteId } from '@/mocks/sites.mock';

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export function mockSite(_id: string, demo: string | null): Promise<Site | null> {
  if (demo === 'loading') return new Promise(() => {});
  if (demo === 'notfound') return Promise.resolve(null);
  return Promise.resolve(getMockSiteById(_id));
}

export function mockSiteDetail(_id: string, demo: string | null): Promise<SiteDetail> {
  if (demo === 'loading') return new Promise(() => {});
  if (demo === 'error') return Promise.reject(new Error('Falha ao carregar os dados do site'));
  return Promise.resolve(getMockSiteDetailSnapshot(_id));
}

export function mockSiteSync(id: string, demo: string | null): Promise<SyncState> {
  if (demo === 'syncing') {
    return Promise.resolve({ siteId: id, status: 'running', lastSyncAt: null, errorMessage: null });
  }
  if (demo === 'syncerror') {
    return Promise.resolve({
      siteId: id,
      status: 'error',
      lastSyncAt: minutesAgo(60 * 30),
      errorMessage: 'Erro de integração com o GA4',
    });
  }
  return Promise.resolve(
    getMockSyncStateBySiteId(id) ?? { siteId: id, status: 'ok', lastSyncAt: minutesAgo(12), errorMessage: null },
  );
}
