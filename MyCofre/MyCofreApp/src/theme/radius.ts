import { spacing } from './spacing';

export const radius = {
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
  xl: spacing.xl,
  full: 9999,
} as const;

export type RadiusScale = typeof radius;
