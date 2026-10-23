import { useNavigate } from 'react-router-dom';
import { Topbar } from '@/components/layout/Topbar';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SyncBadge } from '@/components/ui/SyncBadge';
import { useAuth } from '@/hooks/useAuth';
import { useResetMockSites, useSites } from '@/hooks/useSites';
import { useSyncStates } from '@/hooks/useSyncStates';
import { useTriggerSiteSync } from '@/hooks/useSiteSync';
import { USE_MOCKS } from '@/config';
import { formatRelativeTime } from '@/lib/format';

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </Card>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const sites = useSites();
  const syncStates = useSyncStates();
  const triggerSync = useTriggerSiteSync();
  const resetMockSites = useResetMockSites();

  if (sites.isLoading || syncStates.isLoading) {
    return (
      <>
        <Topbar title="Configurações" subtitle="Conexão, sincronização e sessão do painel" />
        <LoadingState />
      </>
    );
  }

  if (sites.isError) {
    return (
      <>
        <Topbar title="Configurações" subtitle="Conexão, sincronização e sessão do painel" />
        <ErrorState
          title="Não foi possível carregar as configurações"
          description="O painel não conseguiu montar o estado operacional dos sites."
          onRetry={() => {
            sites.refetch();
            syncStates.refetch();
          }}
        />
      </>
    );
  }

  const siteList = sites.data ?? [];
  const syncMap = syncStates.data ?? {};
  const problematicSites = siteList.filter((site) => {
    const status = syncMap[site.id]?.status ?? null;
    return status === 'error' || status === 'running' || status === 'no_data';
  });
  const syncedCount = siteList.filter((site) => syncMap[site.id]?.status === 'ok').length;
  const errorsCount = siteList.filter((site) => syncMap[site.id]?.status === 'error').length;
  const runningCount = siteList.filter((site) => syncMap[site.id]?.status === 'running').length;

  async function onResetMockData() {
    if (
      !window.confirm(
        'Resetar os dados mock do inventário? Isso remove sites criados em desenvolvimento e restaura o estado inicial offline.',
      )
    ) {
      return;
    }

    await resetMockSites.mutateAsync();
  }

  return (
    <div className="space-y-6">
      <Topbar title="Configurações" subtitle="Conexão, sincronização e sessão do painel" />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Ambiente"
          value={USE_MOCKS ? 'Mock' : 'Supabase'}
          description={
            USE_MOCKS
              ? 'Sem credenciais locais: o painel roda com dados simulados para desenvolvimento.'
              : 'Credenciais carregadas e leitura ativa do backend.'
          }
        />
        <MetricCard
          label="Sites saudáveis"
          value={String(syncedCount)}
          description="Sites com última sincronização concluída sem alerta técnico."
        />
        <MetricCard
          label="Com erro"
          value={String(errorsCount)}
          description="Integrações que falharam e merecem revisão imediata."
        />
        <MetricCard
          label="Em andamento"
          value={String(runningCount)}
          description="Backfills ou retries em progresso no momento."
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden">
          <div className="border-b border-zinc-200 bg-[linear-gradient(135deg,rgba(24,24,27,0.04),transparent)] px-5 py-5">
            <p className="text-sm font-semibold text-zinc-900">Fila de atenção técnica</p>
            <p className="mt-1 text-sm text-zinc-500">
              Sites que estão sincronizando, sem dados ou com falha de integração no GA4.
            </p>
          </div>

          <div className="space-y-3 p-4">
            {syncStates.isError && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                O painel de sync não respondeu agora. Os dados exibidos podem estar incompletos.
              </div>
            )}

            {problematicSites.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-12 text-center">
                <p className="text-base font-semibold text-zinc-900">Tudo sob controle</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Nenhum site do portfólio está pedindo ação técnica agora.
                </p>
              </div>
            ) : (
              problematicSites.map((site) => {
                const sync = syncMap[site.id] ?? null;
                return (
                  <div
                    key={site.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-base font-semibold text-zinc-900">{site.nome}</p>
                        <p className="mt-1 text-sm text-zinc-500">
                          {site.cliente ?? 'Sem cliente'} · {site.ga4PropertyId}
                        </p>
                        {sync?.errorMessage && <p className="mt-2 text-sm text-red-600">{sync.errorMessage}</p>}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <SyncBadge status={sync?.status ?? null} />
                        <span className="text-xs text-zinc-400">{formatRelativeTime(sync?.lastSyncAt ?? null)}</span>
                        <Button
                          type="button"
                          onClick={() => triggerSync.mutate(site.id)}
                          disabled={triggerSync.isPending}
                        >
                          {triggerSync.isPending && triggerSync.variables === site.id ? 'Reprocessando…' : 'Reprocessar'}
                        </Button>
                        <Button type="button" onClick={() => navigate(`/sites/${site.id}`)}>
                          Ver dashboard
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Política atual</p>
            <h2 className="mt-3 text-lg font-semibold text-zinc-900">Sincronização do MVP</h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600">
              <li>Cadastro de site dispara sync imediato com backfill inicial de 30 dias.</li>
              <li>O cron diário roda leitura incremental de 3 dias para reduzir lacunas.</li>
              <li>A Home prioriza técnicos, quedas acima de 30% e picos acima de 50%.</li>
            </ul>
          </Card>

          {USE_MOCKS && (
            <Card className="p-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Dados mock</p>
              <h2 className="mt-3 text-lg font-semibold text-zinc-900">Resetar inventário offline</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Restaura a base local para o conjunto padrão de desenvolvimento, sem mexer na sua sessão atual.
              </p>
              <Button
                type="button"
                className="mt-4 w-full justify-center"
                onClick={onResetMockData}
                disabled={resetMockSites.isPending}
              >
                {resetMockSites.isPending ? 'Resetando…' : 'Resetar dados mock'}
              </Button>
            </Card>
          )}

          <Card className="p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Sessão</p>
            <h2 className="mt-3 text-lg font-semibold text-zinc-900">Acesso ao painel</h2>
            <p className="mt-2 text-sm text-zinc-600">
              {session?.user.email ?? session?.user.id ?? 'Sessão protegida'}{USE_MOCKS ? ' · modo mock' : ''}
            </p>
            <Button
              type="button"
              variant="primary"
              className="mt-4 w-full justify-center"
              onClick={async () => {
                await signOut();
                navigate('/login', { replace: true });
              }}
            >
              Sair
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
