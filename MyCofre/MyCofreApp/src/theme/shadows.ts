import { Platform, ViewStyle } from 'react-native';

import type { ColorScheme } from './types';

type ShadowName = 'sm' | 'md' | 'lg';

function iosShadow(
  color: string,
  opacity: number,
  radius: number,
  offsetY: number,
  offsetX = 0
): ViewStyle {
  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
  };
}

export function createShadows(scheme: ColorScheme): Record<ShadowName, ViewStyle> {
  const base = '#0F172A';

  return {
    sm: Platform.select<ViewStyle>({
      ios: scheme === 'dark' ? {} : iosShadow(base, 0.04, 2, 1),
      android: { elevation: 2 },
      default: {},
    })!,
    md: Platform.select<ViewStyle>({
      ios: scheme === 'dark' ? {} : iosShadow(base, 0.08, 12, 5),
      android: { elevation: 4 },
      default: {},
    })!,
    lg: Platform.select<ViewStyle>({
      ios: scheme === 'dark' ? iosShadow('#000000', 0.25, 18, 8) : iosShadow(base, 0.12, 18, 8),
      android: { elevation: 8 },
      default: {},
    })!,
  };
}
