// Lente temporal do MVP: últimos 7 dias vs 7 dias anteriores (fixa).
// Estruturado como valor para permitir extensão futura sem refactor.

export const DEFAULT_PERIOD_DAYS = 7;

export function resolvePeriodDays(raw: string | null): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_PERIOD_DAYS;
}
