// Lente temporal do MVP é fixa (7 vs 7). Chip informativo, preparado para virar dropdown depois.
export function PeriodSelector() {
  return (
    <span className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600">
      Últimos 7 dias · vs 7 anteriores
    </span>
  );
}
