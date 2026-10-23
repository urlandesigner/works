import { syncRepository } from '@/repositories/sync.repository';
import type { SyncState, SyncStatus } from '@/types';

function toSyncState(r: { site_id: string; last_sync_at: string | null; status: string; error_message: string | null }): SyncState {
  return {
    siteId: r.site_id,
    lastSyncAt: r.last_sync_at,
    status: r.status as SyncStatus,
    errorMessage: r.error_message,
  };
}

export const syncService = {
  async listBySite(): Promise<Record<string, SyncState>> {
    const rows = await syncRepository.list();
    const map: Record<string, SyncState> = {};
    for (const r of rows) map[r.site_id] = toSyncState(r);
    return map;
  },

  async getBySite(siteId: string): Promise<SyncState | null> {
    const row = await syncRepository.getBySite(siteId);
    return row ? toSyncState(row) : null;
  },

  async trigger(siteId: string): Promise<void> {
    await syncRepository.trigger(siteId);
  },
};
