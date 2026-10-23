/**
 * Escala 4-based. Use tokens em vez de números soltos nas telas.
 */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  screenPadding: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
  /** Espaço padrão entre seções e blocos principais */
  sectionGap: 24,
} as const;

export type SpacingScale = typeof spacing;
