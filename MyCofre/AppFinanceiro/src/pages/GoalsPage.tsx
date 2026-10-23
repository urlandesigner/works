import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { GoalProjectionCard } from '../components/goals/GoalProjectionCard'
import {
  CardChevronLink,
  cardHeaderActionsClass,
} from '../components/ui/CardChevronLink'
import { EditIconButton } from '../components/ui/EditIconButton'
import { EmptyState } from '../components/ui/EmptyState'
import { useValuesVisibility } from '../contexts/ValuesVisibilityContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { useGoals } from '../contexts/GoalsContext'
import { useAccounts } from '../contexts/AccountsContext'
import { useTransactions } from '../contexts/TransactionsContext'
import { useCreditCards } from '../contexts/CreditCardsContext'
import { useInvestmentsForNetWorth } from '../hooks/useInvestmentsForNetWorth'
import {
  getGoalCurrentAmount,
  getGoalProgressPercentUI,
} from '../lib/goalProgress'
import {
  computeGoalProjectionView,
  selectGoalForDashboardProjection,
} from '../lib/goalProjection'
import { getMonthIncome, getMonthTotalExpensesWithCardBills } from '../lib'
import { GoalCardSkeleton } from '../components/ui/skeleton-compositions'
import { MobileFab } from '../components/ui/MobileFab'
import { Plus, Target } from 'lucide-react'
import { useMediaQuery } from '../hooks/useMediaQuery'

export function GoalsPage() {
  const isLg = useMediaQuery('(min-width: 1024px)')
  const { formatCurrency } = useValuesVisibility()
  const { setActions, setTitle, setMobileFab } = useHeaderActions()
  const {
    goals,
    loading: goalsLoading,
    error: goalsError,
    refetchGoals,
  } = useGoals()
  const { accounts } = useAccounts()
  const { transactions } = useTransactions()
  const { investmentsForNetWorth } = useInvestmentsForNetWorth()
  const { creditCards, getBillsByCardId } = useCreditCards()
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const allCreditCardBills = useMemo(
    () => creditCards.flatMap((c) => getBillsByCardId(c.id)),
    [creditCards, getBillsByCardId]
  )

  const goalCardFinancialArgs = useMemo(
    () =>
      [accounts, transactions, investmentsForNetWorth, allCreditCardBills] as const,
    [accounts, transactions, investmentsForNetWorth, allCreditCardBills]
  )

  const monthIncome = useMemo(
    () => getMonthIncome(transactions, currentYear, currentMonth),
    [transactions, currentYear, currentMonth]
  )
  const monthExpenses = useMemo(
    () =>
      getMonthTotalExpensesWithCardBills(
        transactions,
        allCreditCardBills,
        currentYear,
        currentMonth
      ),
    [transactions, allCreditCardBills, currentYear, currentMonth]
  )
  const monthBalance = monthIncome - monthExpenses

  const goalProjection = useMemo(() => {
    const getCurrent = (g: (typeof goals)[number]) =>
      getGoalCurrentAmount(
        g,
        accounts,
        transactions,
        investmentsForNetWorth,
        allCreditCardBills
      )
    const goal = selectGoalForDashboardProjection(goals, getCurrent)
    const current = goal ? getCurrent(goal) : 0
    return computeGoalProjectionView(goal, current, monthBalance)
  }, [
    goals,
    accounts,
    transactions,
    investmentsForNetWorth,
    allCreditCardBills,
    monthBalance,
  ])

  useEffect(() => {
    setTitle('Metas')
    return () => setTitle('', null)
  }, [setTitle])
  useEffect(() => {
    setActions(
      <Button to="/goals/new">
        <Plus className="h-4 w-4" />
        Nova meta
      </Button>
    )
    return () => setActions(null)
  }, [setActions])
  useEffect(() => {
    setMobileFab(
      <MobileFab
        to="/goals/new"
        ariaLabel="Nova meta"
        icon={<Plus className="h-7 w-7" strokeWidth={2.25} aria-hidden />}
      />
    )
    return () => setMobileFab(null)
  }, [setMobileFab])

  return (
    <div className="space-y-6">
      {goalsError ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          <p className="font-medium">Erro ao carregar metas</p>
          <p className="mt-1 text-red-800/90">{goalsError}</p>
          <Button
            type="button"
            variant="secondary"
            className="mt-3 text-xs"
            onClick={() => void refetchGoals()}
          >
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <GoalProjectionCard
        goalProjection={goalProjection}
        formatCurrency={formatCurrency}
        compact={!isLg}
      />

      <div className="grid gap-4 sm:grid-cols-2" aria-busy={goalsLoading}>
        {goalsLoading ? (
          <>
            <GoalCardSkeleton className="sm:col-span-2" />
            <GoalCardSkeleton />
            <GoalCardSkeleton />
          </>
        ) : goals.length === 0 ? (
          <Card>
            <EmptyState
              icon={Target}
              title="Nenhuma meta cadastrada"
              description="Defina objetivos com valor alvo e prazo para acompanhar o progresso aqui."
            >
              <Button to="/goals/new">
                <Plus className="h-4 w-4" />
                Nova meta
              </Button>
            </EmptyState>
          </Card>
        ) : (
          goals.map((goal) => {
            const current = getGoalCurrentAmount(goal, ...goalCardFinancialArgs)
            const progress = getGoalProgressPercentUI(goal, current)
            const progressFill = Math.min(100, Math.max(0, progress)) / 100

            return (
              <Card
                key={goal.id}
                className="overflow-hidden transition-[border-color,box-shadow] duration-200 ease-out hover:border-slate-300 hover:shadow-md motion-reduce:transition-none"
              >
                <div className="card-block-header items-start gap-4">
                  <Link
                    to={`/goals/${goal.id}`}
                    className="min-w-0 flex-1 rounded-lg pr-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:ring-offset-2 dark:focus-visible:ring-white/20 dark:focus-visible:ring-offset-transparent"
                  >
                    <h2 className="card-block-title">{goal.name}</h2>
                  </Link>
                  <div className={cardHeaderActionsClass}>
                    <EditIconButton
                      size="compact"
                      to={`/goals/${goal.id}/edit`}
                      aria-label={`Editar meta ${goal.name}`}
                      title="Editar meta"
                      className="self-start"
                    />
                    <CardChevronLink
                      to={`/goals/${goal.id}`}
                      aria-label={`Abrir meta ${goal.name}`}
                      title="Ver detalhes"
                    />
                  </div>
                </div>
                <div className="card-block-body-flush px-6 py-4">
                  <p className="font-display text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-[var(--text-primary)]">
                    {formatCurrency(current)}
                  </p>
                  <p className="mt-1 text-sm font-medium text-ds-muted-strong">
                    de {formatCurrency(goal.target_amount)}
                  </p>
                  <Link
                    to={`/goals/${goal.id}`}
                    className="mt-5 block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:ring-offset-2 dark:focus-visible:ring-white/20 dark:focus-visible:ring-offset-transparent"
                  >
                    <div className="ui-goal-progress-track">
                      <div
                        className="ui-goal-progress-fill"
                        style={{ transform: `scaleX(${progressFill})` }}
                      />
                    </div>
                    <p className="mt-3 font-display text-lg font-medium tabular-nums text-slate-600 dark:text-[var(--text-secondary)]">
                      {progress.toFixed(0)}%
                    </p>
                  </Link>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
