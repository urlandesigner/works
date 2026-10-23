import type { SiteSignal, PortfolioTrendPoint } from '@/types';
import { getMockOverviewSignalsSnapshot, getMockPortfolioTrendSnapshot } from '@/mocks/sites.mock';

// Suporta preview de estados via ?demo=empty|loading|error (dev). Default = success.
export function mockOverview(demo: string | null): Promise<SiteSignal[]> {
  if (demo === 'loading') return new Promise<SiteSignal[]>(() => {}); // nunca resolve → skeleton
  if (demo === 'error') return Promise.reject(new Error('Falha simulada ao carregar o portfólio'));
  if (demo === 'empty') return Promise.resolve([]);
  return Promise.resolve(getMockOverviewSignalsSnapshot());
}

export function mockPortfolioTrend(): Promise<PortfolioTrendPoint[]> {
  return Promise.resolve(getMockPortfolioTrendSnapshot());
}
