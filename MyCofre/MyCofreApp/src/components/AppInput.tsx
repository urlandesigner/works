import { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '../theme';

import { AppText } from './AppText';

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export function AppInput({ label, error, style, ...rest }: Props) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText variant="caption" color="secondary" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        onFocus={(event) => {
          setFocused(true);
          rest.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          rest.onBlur?.(event);
        }}
        style={[
          styles.input,
          {
            borderRadius: theme.radius.md,
            borderColor: error ? theme.colors.danger : focused ? theme.colors.accent : theme.colors.border,
            backgroundColor: focused ? theme.colors.surfaceElevated : theme.colors.surface,
            color: theme.colors.textPrimary,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            fontSize: theme.typography.body.fontSize,
            shadowColor: focused ? theme.colors.accent : 'transparent',
            shadowOpacity: focused ? 0.12 : 0,
            shadowRadius: focused ? 12 : 0,
            shadowOffset: { width: 0, height: 6 },
            elevation: focused ? 2 : 0,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <AppText variant="caption" color="danger" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    minHeight: 48,
  },
  error: {
    marginTop: 6,
  },
});
