export const colorsDark = {
  background: '#121212',
  surface: 'rgba(24,24,27,0.72)',
  surfaceElevated: 'rgba(24,24,27,0.88)',
  border: 'rgba(255,255,255,0.10)',
  textPrimary: 'rgb(241,245,249)',
  textSecondary: 'rgb(203,213,225)',
  textMuted: 'rgb(148,163,184)',
  accent: 'rgb(241,245,249)',
  accentMuted: 'rgba(255,255,255,0.08)',
  success: 'rgb(74,222,128)',
  danger: '#ef4444',
  warning: 'rgb(251,191,36)',
  overlay: 'rgba(0,0,0,0.55)',
  tabBar: '#121212',
  tabBarBorder: 'rgba(255,255,255,0.10)',
  /** Trilhos / fundos de controles (ex.: progresso vazio) */
  track: 'rgba(39,39,42,0.95)',
} as const;

export const colorsLight = {
  background: '#E4E6ED',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#475569',
  textMuted: '#64748B',
  accent: '#09090B',
  accentMuted: 'rgba(15,23,42,0.04)',
  success: '#16A34A',
  danger: '#ef4444',
  warning: '#D97706',
  overlay: 'rgba(15,20,25,0.35)',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  track: '#F3F4F6',
} as const;

export type ColorPalette = typeof colorsDark;
