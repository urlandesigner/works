import { Link, useParams } from 'react-router-dom';
import { USE_MOCKS } from '@/config';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { useSite } from '@/hooks/useSites';
import { useSiteDetail } from '@/hooks/useSiteDetail';
import { useSiteSync } from '@/hooks/useSiteSync';
import { SiteHeader } from './SiteHeader';
import { SiteMetricCards } from './SiteMetricCards';
import { SiteTrendChart } from './SiteTrendChart';
import { ChannelTable } from './ChannelTable';
import { PagesTable } from './PagesTable';
import { DevicesPlaceholder } from './DevicesPlaceholder';

function SyncErrorBanner() {
  return (
    <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <span>Falha ao sincronizar com o GA4. Os dados podem estar desatualizados.</span>
      <Link to="/configuracoes" className="shrink-0 font-medium underline underline-offset-2">
        Reconectar
      </Link>
    </div>
  );
}

function SyncingState() {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-500" />
      <h2 className="text-base font-semibold text-zinc-900">Sincronizando dados…</h2>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">
        A primeira carga busca 30 dias de histórico no GA4 e pode levar alguns segundos.
      </p>
    </Card>
  );
}

function NoAnalyticsDataState() {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-500">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19h16M7 16V8M12 16V5M17 16v-3" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-zinc-900">Sem dados analíticos disponíveis ainda</h2>
      <p className="mt-1 max-w-md text-sm text-zinc-500">
        {USE_MOCKS
          ? 'Este site foi criado no modo mock. O cadastro e o estado de sync ficam salvos localmente, mas métricas reais só aparecem quando o projeto estiver conectado ao Supabase e ao GA4.'
          : 'O site já existe no inventário, mas ainda não há dados suficientes sincronizados para montar o dashboard detalhado.'}
      </p>
      {!USE_MOCKS && (
        <p className="mt-3 max-w-md text-xs text-zinc-400">
          Se isso persistir, verifique em Configurações se a função `sync-ga4` e a credencial da service account do
          GA4 já foram configuradas.
        </p>
      )}
    </Card>
  );
}

export function SiteDetailPage() {
  const { id = '' } = useParams();
  const site = useSite(id);
  const detail = useSiteDetail(id);
  const sync = useSiteSync(id);

  if (site.isLoading || detail.isLoading) return <LoadingState />;

  if (site.isError || detail.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar o site"
        description="Ocorreu um erro ao buscar os dados deste site."
        onRetry={() => {
          site.refetch();
          detail.refetch();
        }}
      />
    );
  }

  if (!site.data) {
    return (
      <EmptyState
        title="Site não encontrado"
        description="O site solicitado não existe ou foi removido."
        action={
          <Link
            to="/"
            className="inline-flex items-center rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Voltar à Home
          </Link>
        }
      />
    );
  }

  const d = detail.data!;
  const syncState = sync.data ?? null;
  const hasData = d.trend.some((t) => t.atual > 0) || d.cards.usuarios.atual > 0;

  return (
    <>
      <SiteHeader site={site.data} sync={syncState} />
      {syncState?.status === 'error' && <SyncErrorBanner />}

      {hasData ? (
        <div className="space-y-6">
          <SiteMetricCards cards={d.cards} />
          <SiteTrendChart trend={d.trend} />
          <ChannelTable channels={d.channels} />
          <PagesTable pages={d.pages} />
          <DevicesPlaceholder />
        </div>
      ) : syncState?.status === 'running' ? (
        <SyncingState />
      ) : (
        <NoAnalyticsDataState />
      )}
    </>
  );
}
