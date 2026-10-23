import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { syncService } from '@/services/sync.service';
import { USE_MOCKS } from '@/config';
import { mockSiteSync } from '@/mocks/site-detail.mock';
import { mockTriggerSiteSync } from '@/mocks/sites.mock';
import { queryKeys } from '@/lib/query-keys';

export function useSiteSync(id: string) {
  const [params] = useSearchParams();
  const demo = params.get('demo');

  return useQuery({
    queryKey: USE_MOCKS ? (['site-sync', 'mock', id, demo] as const) : (['site-sync', id] as const),
    queryFn: () => (USE_MOCKS ? mockSiteSync(id, demo) : syncService.getBySite(id)),
    enabled: Boolean(id),
  });
}

export function useTriggerSiteSync() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (siteId: string) => (USE_MOCKS ? mockTriggerSiteSync(siteId) : syncService.trigger(siteId)),
    onSuccess: (_data, siteId) => {
      qc.invalidateQueries({ queryKey: queryKeys.syncStates() });
      qc.invalidateQueries({ queryKey: ['site-sync', siteId] });
      qc.invalidateQueries({ queryKey: ['site-sync', 'mock', siteId] });
    },
  });
}
