import type { colorsDark, colorsLight } from './colors';
import type { RadiusScale } from './radius';
import type { SpacingScale } from './spacing';
import type { TypographyScale } from './typography';
import type { ViewStyle } from 'react-native';

export type ColorScheme = 'light' | 'dark';

export type ThemeColors = typeof colorsDark | typeof colorsLight;

export type AppTheme = {
  colors: ThemeColors;
  spacing: SpacingScale;
  radius: RadiusScale;
  typography: TypographyScale;
  shadows: Record<'sm' | 'md' | 'lg', ViewStyle>;
};
