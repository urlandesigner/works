import { Link } from 'react-router-dom';
import type { SiteSignal, AttentionReason } from '@/types';
import { DeltaPill } from '@/components/ui/DeltaPill';
import { attentionLabel } from '@/lib/attention';
import { formatRelativeTime } from '@/lib/format';
import { SyncBadge } from '@/components/ui/SyncBadge';

const DOT: Record<Exclude<AttentionReason, null> | 'none', string> = {
  technical: 'bg-red-500',
  drop: 'bg-amber-500',
  spike: 'bg-emerald-500',
  none: 'bg-zinc-300',
};

export function SiteSignalRow({ signal }: { signal: SiteSignal }) {
  const subtitle = [signal.cliente, attentionLabel(signal.attentionReason)].filter(Boolean).join(' · ');

  return (
    <Link
      to={`/sites/${signal.siteId}`}
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50"
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[signal.attentionReason ?? 'none']}`} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-zinc-900">{signal.nome}</div>
        {subtitle && <div className="truncate text-xs text-zinc-400">{subtitle}</div>}
      </div>
      <div className="w-14 text-right">
        <DeltaPill variation={signal.usuarios.variation} />
      </div>
      <SyncBadge status={signal.syncStatus} />
      <span className="w-16 shrink-0 text-right text-xs text-zinc-400">
        {formatRelativeTime(signal.lastSyncAt)}
      </span>
    </Link>
  );
}
