import { Link } from 'react-router-dom';
import type { Site, SyncState } from '@/types';
import { SyncBadge } from '@/components/ui/SyncBadge';
import { PeriodSelector } from '@/components/layout/PeriodSelector';
import { formatRelativeTime } from '@/lib/format';

export function SiteHeader({ site, sync }: { site: Site; sync: SyncState | null }) {
  const subtitle = [site.cliente, site.url].filter(Boolean).join(' · ');

  return (
    <header className="mb-6">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-400">
        <Link to="/sites" className="hover:text-zinc-600">
          Sites
        </Link>
        <span>/</span>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-zinc-900">{site.nome}</h1>
          {subtitle && <p className="mt-0.5 truncate text-sm text-zinc-500">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            to={`/sites/${site.id}/edit`}
            className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Editar site
          </Link>
          <span className="flex items-center gap-2">
            <SyncBadge status={sync?.status ?? null} />
            <span className="text-xs text-zinc-400">{formatRelativeTime(sync?.lastSyncAt ?? null)}</span>
          </span>
          <PeriodSelector />
        </div>
      </div>
    </header>
  );
}
