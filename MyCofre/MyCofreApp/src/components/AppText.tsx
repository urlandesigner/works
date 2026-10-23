import { Text, TextProps, TextStyle } from 'react-native';

import type { ColorPalette } from '../theme/colors';
import { useTheme } from '../theme';

type Variant =
  | 'display'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'overline';

type Props = TextProps & {
  variant?: Variant;
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'danger';
};

const colorKey: Record<NonNullable<Props['color']>, keyof ColorPalette> = {
  primary: 'textPrimary',
  secondary: 'textSecondary',
  muted: 'textMuted',
  accent: 'accent',
  success: 'success',
  danger: 'danger',
};

export function AppText({
  variant = 'body',
  color = 'primary',
  style,
  ...rest
}: Props) {
  const { theme } = useTheme();
  const typo = theme.typography[variant];
  const textColor = theme.colors[colorKey[color]];

  const combined: TextStyle = {
    ...typo,
    color: textColor,
  };

  return <Text style={[combined, style]} {...rest} />;
}
