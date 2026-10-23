import { useEffect, useState, type PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { USE_MOCKS } from '@/config';
import { MOCK_DATA_CHANGED_EVENT } from '@/lib/local-storage';
import { queryKeys } from '@/lib/query-keys';

// Dados do GA4 mudam ~1x/dia → staleTime longo evita refetch a cada navegação Home↔Site.
export function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15 * 60 * 1000,
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    if (!USE_MOCKS || typeof window === 'undefined') return;

    const onMockDataChanged = () => {
      client.invalidateQueries({ queryKey: queryKeys.sites() });
      client.invalidateQueries({ queryKey: queryKeys.syncStates() });
      client.invalidateQueries({ queryKey: ['overview'] });
      client.invalidateQueries({ queryKey: queryKeys.overviewTrend() });
      client.invalidateQueries({ queryKey: ['site'] });
      client.invalidateQueries({ queryKey: ['site-detail'] });
      client.invalidateQueries({ queryKey: ['site-sync'] });
    };

    window.addEventListener(MOCK_DATA_CHANGED_EVENT, onMockDataChanged);
    return () => window.removeEventListener(MOCK_DATA_CHANGED_EVENT, onMockDataChanged);
  }, [client]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
