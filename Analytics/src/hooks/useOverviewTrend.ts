import { useQuery } from '@tanstack/react-query';
import { USE_MOCKS } from '@/config';
import { mockPortfolioTrend } from '@/mocks/overview.mock';
import type { PortfolioTrendPoint } from '@/types';
import { queryKeys } from '@/lib/query-keys';

// Tendência agregada do portfólio. Mock por enquanto;
// TODO: RPC get_portfolio_trend quando integrarmos o real.
export function useOverviewTrend() {
  return useQuery({
    queryKey: queryKeys.overviewTrend(),
    queryFn: (): Promise<PortfolioTrendPoint[]> =>
      USE_MOCKS ? mockPortfolioTrend() : Promise.resolve([]),
  });
}
