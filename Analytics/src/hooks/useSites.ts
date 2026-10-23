import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sitesService } from '@/services/sites.service';
import { queryKeys } from '@/lib/query-keys';
import { useSearchParams } from 'react-router-dom';
import { USE_MOCKS } from '@/config';
import {
  resetMockSitesData,
  mockArchiveSite,
  mockCreateSite,
  getMockSiteById,
  mockListSites,
  mockUpdateSite,
} from '@/mocks/sites.mock';
import type { SiteInput } from '@/types';

export function useSites() {
  const [params] = useSearchParams();
  const demo = params.get('demo');

  return useQuery({
    queryKey: USE_MOCKS ? (['sites', 'mock', demo] as const) : queryKeys.sites(),
    queryFn: () => (USE_MOCKS ? mockListSites(demo) : sitesService.list()),
  });
}

export function useSite(id: string) {
  const [params] = useSearchParams();
  const demo = params.get('demo');
  return useQuery({
    queryKey: USE_MOCKS ? (['site', 'mock', id, demo] as const) : queryKeys.site(id),
    queryFn: () => {
      if (!USE_MOCKS) return sitesService.get(id);
      if (demo === 'loading') return new Promise<null>(() => {});
      if (demo === 'notfound') return Promise.resolve(null);
      return Promise.resolve(getMockSiteById(id));
    },
    enabled: Boolean(id),
  });
}

function useInvalidateSites() {
  const qc = useQueryClient();
  return (id?: string) => {
    qc.invalidateQueries({ queryKey: queryKeys.sites() });
    qc.invalidateQueries({ queryKey: ['overview'] });
    qc.invalidateQueries({ queryKey: queryKeys.syncStates() });
    if (id) {
      qc.invalidateQueries({ queryKey: queryKeys.site(id) });
      qc.invalidateQueries({ queryKey: ['site', 'mock', id] });
      qc.invalidateQueries({ queryKey: ['site-sync', id] });
      qc.invalidateQueries({ queryKey: ['site-sync', 'mock', id] });
    }
  };
}

export function useCreateSite() {
  const invalidate = useInvalidateSites();
  return useMutation({
    mutationFn: (input: SiteInput) =>
      USE_MOCKS ? mockCreateSite(input) : sitesService.create(input),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateSite(id: string) {
  const invalidate = useInvalidateSites();
  return useMutation({
    mutationFn: (input: SiteInput) => (USE_MOCKS ? mockUpdateSite(id, input) : sitesService.update(id, input)),
    onSuccess: () => invalidate(id),
  });
}

export function useArchiveSite() {
  const invalidate = useInvalidateSites();
  return useMutation({
    mutationFn: (id: string) => (USE_MOCKS ? mockArchiveSite(id) : sitesService.archive(id)),
    onSuccess: (_data, id) => invalidate(id),
  });
}

export function useResetMockSites() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      resetMockSitesData();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sites() });
      qc.invalidateQueries({ queryKey: ['overview'] });
      qc.invalidateQueries({ queryKey: queryKeys.syncStates() });
      qc.invalidateQueries({ queryKey: ['site'] });
      qc.invalidateQueries({ queryKey: ['site-sync'] });
    },
  });
}
