import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { Target } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import type { GoalProjectionView } from '../../lib/goalProjection'

type ProjectionBodiesVariant = 'card' | 'embedded'

function GoalProjectionBodies({
  goalProjection,
  formatCurrency,
  variant,
  compact,
}: {
  goalProjection: GoalProjectionView
  formatCurrency: (value: number) => string
  variant: ProjectionBodiesVariant
  compact?: boolean
}) {
  const leadClass =
    variant === 'card'
      ? compact
        ? 'mt-3 text-xs font-medium leading-snug text-gray-800 dark:text-[var(--text-secondary)]'
        : 'mt-4 text-sm font-medium leading-relaxed text-gray-800 dark:text-[var(--text-secondary)]'
      : 'mt-0 text-sm font-normal leading-relaxed text-slate-600 dark:text-[var(--text-secondary)]'
  const gridClass = variant === 'card' ? (compact ? 'mt-3' : 'mt-4') : 'mt-3'
  const footnoteClass =
    variant === 'card'
      ? 'mt-3 text-xs leading-relaxed text-gray-400 dark:text-[var(--text-muted)]'
      : 'mt-2.5 text-[11px] leading-relaxed text-slate-400 dark:text-[var(--text-muted)]'

  if (goalProjection.kind === 'no_goals') {
    return (
      <div
        className={
          variant === 'card'
            ? 'mt-4 rounded-xl border border-dashed border-violet-200/60 bg-white/50 px-4 py-5 text-center sm:px-5 dark:border-violet-800/50 dark:bg-violet-950/25'
            : 'rounded-lg border border-dashed border-violet-200/50 bg-white/60 px-3 py-4 text-center dark:border-violet-800/45 dark:bg-violet-950/20'
        }
      >
        <p
          className={
            variant === 'card'
              ? 'text-sm text-gray-600 dark:text-slate-400'
              : 'text-xs text-slate-600 dark:text-slate-400'
          }
        >
          {compact ? (
            <>
              Cadastre uma meta para estimar o prazo com saldo mensal positivo.
            </>
          ) : (
            <>
              Cadastre uma meta para ver em quanto tempo você pode alcançá-la
              mantendo um saldo mensal positivo.
            </>
          )}
        </p>
        <Button to="/goals/new" variant="secondary" className="mt-3 text-xs">
          Nova meta
        </Button>
      </div>
    )
  }

  if (goalProjection.kind === 'achieved') {
    return (
      <>
        <p className={leadClass}>
          A meta{' '}
          <span
            className={
              variant === 'card'
                ? 'font-semibold text-gray-900 dark:text-slate-100'
                : 'font-medium text-slate-800 dark:text-slate-200'
            }
          >
            &ldquo;{goalProjection.goal.name}&rdquo;
          </span>{' '}
          já foi atingida com o valor atual. Parabéns!
        </p>
        <div className={`${gridClass} grid gap-3 sm:grid-cols-2`}>
          <div
            className={
              variant === 'card'
                ? 'rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-white/[0.08] dark:bg-zinc-800/50'
                : 'rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)]'
            }
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              Valor atual
            </p>
            <p className="mt-0.5 font-display text-sm font-semibold tabular-nums text-gray-900 dark:text-slate-100">
              {formatCurrency(goalProjection.current)}
            </p>
          </div>
          <div
            className={
              variant === 'card'
                ? 'rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-white/[0.08] dark:bg-zinc-800/50'
                : 'rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)]'
            }
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              Progresso
            </p>
            <p className="mt-0.5 font-display text-sm font-semibold tabular-nums text-emerald-600">
              {goalProjection.progressPct.toFixed(0)}%
            </p>
          </div>
        </div>
      </>
    )
  }

  if (goalProjection.kind === 'no_positive_flow') {
    return (
      <>
        <p className={leadClass}>
          Com o saldo mensal atual (receitas menos despesas deste mês) não
          positivo, não é possível estimar quando você alcançará a meta{' '}
          <span
            className={
              variant === 'card'
                ? 'font-semibold text-gray-900 dark:text-slate-100'
                : 'font-medium text-slate-800 dark:text-slate-200'
            }
          >
            &ldquo;{goalProjection.goal.name}&rdquo;
          </span>
          .
        </p>
        <div className={`${gridClass} grid gap-3 sm:grid-cols-2`}>
          <div
            className={
              variant === 'card'
                ? 'rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-white/[0.08] dark:bg-zinc-800/50'
                : 'rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)]'
            }
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              Saldo do mês
            </p>
            <p
              className={`mt-0.5 font-display text-sm font-semibold tabular-nums ${
                goalProjection.monthBalance >= 0
                  ? 'text-gray-900 dark:text-slate-100'
                  : 'text-danger-600 dark:text-red-400'
              }`}
            >
              {formatCurrency(goalProjection.monthBalance)}
            </p>
          </div>
          <div
            className={
              variant === 'card'
                ? 'rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-white/[0.08] dark:bg-zinc-800/50'
                : 'rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)]'
            }
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              Progresso da meta
            </p>
            <p className="mt-0.5 font-display text-sm font-semibold tabular-nums text-gray-900 dark:text-slate-100">
              {goalProjection.progressPct.toFixed(0)}%
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <p className={leadClass}>
        Mantendo seu ritmo atual, você alcançará a meta{' '}
        <span
          className={
            variant === 'card'
              ? 'font-semibold text-gray-900 dark:text-slate-100'
              : 'font-medium text-slate-800 dark:text-slate-200'
          }
        >
          &ldquo;{goalProjection.goal.name}&rdquo;
        </span>{' '}
        em {goalProjection.horizonLabel}.
      </p>
      <div className={`${gridClass} grid gap-3 sm:grid-cols-2`}>
        <div
          className={
            variant === 'card'
              ? 'rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-white/[0.08] dark:bg-zinc-800/50'
              : 'rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)]'
          }
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-muted)]">
            Saldo mensal (média deste mês)
          </p>
          <p className="mt-0.5 font-display text-sm font-semibold tabular-nums text-emerald-600">
            {formatCurrency(goalProjection.monthBalance)}
          </p>
        </div>
        <div
          className={
            variant === 'card'
              ? 'rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-white/[0.08] dark:bg-zinc-800/50'
              : 'rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)]'
          }
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-muted)]">
            Progresso da meta
          </p>
          <p className="mt-0.5 font-display text-sm font-semibold tabular-nums text-gray-900 dark:text-[var(--text-primary)]">
            {goalProjection.progressPct.toFixed(0)}%
          </p>
        </div>
      </div>
      {!compact ? (
        <p className={footnoteClass}>
          Projeção indicativa: assume que o saldo mensal deste mês se repita nos
          próximos períodos.
        </p>
      ) : null}
    </>
  )
}

