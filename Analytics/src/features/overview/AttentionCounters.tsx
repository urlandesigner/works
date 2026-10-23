import type { SiteSignal } from '@/types';

interface Counter {
  label: string;
  dot: string;
  count: number;
}

export function AttentionCounters({ signals }: { signals: SiteSignal[] }) {
  const counters: Counter[] = [
    { label: 'Técnicos', dot: 'bg-red-500', count: signals.filter((s) => s.attentionReason === 'technical').length },
    { label: 'Quedas', dot: 'bg-amber-500', count: signals.filter((s) => s.attentionReason === 'drop').length },
    { label: 'Picos', dot: 'bg-emerald-500', count: signals.filter((s) => s.attentionReason === 'spike').length },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {counters.map((c) => (
        <div
          key={c.label}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2"
        >
          <span className={`h-2 w-2 rounded-full ${c.dot}`} />
          <span className="text-sm text-zinc-500">{c.label}</span>
          <span className="ml-auto text-base font-semibold text-zinc-900">{c.count}</span>
        </div>
      ))}
    </div>
  );
}
