import { ActivityIndicator, Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '../theme';

import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = PressableProps & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
};

export function AppButton({
  title,
  variant = 'primary',
  loading,
  fullWidth,
  disabled,
  style,
  ...rest
}: Props) {
  const { theme, colorScheme } = useTheme();

  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle[] = [
    styles.base,
    {
      borderRadius: theme.radius.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xxl,
    },
  ];
  if (fullWidth) {
    containerStyle.push(styles.fullWidth);
  }

  if (variant === 'primary') {
    containerStyle.push({
      backgroundColor: isDisabled ? theme.colors.border : theme.colors.accent,
      ...theme.shadows.sm,
    });
  } else if (variant === 'secondary') {
    containerStyle.push({
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
    });
  } else {
    containerStyle.push({ backgroundColor: 'transparent' });
  }

  const primaryLabelColor = colorScheme === 'dark' ? '#09090B' : '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        ...containerStyle,
        pressed && !isDisabled && { opacity: 0.92, transform: [{ scale: 0.985 }] },
        style as ViewStyle,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? primaryLabelColor : theme.colors.accent}
        />
      ) : (
        <AppText
          variant="label"
          color={variant === 'secondary' ? 'primary' : 'accent'}
          style={
            variant === 'primary'
              ? { color: primaryLabelColor }
              : variant === 'ghost'
                ? { color: theme.colors.accent }
                : { color: theme.colors.textPrimary }
          }
        >
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
});
