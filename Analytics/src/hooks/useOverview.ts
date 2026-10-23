import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { overviewService } from '@/services/overview.service';
import { queryKeys } from '@/lib/query-keys';
import { USE_MOCKS } from '@/config';
import { mockOverview } from '@/mocks/overview.mock';
import { usePeriod } from './usePeriod';

export function useOverview() {
  const { days } = usePeriod();
  const [params] = useSearchParams();
  const demo = params.get('demo');

  return useQuery({
    queryKey: USE_MOCKS ? (['overview', 'mock', demo, days] as const) : queryKeys.overview(days),
    queryFn: () => (USE_MOCKS ? mockOverview(demo) : overviewService.getSignals(days)),
  });
}
