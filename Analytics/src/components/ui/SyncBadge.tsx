import type { SyncStatus } from '@/types';

interface Config {
  label: string;
  dot: string;
  text: string;
  bg: string;
}

const MAP: Record<SyncStatus, Config> = {
  ok: { label: 'Sincronizado', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  running: { label: 'Sincronizando', dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
  error: { label: 'Erro', dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
  no_data: { label: 'Sem dados', dot: 'bg-zinc-400', text: 'text-zinc-600', bg: 'bg-zinc-100' },
};

export function SyncBadge({ status }: { status: SyncStatus | null }) {
  const cfg = MAP[status ?? 'no_data'];
  const isRunning = status === 'running';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {isRunning ? (
        <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      )}
      {cfg.label}
    </span>
  );
}
