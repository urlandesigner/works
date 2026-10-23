import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { MetricCard } from '../components/ui/MetricCard'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useValuesVisibility } from '../contexts/ValuesVisibilityContext'
import { useSubscriptions } from '../contexts/SubscriptionsContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import type { Subscription } from '../types'
import { Plus, Repeat } from 'lucide-react'

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
}

const statusBadgeClasses: Record<string, string> = {
  active:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-200',
  inactive: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-200',
}

/** Valor mensal equivalente (para totais). */
function amountPerMonth(periodicity: string | undefined, amount: number): number {
  return periodicity === 'annual' ? amount / 12 : amount
}

/** Valor anual equivalente (para totais). */
function amountPerYear(periodicity: string | undefined, amount: number): number {
  return periodicity === 'annual' ? amount : amount * 12
}

function SubscriptionTableRow({
  subscription,
  formatCurrency,
  columns,
  onSelect,
}: {
  subscription: Subscription
  formatCurrency: (value: number) => string
  columns: 'monthly' | 'annual'
  onSelect: () => void
}) {
  const s = subscription
  const isAnnual = columns === 'annual'

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className="border-b border-gray-100 last:border-b-0 transition-colors hover:bg-gray-50/90 focus:bg-gray-50/90 focus:outline-none dark:border-white/[0.08] dark:hover:bg-white/[0.04] dark:focus:bg-white/[0.04]"
    >
      <td className="min-w-0 px-6 py-3">
        <span className="block truncate font-medium text-gray-900 dark:text-slate-100">
          {s.name}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-3 text-right tabular-nums text-gray-900 dark:text-slate-100">
        {isAnnual
          ? formatCurrency(s.monthly_amount)
          : `${formatCurrency(s.monthly_amount)}/mês`}
      </td>
      <td className="whitespace-nowrap px-6 py-3 tabular-nums text-gray-600 dark:text-slate-400">
        {s.billing_day}
      </td>
      <td className="min-w-0 px-6 py-3">
        <span
          className="block truncate text-gray-600 dark:text-slate-400"
          title={s.payment_method ?? undefined}
        >
          {s.payment_method ?? '—'}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            statusBadgeClasses[s.status] ?? 'bg-gray-100 text-gray-700'
          }`}
        >
          {statusLabels[s.status] ?? s.status}
        </span>
      </td>
    </tr>
  )
}

export function SubscriptionsPage() {
  const navigate = useNavigate()
  const { formatCurrency } = useValuesVisibility()
  const { subscriptions } = useSubscriptions()
  const { setTitle } = useHeaderActions()
  useEffect(() => {
    setTitle('Assinaturas')
    return () => setTitle('', null)
  }, [setTitle])

  const monthly = subscriptions.filter((s) => (s.periodicity ?? 'monthly') === 'monthly')
  const annual = subscriptions.filter((s) => s.periodicity === 'annual')

  const active = subscriptions.filter((s) => s.status === 'active')
  const totalMonthly = active.reduce(
    (sum, s) => sum + amountPerMonth(s.periodicity, s.monthly_amount),
    0
  )
  const totalAnnual = active.reduce(
    (sum, s) => sum + amountPerYear(s.periodicity, s.monthly_amount),
    0
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <Button to="/subscriptions/new">
          <Plus className="h-4 w-4" />
          Nova assinatura
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <EmptyState
            icon={Repeat}
            title="Nenhuma assinatura cadastrada"
            description="Agrupe serviços mensais e anuais para saber quanto sai todo mês."
          >
            <Button to="/subscriptions/new">
              <Plus className="h-4 w-4" />
              Nova assinatura
            </Button>
          </EmptyState>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard title="Total mensal (ativas)" value={formatCurrency(totalMonthly)} />
            <MetricCard title="Total anual (ativas)" value={formatCurrency(totalAnnual)} />
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start lg:gap-3">
          <section className="min-w-0">
            <Card className="overflow-hidden">
              <div className="card-block-header">
                <h2 className="card-block-title">Assinaturas mensais</h2>
              </div>
              {monthly.length > 0 ? (
                <div className="card-block-body-flush min-w-0 overflow-x-auto">
                  <table className="w-full min-w-0 table-fixed border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/90 dark:border-white/[0.08] dark:bg-zinc-900/40">
                        <th className="w-[30%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">
                          Serviço
                        </th>
                        <th className="w-[20%] px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">
                          Valor
                        </th>
                        <th className="w-[10%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">
                          Dia
                        </th>
                        <th className="w-[24%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">
                          Pagamento
                        </th>
                        <th className="w-[16%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthly.map((sub) => (
                        <SubscriptionTableRow
                          key={sub.id}
                          subscription={sub}
                          formatCurrency={formatCurrency}
                          columns="monthly"
                          onSelect={() => navigate(`/subscriptions/${sub.id}`)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="card-block-body-flush px-6 py-8">
                  <p className="card-prose m-0">Nenhuma assinatura mensal</p>
                </div>
              )}
            </Card>
          </section>

          <section className="min-w-0">
            <Card className="overflow-hidden">
              <div className="card-block-header">
                <h2 className="card-block-title">Assinaturas anuais</h2>
              </div>
              {annual.length > 0 ? (
                <div className="card-block-body-flush min-w-0 overflow-x-auto">
                  <table className="w-full min-w-0 table-fixed border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/90 dark:border-white/[0.08] dark:bg-zinc-900/40">
                        <th className="w-[30%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">
                          Serviço
                        </th>
                        <th className="w-[20%] px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">
                          Valor anual
                        </th>
                        <th className="w-[10%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">
                          Dia
                        </th>
                        <th className="w-[24%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">
                          Pagamento
                        </th>
                        <th className="w-[16%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {annual.map((sub) => (
                        <SubscriptionTableRow
                          key={sub.id}
                          subscription={sub}
                          formatCurrency={formatCurrency}
                          columns="annual"
                          onSelect={() => navigate(`/subscriptions/${sub.id}`)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="card-block-body-flush px-6 py-8">
                  <p className="card-prose m-0">Nenhuma assinatura anual</p>
                </div>
              )}
            </Card>
          </section>
        </div>
        </div>
      )}
    </div>
  )
}
