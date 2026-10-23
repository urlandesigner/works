import { ReactNode } from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';

import { useTheme } from '../theme';

type Props = ViewProps & {
  children: ReactNode;
  padded?: boolean;
};

export function AppCard({ children, padded = true, style, ...rest }: Props) {
  const { theme } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: padded ? theme.spacing.lg : 0,
    overflow: 'hidden',
    ...theme.shadows.sm,
  };

  return (
    <View style={[cardStyle, style]} {...rest}>
      {children}
    </View>
  );
}
