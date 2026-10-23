import { useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EditIconButton } from '../components/ui/EditIconButton'
import { useValuesVisibility } from '../contexts/ValuesVisibilityContext'
import { useGoals } from '../contexts/GoalsContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { useToast } from '../contexts/ToastContext'
import { useAccounts } from '../contexts/AccountsContext'
import { useTransactions } from '../contexts/TransactionsContext'
import { useCreditCards } from '../contexts/CreditCardsContext'
import { useInvestmentsForNetWorth } from '../hooks/useInvestmentsForNetWorth'
import {
  getGoalCurrentAmount,
  getGoalProgressPercentUI,
  getGoalType,
} from '../lib/goalProgress'
import { Trash2 } from 'lucide-react'

export function GoalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setTitle } = useHeaderActions()
  const { formatCurrency } = useValuesVisibility()
  const { getGoalById, deleteGoal, loading: goalsLoading } = useGoals()
  const { success } = useToast()
  const goal = id ? getGoalById(id) : undefined
  const { accounts } = useAccounts()
  const { transactions } = useTransactions()
  const { investmentsForNetWorth } = useInvestmentsForNetWorth()
  const { creditCards, getBillsByCardId } = useCreditCards()

  const allCreditCardBills = useMemo(
    () => creditCards.flatMap((c) => getBillsByCardId(c.id)),
    [creditCards, getBillsByCardId]
  )

  const financialArgs = useMemo(
    () =>
      [accounts, transactions, investmentsForNetWorth, allCreditCardBills] as const,
    [accounts, transactions, investmentsForNetWorth, allCreditCardBills]
  )

  const currentAmount = goal
    ? getGoalCurrentAmount(goal, ...financialArgs)
    : 0
  const progress = goal
    ? getGoalProgressPercentUI(goal, currentAmount)
    : 0
  const progressFill = Math.min(100, Math.max(0, progress)) / 100
  const isNetWorth = goal ? getGoalType(goal) === 'net_worth' : false

  useEffect(() => {
    if (!id) setTitle('Meta')
    else if (!goal) setTitle('Meta não encontrada', 'A meta pode ter sido excluída.')
    else setTitle(goal.name, `Meta · ${id}`)
    return () => setTitle('', null)
  }, [id, goal, setTitle])

  if (!id) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="py-4 text-sm text-ds-muted">
            Identificador não informado.
          </p>
          <Button to="/goals" variant="secondary">
            Voltar às metas
          </Button>
        </Card>
      </div>
    )
  }

  if (goalsLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600"
          aria-hidden
        />
        <p className="text-sm text-ds-muted">Carregando meta…</p>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="space-y-6">
        <Card>
          <Button to="/goals" variant="secondary">
            Voltar às metas
          </Button>
        </Card>
      </div>
    )
  }

  const handleDelete = () => {
    if (
      window.confirm('Excluir esta meta? Esta ação não pode ser desfeita.')
    ) {
      void (async () => {
        const ok = await deleteGoal(id)
        if (ok) {
          success('Meta excluída.')
          navigate('/goals')
        }
      })()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2">
        <EditIconButton
          to={`/goals/${id}/edit`}
          aria-label="Editar meta"
          title="Editar meta"
        />
        <Button type="button" variant="danger" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
      </div>

      <Card>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-ds-muted">
              Valor da meta
            </dt>
            <dd className="mt-0.5 text-xl font-medium tabular-nums text-slate-600 dark:text-slate-300">
              {formatCurrency(goal.target_amount)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-ds-muted">
              Valor atual
            </dt>
            <dd className="mt-0.5 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {formatCurrency(currentAmount)}
            </dd>
            {isNetWorth && (
              <p className="mt-1.5 text-xs text-ds-muted">
                Patrimônio líquido: contas + investimentos, menos faturas de
                cartão em aberto (igual à visão geral).
              </p>
            )}
          </div>
          <div>
            <dt className="text-sm font-medium text-ds-muted">
              Progresso
            </dt>
            <dd className="mt-2">
              <div className="ui-goal-progress-track">
                <div
                  className="ui-goal-progress-fill"
                  style={{ transform: `scaleX(${progressFill})` }}
                />
              </div>
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                {progress.toFixed(0)}%
              </p>
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
