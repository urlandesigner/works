import type { Variation, Direction } from '@/types';

// Converte o pct vindo da RPC (null = período anterior zero) em Variation tipada.
export function toVariation(pct: number | null | undefined): Variation {
  if (pct === null || pct === undefined) {
    return { pct: null, direction: 'new' };
  }
  let direction: Direction = 'flat';
  if (pct > 0) direction = 'up';
  else if (pct < 0) direction = 'down';
  return { pct, direction };
}
