import type { ImpactStats } from "@/types/impact";

/** Meta da próxima ação de ajuda (valor único usado no card e na barra). */
export const IMPACT_META_BRL = 50;

/** Estado inicial antes do fetch (zeros; total real vem de GET /api/impact-arrecadacao). */
export const IMPACT_INITIAL_STATS: ImpactStats = {
  totalArrecadado: 0,
  meta: IMPACT_META_BRL,
};
