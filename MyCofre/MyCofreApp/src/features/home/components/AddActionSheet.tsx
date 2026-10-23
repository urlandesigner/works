import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components';
import { useTheme } from '../../../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectAssistant: () => void;
  onSelectManual: () => void;
};

type OptionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  highlighted?: boolean;
  onPress: () => void;
};

function OptionCard({
  icon,
  title,
  description,
  highlighted = false,
  onPress,
}: OptionCardProps) {
  const { theme, colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = highlighted
    ? isDark
      ? 'rgba(59,130,246,0.16)'
      : 'rgba(239,246,255,0.96)'
    : theme.colors.surface;

  const borderColor = highlighted
    ? isDark
      ? 'rgba(96,165,250,0.32)'
      : 'rgba(147,197,253,0.72)'
    : theme.colors.border;

  const iconBackground = highlighted
    ? isDark
      ? 'rgba(96,165,250,0.24)'
      : 'rgba(59,130,246,0.12)'
    : theme.colors.accentMuted;

  const iconColor = highlighted
    ? isDark
      ? '#BFDBFE'
      : '#2563EB'
    : theme.colors.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        {
          backgroundColor,
          borderColor,
          borderRadius: theme.radius.xl,
        },
        theme.shadows.sm,
        pressed && styles.optionCardPressed,
      ]}
    >
      <View
        style={[
          styles.optionIconWrap,
          {
            backgroundColor: iconBackground,
            borderColor,
            borderRadius: theme.radius.lg,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.optionContent}>
        <AppText variant="label">{title}</AppText>
        <AppText
          variant="bodySmall"
          color="secondary"
          style={{ marginTop: theme.spacing.xxs }}
        >
          {description}
        </AppText>
      </View>
    </Pressable>
  );
}

export function AddActionSheet({
  visible,
  onClose,
  onSelectAssistant,
  onSelectManual,
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar opções de adicionar"
          style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}
          onPress={onClose}
        />

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
            <AppText variant="title3" style={styles.headerTitle}>
              Como você quer adicionar?
            </AppText>

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
                pressed && styles.closeButtonPressed,
              ]}
            >
              <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
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

          <View
            style={{
              gap: theme.spacing.md,
              paddingHorizontal: theme.spacing.xl,
              paddingTop: theme.spacing.lg,
            }}
          >
            <OptionCard
              highlighted
              icon="sparkles"
              title="Assistente"
              description="Descreva em linguagem natural"
              onPress={onSelectAssistant}
            />
            <OptionCard
              icon="list"
              title="Manual"
              description="Preencha os campos"
              onPress={onSelectManual}
            />
          </View>
        </View>
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
  sheet: {
    borderTopWidth: StyleSheet.hairlineWidth,
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
  headerTitle: {
    flex: 1,
    paddingRight: 12,
  },
  closeButton: {
    alignItems: 'center',
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  closeButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 14,
  },
  optionCard: {
    alignItems: 'flex-start',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 96,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionCardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  optionIconWrap: {
    alignItems: 'center',
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    marginRight: 14,
    width: 44,
  },
  optionContent: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
});
