import { View } from 'react-native';

import { AppCard } from '../../../components/AppCard';
import { AppText } from '../../../components/AppText';
import { useValuesVisibility } from '../../../features/values-visibility';
import { formatCurrencyMasked } from '../../../shared/formatCurrencyMasked';
import { useTheme } from '../../../theme';
import type { SavingsGoal } from '../../../types';
import { formatDateShort } from '../../../utils/formatDate';

type Props = {
  goal: SavingsGoal;
  /**
   * Percentual 0–100 para a barra (use `getGoalProgressPercentUI` da lógica compartilhada).
   * Se omitido, deriva de current/target com proteção para meta ≤ 0.
   */
  progressPercent?: number;
};

export function GoalProgressCard({ goal, progressPercent }: Props) {
  const { theme } = useTheme();
  const { isBalanceHidden } = useValuesVisibility();
  const progress = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        progressPercent ??
          (goal.targetAmount <= 0
            ? 0
            : (goal.currentAmount / goal.targetAmount) * 100)
      )
    )
  );

  return (
    <AppCard style={{ marginBottom: theme.spacing.sectionGap, padding: theme.spacing.xl, ...theme.shadows.sm }}>
      <AppText variant="label" color="secondary">
        Meta em destaque
      </AppText>
      <AppText variant="title3" style={{ marginTop: theme.spacing.sm }}>
        {goal.title}
      </AppText>
      <AppText variant="caption" color="muted" style={{ marginTop: theme.spacing.xs }}>
        Prazo {formatDateShort(goal.deadline)}
      </AppText>

      <View style={{ marginTop: theme.spacing.lg }}>
        <View
          style={{
            height: 10,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.track,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: theme.radius.full,
              backgroundColor: theme.colors.accent,
            }}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: theme.spacing.md,
          }}
        >
          <AppText variant="caption" color="secondary">
            {formatCurrencyMasked(goal.currentAmount, isBalanceHidden)}
          </AppText>
          <AppText variant="caption" color="muted" style={{ fontVariant: ['tabular-nums'] }}>
            {progress}% · {formatCurrencyMasked(goal.targetAmount, isBalanceHidden)}
          </AppText>
        </View>
      </View>
    </AppCard>
  );
}
