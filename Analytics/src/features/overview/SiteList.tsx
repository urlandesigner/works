import type { SiteSignal } from '@/types';
import { Card } from '@/components/ui/Card';
import { isAttention } from '@/lib/attention';
import { SiteSignalRow } from './SiteSignalRow';

function Section({ title, count, signals }: { title: string; count: number; signals: SiteSignal[] }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        <span className="text-xs text-zinc-400">{count}</span>
      </div>
      <Card>
        <div className="divide-y divide-zinc-100">
          {signals.map((s) => (
            <SiteSignalRow key={s.siteId} signal={s} />
          ))}
        </div>
      </Card>
    </div>
  );
}

export function SiteList({ signals }: { signals: SiteSignal[] }) {
  const attention = signals.filter((s) => isAttention(s.attentionReason));
  const stable = signals.filter((s) => !isAttention(s.attentionReason));

  return (
    <div className="space-y-6">
      {attention.length > 0 && (
        <Section title="Precisam de atenção" count={attention.length} signals={attention} />
      )}
      {stable.length > 0 && <Section title="Estáveis" count={stable.length} signals={stable} />}
    </div>
  );
}