type GoalProjectionCardProps = {
  goalProjection: GoalProjectionView
  formatCurrency: (value: number) => string
  description?: string
  /** Layout mais enxuto (ex.: home mobile). */
  compact?: boolean
}

export function GoalProjectionCard({
  goalProjection,
  formatCurrency,
  description = 'Estimativa com base no saldo do mês (receitas − despesas), como na visão geral.',
  compact = false,
}: GoalProjectionCardProps) {
  return (
    <Card className="border-violet-200/50 bg-gradient-to-br from-violet-50/35 via-white to-slate-50/80 ring-1 ring-violet-900/[0.04] dark:border-violet-400/15 dark:from-violet-950/35 dark:via-zinc-900/90 dark:to-zinc-900/70 dark:ring-violet-400/10">
      <div
        className={clsx(
          'card-block-header items-start gap-3',
          compact && '!mb-3 gap-2'
        )}
      >
        <span
          className={clsx(
            'flex shrink-0 items-center justify-center rounded-xl bg-violet-100/80 text-violet-700 ring-1 ring-violet-900/10 dark:bg-violet-950/40 dark:text-violet-200 dark:ring-violet-400/15',
            compact ? 'h-9 w-9' : 'h-10 w-10'
          )}
          aria-hidden
        >
          <Target className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="card-block-title !mb-0 border-l-0 !pl-0">
            Projeção de metas
          </h2>
          {!compact ? (
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              {description}
            </p>
          ) : (
            <p className="mt-1 line-clamp-1 text-[11px] leading-snug text-gray-500 dark:text-slate-400">
              Com base no saldo do mês (receitas − despesas).
            </p>
          )}
        </div>
        {goalProjection.kind !== 'no_goals' ? (
          <Link
            to={`/goals/${goalProjection.goal.id}`}
            className="card-action-link shrink-0"
          >
            Ver meta
          </Link>
        ) : null}
      </div>

      <GoalProjectionBodies
        goalProjection={goalProjection}
        formatCurrency={formatCurrency}
        variant="card"
        compact={compact}
      />
    </Card>
  )
}
