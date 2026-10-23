import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/AppText';
import { useValuesVisibility } from '../../../features/values-visibility';
import { formatCurrencyMasked } from '../../../shared/formatCurrencyMasked';
import { useTheme } from '../../../theme';
import type { Transaction } from '../../../types';
import { formatDateShort } from '../../../utils/formatDate';

type Props = {
  item: Transaction;
  isLast?: boolean;
  onPress?: () => void;
};

export function TransactionRow({ item, isLast, onPress }: Props) {
  const { theme } = useTheme();
  const { isBalanceHidden } = useValuesVisibility();
  const isIncome = item.type === 'income';
  const amountColor = isIncome ? theme.colors.success : theme.colors.danger;
  const prefix = isIncome ? '+' : '-';
  const iconName = isIncome ? 'arrow-down' : 'arrow-up';
  const iconBackground = isIncome ? `${theme.colors.success}20` : `${theme.colors.danger}20`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir detalhes da transação ${item.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          paddingVertical: theme.spacing.md,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: iconBackground,
            borderRadius: theme.radius.full,
          },
        ]}
      >
        <Ionicons name={iconName} size={16} color={amountColor} />
      </View>

      <View style={[styles.contentWrap, { paddingRight: theme.spacing.md }]}>
        <AppText
          variant="bodySmall"
          style={styles.title}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.title}
        </AppText>
        <AppText
          variant="caption"
          color="muted"
          style={[styles.metadata, { marginTop: theme.spacing.xxs }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.category}
        </AppText>
        <AppText
          variant="caption"
          color="muted"
          style={[styles.metadata, { marginTop: theme.spacing.xxs }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.accountLabel ?? 'Sem conta vinculada'}
        </AppText>
        <AppText
          variant="caption"
          color="muted"
          style={[styles.metadata, { marginTop: theme.spacing.xxs }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {formatDateShort(item.date)}
        </AppText>
      </View>

      <View style={styles.amountWrap}>
        <AppText
          variant="bodySmall"
          style={[
            styles.amount,
            {
              color: amountColor,
            },
          ]}
          numberOfLines={1}
        >
          {prefix}
          {formatCurrencyMasked(Math.abs(item.amount), isBalanceHidden)}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  contentWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: '700',
  },
  metadata: {
    lineHeight: 17,
  },
  amountWrap: {
    marginLeft: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 0,
  },
  amount: {
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
});
