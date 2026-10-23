import { View } from 'react-native';

import { AppCard } from '../../../components/AppCard';
import { AppText } from '../../../components/AppText';
import { useValuesVisibility } from '../../../features/values-visibility';
import { formatCurrencyMasked } from '../../../shared/formatCurrencyMasked';
import { useTheme } from '../../../theme';
import type { MonthlySummary } from '../../../types';

type Props = {
  summary: MonthlySummary;
};

export function MonthlySummaryCard({ summary }: Props) {
  const { theme } = useTheme();
  const { isBalanceHidden } = useValuesVisibility();
  const net = summary.income - summary.expense;

  return (
    <AppCard
      style={{
        marginBottom: theme.spacing.sectionGap,
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.surfaceElevated,
        ...theme.shadows.md,
      }}
    >
      <AppText variant="label" color="secondary" style={{ marginBottom: theme.spacing.md }}>
        Movimento do período
      </AppText>
      <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.track,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <AppText variant="caption" color="secondary">
            Entradas
          </AppText>
          <AppText variant="title2" color="success" style={{ marginTop: theme.spacing.xs }}>
            {formatCurrencyMasked(summary.income, isBalanceHidden)}
          </AppText>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.track,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <AppText variant="caption" color="secondary">
            Saídas
          </AppText>
          <AppText variant="title2" color="danger" style={{ marginTop: theme.spacing.xs }}>
            {formatCurrencyMasked(summary.expense, isBalanceHidden)}
          </AppText>
        </View>
      </View>

      <View
        style={{
          marginTop: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <AppText variant="caption" color="secondary">
          Resultado do período
        </AppText>
        <AppText
          variant="title2"
          style={{
            marginTop: theme.spacing.xs,
            fontVariant: ['tabular-nums'],
            fontSize: 24,
            lineHeight: 30,
            color: net >= 0 ? theme.colors.textPrimary : theme.colors.danger,
          }}
        >
          {formatCurrencyMasked(net, isBalanceHidden)}
        </AppText>
      </View>
    </AppCard>
  );
}
