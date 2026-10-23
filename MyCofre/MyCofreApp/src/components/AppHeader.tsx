import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';

import { useValuesVisibility } from '../features/values-visibility';
import type { RootTabParamList } from '../navigation/types';
import { useTheme } from '../theme';

import { AppText } from './AppText';

type Props = {
  title: string;
  eyebrow?: string;
  large?: boolean;
  onBackPress?: () => void;
  backLabel?: string;
};

const EYEBROW_SLOT_HEIGHT = 18;

export function AppHeader({
  title,
  eyebrow,
  large = true,
  onBackPress,
  backLabel = 'Voltar',
}: Props) {
  const { theme } = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { isBalanceHidden, toggleBalanceVisibility } = useValuesVisibility();

  return (
    <View style={[styles.container, { marginBottom: theme.spacing.xl }]}>
      <View style={styles.content}>
        <View style={[styles.eyebrowSlot, { minHeight: EYEBROW_SLOT_HEIGHT }]}>
          {eyebrow ? (
            <AppText variant="overline" color="secondary">
              {eyebrow}
            </AppText>
          ) : null}
        </View>

        <View style={styles.mainRow}>
          {onBackPress ? (
            <HeaderIconButton icon="arrow-back" label={backLabel} onPress={onBackPress} />
          ) : null}

          <View style={[styles.titleWrap, { paddingRight: theme.spacing.md }]}>
            <AppText variant={large ? 'title1' : 'title3'}>{title}</AppText>
          </View>

          <View style={styles.actions}>
            <HeaderIconButton
              icon={isBalanceHidden ? 'eye-off-outline' : 'eye-outline'}
              label={isBalanceHidden ? 'Mostrar saldo' : 'Ocultar saldo'}
              onPress={toggleBalanceVisibility}
            />
            <HeaderIconButton
              icon="notifications-outline"
              label="Abrir notificações"
              onPress={() => navigation.navigate('Notifications')}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function HeaderIconButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          borderRadius: theme.radius.full,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surfaceElevated,
        },
        pressed ? { opacity: 0.9, transform: [{ scale: 0.96 }] } : undefined,
      ]}
    >
      <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 68,
  },
  content: {
    minHeight: 68,
    justifyContent: 'space-between',
  },
  eyebrowSlot: {
    justifyContent: 'center',
    marginBottom: 8,
  },
  mainRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 42,
    gap: 8,
  },
  titleWrap: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 0,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
