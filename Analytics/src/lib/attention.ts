import type { AttentionReason } from '@/types';

// Prioridade dos critérios de atenção da Home (menor = mais urgente):
// 1. técnico  2. queda (>30%)  3. pico (>50%)
const PRIORITY: Record<Exclude<AttentionReason, null>, number> = {
  technical: 0,
  drop: 1,
  spike: 2,
};

const LABEL: Record<Exclude<AttentionReason, null>, string> = {
  technical: 'Problema técnico',
  drop: 'Queda relevante',
  spike: 'Crescimento relevante',
};

export function attentionRank(reason: AttentionReason): number {
  return reason === null ? 99 : PRIORITY[reason];
}

export function attentionLabel(reason: AttentionReason): string | null {
  return reason === null ? null : LABEL[reason];
}

export function isAttention(reason: AttentionReason): boolean {
  return reason !== null;
}
