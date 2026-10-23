import type { Variation } from '@/types';

// Variação 7v7 como sinal: ↑ verde / ↓ âmbar / "novo" neutro.
export function DeltaPill({ variation }: { variation: Variation }) {
  const { pct, direction } = variation;

  if (direction === 'new' || pct === null) {
    return <span className="text-xs font-medium text-zinc-400">novo</span>;
  }

  const value = `${Math.abs(Math.round(pct))}%`;
  if (direction === 'up') {
    return <span className="text-xs font-medium text-emerald-600">↑ {value}</span>;
  }
  if (direction === 'down') {
    return <span className="text-xs font-medium text-amber-600">↓ {value}</span>;
  }
  return <span className="text-xs font-medium text-zinc-400">{value}</span>;
}
