import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { syncService } from '@/services/sync.service';
import { queryKeys } from '@/lib/query-keys';
import { USE_MOCKS } from '@/config';
import { mockListSyncStates } from '@/mocks/sites.mock';

export function useSyncStates() {
  const [params] = useSearchParams();
  const demo = params.get('demo');

  return useQuery({
    queryKey: USE_MOCKS ? (['sync-states', 'mock', demo] as const) : queryKeys.syncStates(),
    queryFn: () => (USE_MOCKS ? mockListSyncStates(demo) : syncService.listBySite()),
  });
}
