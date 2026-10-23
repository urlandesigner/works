// Chaves de cache do React Query, parametrizadas por escopo + período.
export const queryKeys = {
  overview: (days: number) => ['overview', days] as const,
  overviewTrend: () => ['overview-trend'] as const,
  sites: () => ['sites'] as const,
  site: (id: string) => ['site', id] as const,
  siteDetail: (id: string, days: number) => ['site-detail', id, days] as const,
  syncStates: () => ['sync-states'] as const,
};
