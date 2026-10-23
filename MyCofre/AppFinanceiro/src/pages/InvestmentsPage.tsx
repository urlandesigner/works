import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { MetricCard } from '../components/ui/MetricCard'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useValuesVisibility } from '../contexts/ValuesVisibilityContext'
import { useInvestments } from '../contexts/InvestmentsContext'
import { useAccounts } from '../contexts/AccountsContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { CardChevronIcon } from '../components/ui/CardChevronLink'
import { Plus, TrendingUp } from 'lucide-react'
import { financeGainText, financeLossText } from '../lib/financeDisplay'

const investmentTypeLabels: Record<string, string> = {
  fixed_income: 'Renda fixa',
  variable_income: 'Renda variável',
  crypto: 'Cripto',
}


function getReturnPercent(invested: number, current: number): number | null {
  if (invested === 0) return null
  return ((current - invested) / invested) * 100
}

export function InvestmentsPage() {
  const { formatCurrency } = useValuesVisibility()
  const { investments } = useInvestments()
  const { getAccountById } = useAccounts()
  const { setTitle } = useHeaderActions()
  const getAccountName = (accountId: string | null) =>
    accountId ? getAccountById(accountId)?.name ?? '—' : 'Sem conta vinculada'
  const totalInvested = investments.reduce((s, i) => s + i.invested_amount, 0)
  const totalCurrent = investments.reduce((s, i) => s + i.current_amount, 0)
  const totalReturn = totalCurrent - totalInvested

  useEffect(() => {
    setTitle('Investimentos')
    return () => setTitle('', null)
  }, [setTitle])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <Button to="/investments/new">
          <Plus className="h-4 w-4" />
          Novo investimento
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Total investido"
          value={formatCurrency(totalInvested)}
          valueClassName="font-medium text-gray-600 dark:text-slate-100"
        />
        <MetricCard
          title="Valor atual"
          value={formatCurrency(totalCurrent)}
          valueClassName="font-bold text-gray-900 dark:text-slate-100"
        />
        <MetricCard
          title="Rentabilidade"
          value={
            <>
              {totalReturn >= 0 ? '+' : ''}
              {formatCurrency(totalReturn)}
            </>
          }
          valueClassName={
            totalReturn >= 0
              ? `font-medium ${financeGainText}`
              : `font-medium ${financeLossText}`
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {investments.length === 0 ? (
          <Card>
            <EmptyState
              icon={TrendingUp}
              title="Nenhum investimento ainda"
              description="Cadastre ativos em renda fixa, variável ou cripto vinculados às suas contas."
            >
              <Button to="/investments/new">
                <Plus className="h-4 w-4" />
                Novo investimento
              </Button>
            </EmptyState>
          </Card>
        ) : (
          investments.map((inv) => {
          const returnAmount = inv.current_amount - inv.invested_amount
          const returnPercent = getReturnPercent(
            inv.invested_amount,
            inv.current_amount
          )
          return (
            <Link key={inv.id} to={`/investments/${inv.id}`}>
              <Card className="overflow-hidden transition hover:border-slate-300">
                <div className="card-block-header items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="card-block-title">{inv.name}</h2>
                    <p className="mt-2 text-sm text-ds-muted">
                      {getAccountName(inv.account_id)}
                    </p>
                    <p className="mt-1 text-xs text-ds-muted">
                      {investmentTypeLabels[inv.type] ?? inv.type}
                    </p>
                  </div>
                  <CardChevronIcon className="shrink-0 self-start" />
                </div>
                <div className="card-block-body-flush px-6 py-4">
                  <dl className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <dt className="text-ds-muted">
                        Valor investido
                      </dt>
                      <dd className="font-medium tabular-nums text-slate-600 dark:text-slate-200">
                        {formatCurrency(inv.invested_amount)}
                      </dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-ds-muted">
                        Valor atual
                      </dt>
                      <dd className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {formatCurrency(inv.current_amount)}
                      </dd>
                    </div>
                    <div className="flex justify-between text-sm">
                      <dt className="text-ds-muted">
                        Rentabilidade
                      </dt>
                      <dd className="text-right font-medium tabular-nums">
                        <span
                          className={
                            returnAmount >= 0 ? financeGainText : financeLossText
                          }
                        >
                          {returnAmount >= 0 ? '+' : ''}
                          {formatCurrency(returnAmount)}
                        </span>
                        {returnPercent !== null && (
                          <span
                            className={
                              returnPercent >= 0
                                ? `ml-1 ${financeGainText}`
                                : `ml-1 ${financeLossText}`
                            }
                          >
                            ({returnPercent >= 0 ? '+' : ''}
                            {returnPercent.toFixed(2)}%)
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </Card>
            </Link>
          )
        })
        )}
      </div>
    </div>
  )
}
