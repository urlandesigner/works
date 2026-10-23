import type { SiteSignal } from '@/types';
import { toVariation } from '@/lib/variation';
import { formatNumber, formatPercent } from '@/lib/format';

function sum(signals: SiteSignal[], pick: (s: SiteSignal) => number): number {
  return signals.reduce((acc, s) => acc + pick(s), 0);
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-1.5 text-2xl font-semibold ${accent ?? 'text-zinc-900'}`}>{value}</div>
    </div>
  );
}

export function SummaryCards({ signals }: { signals: SiteSignal[] }) {
  const visitantes = sum(signals, (s) => s.usuarios.atual);
  const visitantesPrev = sum(signals, (s) => s.usuarios.anterior);
  const conversoes = sum(signals, (s) => s.conversoes.atual);
  const variation = toVariation(visitantesPrev > 0 ? ((visitantes - visitantesPrev) / visitantesPrev) * 100 : null);

  const variationAccent =
    variation.direction === 'up'
      ? 'text-emerald-600'
      : variation.direction === 'down'
        ? 'text-amber-600'
        : 'text-zinc-900';

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricCard label="Sites monitorados" value={formatNumber(signals.length)} />
      <MetricCard label="Visitantes (7d)" value={formatNumber(visitantes)} />
      <MetricCard label="Variação 7v7" value={formatPercent(variation.pct)} accent={variationAccent} />
      <MetricCard label="Conversões (7d)" value={formatNumber(conversoes)} />
    </div>
  );
}
