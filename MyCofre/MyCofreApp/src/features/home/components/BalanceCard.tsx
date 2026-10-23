import { View } from 'react-native';

import { AppCard } from '../../../components/AppCard';
import { AppText } from '../../../components/AppText';
import { useValuesVisibility } from '../../../features/values-visibility';
import { formatCurrencyMasked } from '../../../shared/formatCurrencyMasked';
import { useTheme } from '../../../theme';

type Props = {
  /** `getNetPatrimony` — patrimônio líquido (alinhado ao web). */
  netPatrimony: number;
  /** `getTotalCash` — saldo em contas (caixa). */
  cashInAccounts: number;
};

export function BalanceCard({ netPatrimony, cashInAccounts }: Props) {
  const { theme } = useTheme();
  const { isBalanceHidden } = useValuesVisibility();

  return (
    <AppCard
      style={{
        marginBottom: theme.spacing.sectionGap,
        padding: theme.spacing.xxl,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surfaceElevated,
        ...theme.shadows.md,
      }}
    >
      <View
        style={{
          alignSelf: 'flex-start',
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.accentMuted,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
        }}
      >
        <AppText variant="overline" color="secondary">
          Patrimônio líquido
        </AppText>
      </View>
      <AppText
        variant="display"
        style={{
          marginTop: theme.spacing.xl,
          fontVariant: ['tabular-nums'],
          fontSize: 42,
          lineHeight: 48,
          letterSpacing: -1.1,
        }}
      >
        {formatCurrencyMasked(netPatrimony, isBalanceHidden)}
      </AppText>
      <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.sm }}>
        Contas + investimentos menos faturas em aberto
      </AppText>

      <View
        style={{
          marginTop: theme.spacing.xl,
          paddingTop: theme.spacing.lg,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <AppText variant="caption" color="muted">
            Saldo em contas
          </AppText>
          <AppText variant="bodySmall" style={{ fontVariant: ['tabular-nums'], fontWeight: '600' }}>
            {formatCurrencyMasked(cashInAccounts, isBalanceHidden)}
          </AppText>
        </View>
      </View>
    </AppCard>
  );
}
