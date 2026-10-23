import type { SiteCards, MetricPair } from '@/types';
import { DeltaPill } from '@/components/ui/DeltaPill';
import { formatNumber } from '@/lib/format';

function MetricCard({ label, pair }: { label: string; pair: MetricPair }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-zinc-900">{formatNumber(pair.atual)}</span>
        <DeltaPill variation={pair.variation} />
      </div>
    </div>
  );
}

export function SiteMetricCards({ cards }: { cards: SiteCards }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricCard label="Usuários" pair={cards.usuarios} />
      <MetricCard label="Sessões" pair={cards.sessoes} />
      <MetricCard label="Visualizações" pair={cards.pageviews} />
      <MetricCard label="Conversões" pair={cards.conversoes} />
    </div>
  );
}
