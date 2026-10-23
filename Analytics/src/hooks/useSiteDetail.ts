import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { siteDetailService } from '@/services/site-detail.service';
import { queryKeys } from '@/lib/query-keys';
import { USE_MOCKS } from '@/config';
import { mockSiteDetail } from '@/mocks/site-detail.mock';
import { usePeriod } from './usePeriod';

export function useSiteDetail(id: string) {
  const { days } = usePeriod();
  const [params] = useSearchParams();
  const demo = params.get('demo');

  return useQuery({
    queryKey: USE_MOCKS
      ? (['site-detail', 'mock', id, demo, days] as const)
      : queryKeys.siteDetail(id, days),
    queryFn: () => (USE_MOCKS ? mockSiteDetail(id, demo) : siteDetailService.get(id, days)),
    enabled: Boolean(id),
  });
}
