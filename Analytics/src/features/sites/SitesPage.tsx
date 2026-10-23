import { useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Topbar } from '@/components/layout/Topbar';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SyncBadge } from '@/components/ui/SyncBadge';
import { useSites } from '@/hooks/useSites';
import { useSyncStates } from '@/hooks/useSyncStates';
import { formatRelativeTime } from '@/lib/format';
import type { Site, SiteStatus, SyncState } from '@/types';

type Filter = 'todos' | 'ativos' | 'pausados' | 'arquivados' | 'com-problema' | 'sincronizando';

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'ativos', label: 'Ativos' },
  { value: 'pausados', label: 'Pausados' },
  { value: 'arquivados', label: 'Arquivados' },
  { value: 'com-problema', label: 'Com problema' },
  { value: 'sincronizando', label: 'Sincronizando' },
];

const statusStyles: Record<SiteStatus, string> = {
  ativo: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  pausado: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  arquivado: 'bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200',
};

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function matchesFilter(site: Site, sync: SyncState | null, filter: Filter) {
  if (filter === 'todos') return true;
  if (filter === 'ativos') return site.status === 'ativo';
  if (filter === 'pausados') return site.status === 'pausado';
  if (filter === 'arquivados') return site.status === 'arquivado';
  if (filter === 'sincronizando') return sync?.status === 'running';
  return sync?.status === 'error' || sync?.status === 'no_data';
}

function StatsCard({
  eyebrow,
  value,
  description,
}: {
  eyebrow: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="overflow-hidden border-zinc-200/80 bg-white/90">
      <div className="h-1 bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-300" />
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">{eyebrow}</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
      </div>
    </Card>
  );
}

function SitesLoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl bg-zinc-100" />
        ))}
      </div>
      <div className="h-14 animate-pulse rounded-2xl bg-zinc-100" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl bg-zinc-100" />
        ))}
      </div>
    </div>
  );
}

function SyncWarningBanner() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      O inventário foi carregado, mas o estado de sincronização não pôde ser atualizado agora.
    </div>
  );
}

function SitesTableRow({ site, sync }: { site: Site; sync: SyncState | null }) {
  const statusClass = statusStyles[site.status];
  const meta = [site.cliente, site.segmento].filter(Boolean).join(' · ');
  const syncError = sync?.status === 'error' ? sync.errorMessage : null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50/60">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/sites/${site.id}`}
                  className="truncate text-base font-semibold text-zinc-900 underline-offset-4 hover:underline"
                >
                  {site.nome}
                </Link>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>
                  {site.status}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-zinc-500">{meta || getHostname(site.url)}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SyncBadge status={sync?.status ?? null} />
              <a
                href={site.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                Abrir site
              </a>
              <Link
                to={`/sites/${site.id}`}
                className="inline-flex items-center rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Ver dashboard
              </Link>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-zinc-600 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Domínio</p>
              <p className="mt-1 truncate font-medium text-zinc-700">{getHostname(site.url)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">GA4 Property ID</p>
              <p className="mt-1 font-mono text-sm text-zinc-700">{site.ga4PropertyId}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Último sync</p>
              <p className="mt-1 font-medium text-zinc-700">{formatRelativeTime(sync?.lastSyncAt ?? null)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Cadastro</p>
              <p className="mt-1 font-medium text-zinc-700">{new Date(site.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {syncError && <p className="mt-3 text-sm text-red-600">{syncError}</p>}
        </div>
      </div>
    </div>
  );
}

export function SitesPage() {
  const navigate = useNavigate();
  const sites = useSites();
  const syncStates = useSyncStates();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');

  const goToNew = () => navigate('/sites/new');
  const addButton = (
    <Button variant="primary" onClick={goToNew}>
      + Adicionar site
    </Button>
  );

  if (sites.isLoading) {
    return (
      <>
        <Topbar title="Sites" subtitle="Inventário operacional dos sites monitorados" actions={addButton} />
        <SitesLoadingState />
      </>
    );
  }

  if (sites.isError) {
    return (
      <>
        <Topbar title="Sites" subtitle="Inventário operacional dos sites monitorados" actions={addButton} />
        <ErrorState
          title="Não foi possível carregar os sites"
          description="O inventário de sites não respondeu como esperado."
          onRetry={() => {
            sites.refetch();
            syncStates.refetch();
          }}
        />
      </>
    );
  }

  const siteList = sites.data ?? [];

  if (siteList.length === 0) {
    return (
      <>
        <Topbar title="Sites" subtitle="Inventário operacional dos sites monitorados" actions={addButton} />
        <EmptyState
          title="Nenhum site cadastrado"
          description="Cadastre o primeiro site para começar a montar seu inventário operacional de analytics."
          action={addButton}
        />
      </>
    );
  }

  const syncMap = syncStates.data ?? {};
  const normalizedSearch = search.trim().toLowerCase();
  const filteredSites = siteList.filter((site) => {
    const sync = syncMap[site.id] ?? null;
    const haystack = [site.nome, site.cliente, site.segmento, site.url, site.ga4PropertyId]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedSearch) && matchesFilter(site, sync, filter);
  });

  const activeCount = siteList.filter((site) => site.status === 'ativo').length;
  const pausedCount = siteList.filter((site) => site.status === 'pausado').length;
  const healthyCount = siteList.filter((site) => (syncMap[site.id]?.status ?? null) === 'ok').length;
  const attentionCount = siteList.filter((site) => {
    const status = syncMap[site.id]?.status ?? null;
    return status === 'error' || status === 'running' || status === 'no_data';
  }).length;

  return (
    <div className="space-y-6">
      <Topbar
        title="Sites"
        subtitle={`${siteList.length} sites no inventário`}
        actions={addButton}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          eyebrow="Inventário"
          value={String(siteList.length)}
          description="Todos os sites cadastrados e acessíveis pelo painel."
        />
        <StatsCard
          eyebrow="Ativos"
          value={String(activeCount)}
          description="Sites em operação normal e previstos para sync diário."
        />
        <StatsCard
          eyebrow="Sync saudável"
          value={String(healthyCount)}
          description="Propriedades com última sincronização concluída sem alerta."
        />
        <StatsCard
          eyebrow="Pedem ação"
          value={String(attentionCount + pausedCount)}
          description="Sites pausados ou com status técnico que merecem revisão."
        />
      </section>

      <Card className="overflow-hidden border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 bg-[linear-gradient(135deg,rgba(24,24,27,0.035),transparent)] px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Gestão do portfólio</p>
              <p className="mt-1 text-sm text-zinc-500">
                Encontre rapidamente um site, valide o estado do GA4 e siga para análise detalhada.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="min-w-0 sm:w-80">
                <span className="sr-only">Buscar site</span>
                <input
                  value={search}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
                  placeholder="Buscar por nome, cliente, URL ou Property ID"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((item) => {
              const active = item.value === filter;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={[
                    'rounded-full px-3 py-1.5 text-sm transition-colors',
                    active ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 p-4">
          {syncStates.isError && <SyncWarningBanner />}

          {filteredSites.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-12 text-center">
              <p className="text-base font-semibold text-zinc-900">Nenhum site encontrado</p>
              <p className="mt-1 text-sm text-zinc-500">
                Ajuste a busca ou os filtros para encontrar outro conjunto de sites.
              </p>
            </div>
          ) : (
            filteredSites.map((site) => <SitesTableRow key={site.id} site={site} sync={syncMap[site.id] ?? null} />)
          )}
        </div>
      </Card>
    </div>
  );
}
