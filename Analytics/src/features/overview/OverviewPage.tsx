import { useNavigate } from 'react-router-dom';
import { Topbar } from '@/components/layout/Topbar';
import { PeriodSelector } from '@/components/layout/PeriodSelector';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { useOverview } from '@/hooks/useOverview';
import { SummaryCards } from './SummaryCards';
import { AttentionCounters } from './AttentionCounters';
import { PortfolioTrend } from './PortfolioTrend';
import { SiteList } from './SiteList';

export function OverviewPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useOverview();

  const goToNew = () => navigate('/sites/new');
  const addButton = (
    <Button variant="primary" onClick={goToNew}>
      + Adicionar site
    </Button>
  );

  const signals = data ?? [];
  const subtitle = data ? `${signals.length} sites monitorados` : undefined;

  return (
    <>
      <Topbar
        title="Onde preciso olhar agora?"
        subtitle={subtitle}
        actions={
          <>
            <PeriodSelector />
            {addButton}
          </>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : signals.length === 0 ? (
        <EmptyState
          title="Nenhum site monitorado ainda"
          description="Cadastre seu primeiro site para começar a acompanhar tráfego, conversões e sincronização do GA4."
          action={addButton}
        />
      ) : (
        <div className="space-y-6">
          <SummaryCards signals={signals} />
          <AttentionCounters signals={signals} />
          <PortfolioTrend />
          <SiteList signals={signals} />
        </div>
      )}
    </>
  );
}
