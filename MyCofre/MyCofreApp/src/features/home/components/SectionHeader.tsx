import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/AppText';
import { useTheme } from '../../../theme';

type Props = {
  title: string;
  /** Rótulo acima (ex.: período) — tipografia overline */
  eyebrow?: string;
  /** `true`: destaque principal (title1). `false`: seção (title3). */
  large?: boolean;
  actionLabel?: string;
  onActionPress?: () => void;
  eyebrowSpacing?: number;
  topSpacing?: number;
  bottomSpacing?: number;
};

export function SectionHeader({
  title,
  eyebrow,
  large,
  actionLabel,
  onActionPress,
  eyebrowSpacing,
  topSpacing,
  bottomSpacing,
}: Props) {
  const { theme } = useTheme();
  const hasAction = Boolean(actionLabel && onActionPress);
  const resolvedTopSpacing = topSpacing ?? theme.spacing.sectionGap;
  const resolvedBottomSpacing = bottomSpacing ?? theme.spacing.md;

  return (
    <View
      style={{
        marginTop: resolvedTopSpacing,
        marginBottom: resolvedBottomSpacing,
      }}
    >
      {eyebrow ? (
        <AppText
          variant="overline"
          color="secondary"
          style={{ marginBottom: eyebrowSpacing ?? theme.spacing.xs }}
        >
          {eyebrow}
        </AppText>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.md,
          minHeight: 28,
        }}
      >
        <View
          style={[
            styles.titleWrap,
            !large
              ? { borderLeftWidth: 3, borderLeftColor: theme.colors.textPrimary, paddingLeft: 14 }
              : undefined,
          ]}
        >
          <AppText
            variant={large ? 'title1' : 'title3'}
            style={!large ? styles.sectionTitle : undefined}
          >
            {title}
          </AppText>
        </View>

        {hasAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            onPress={onActionPress}
            style={({ pressed }) => [
              styles.actionButton,
              {
                paddingHorizontal: theme.spacing.sm,
                borderRadius: theme.radius.lg,
              },
              pressed ? { opacity: 0.82 } : undefined,
            ]}
            hitSlop={6}
          >
            <AppText variant="label" color="secondary">
              {actionLabel}
            </AppText>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.textSecondary}
              style={{ marginLeft: 2 }}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    flexShrink: 0,
  },
});
