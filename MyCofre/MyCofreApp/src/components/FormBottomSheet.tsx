import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';

import { AppText } from './AppText';

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  contentContainerStyle?: ViewStyle;
};

export function FormBottomSheet({
  visible,
  title,
  subtitle,
  onClose,
  children,
  footer,
  contentContainerStyle,
}: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardWrap}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.background,
                borderTopLeftRadius: theme.radius.xl,
                borderTopRightRadius: theme.radius.xl,
                borderColor: theme.colors.border,
                paddingBottom: Math.max(insets.bottom, theme.spacing.lg),
              },
            ]}
          >
            <View style={styles.handleWrap}>
              <View
                style={[
                  styles.handle,
                  {
                    backgroundColor: theme.colors.border,
                    borderRadius: theme.radius.full,
                  },
                ]}
              />
            </View>

            <View style={[styles.header, { paddingHorizontal: theme.spacing.xl }]}>
              <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
                <AppText variant="title3">{title}</AppText>
                {subtitle ? (
                  <AppText
                    variant="bodySmall"
                    color="secondary"
                    style={{ marginTop: theme.spacing.xxs }}
                  >
                    {subtitle}
                  </AppText>
                ) : null}
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  {
                    backgroundColor: theme.colors.surfaceElevated,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.full,
                  },
                  pressed ? { opacity: 0.86, transform: [{ scale: 0.96 }] } : undefined,
                ]}
              >
                <AppText variant="label" color="secondary">
                  Fechar
                </AppText>
              </Pressable>
            </View>

            <View
              style={[
                styles.divider,
                {
                  backgroundColor: theme.colors.border,
                  marginHorizontal: theme.spacing.xl,
                },
              ]}
            />

            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                {
                  paddingHorizontal: theme.spacing.xl,
                  paddingTop: theme.spacing.lg,
                  paddingBottom: theme.spacing.lg,
                },
                contentContainerStyle,
              ]}
            >
              {children}
            </ScrollView>

            {footer ? (
              <View
                style={[
                  styles.footer,
                  {
                    borderTopColor: theme.colors.border,
                    backgroundColor: theme.colors.surfaceElevated,
                    paddingHorizontal: theme.spacing.xl,
                    paddingTop: theme.spacing.lg,
                  },
                ]}
              >
                {footer}
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardWrap: {
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopWidth: StyleSheet.hairlineWidth,
    maxHeight: '92%',
    paddingTop: 8,
  },
  handleWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  handle: {
    height: 4,
    width: 42,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  closeButton: {
    alignItems: 'center',
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 14,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
