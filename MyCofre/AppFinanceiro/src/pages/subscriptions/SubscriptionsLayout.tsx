import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { clsx } from 'clsx'
import { Card } from '../../components/ui/Card'
import { MetricCard } from '../../components/ui/MetricCard'
import { Button } from '../../components/ui/Button'
import { EditIconButton } from '../../components/ui/EditIconButton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { MobileFab } from '../../components/ui/MobileFab'
import { SubscriptionsPageSkeleton } from '../../components/ui/skeleton-compositions'
import { useValuesVisibility } from '../../contexts/ValuesVisibilityContext'
import { useSubscriptions } from '../../contexts/SubscriptionsContext'
import { useHeaderActions } from '../../contexts/HeaderActionsContext'
import type { Subscription } from '../../types'
import { Calendar, CalendarRange, Plus, Repeat } from 'lucide-react'

type SubscriptionPeriodTab = 'monthly' | 'annual'

const SUBSCRIPTION_PERIOD_TABS: {
  value: SubscriptionPeriodTab
  label: string
  icon: typeof Calendar
}[] = [
  { value: 'monthly', label: 'Mensal', icon: Calendar },
  { value: 'annual', label: 'Anual', icon: CalendarRange },
]

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
}

const statusBadgeClasses: Record<string, string> = {
  active:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-200',
  inactive: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-200',
}

function amountPerMonth(periodicity: string | undefined, amount: number): number {
  return periodicity === 'annual' ? amount / 12 : amount
}

function amountPerYear(periodicity: string | undefined, amount: number): number {
  return periodicity === 'annual' ? amount : amount * 12
}

function SubscriptionTableRow({
  subscription,
  formatCurrency,
  columns,
}: {
  subscription: Subscription
  formatCurrency: (value: number) => string
  columns: 'monthly' | 'annual'
}) {
  const s = subscription
  const isAnnual = columns === 'annual'

  return (
    <tr className="border-b border-gray-100 last:border-b-0 transition-colors hover:bg-gray-50/90 dark:border-white/[0.08] dark:hover:bg-white/[0.04]">
      <td className="min-w-0 px-6 py-3">
        <Link
          to={`/subscriptions/${s.id}`}
          className="block truncate font-medium text-gray-900 hover:text-brand-600 dark:text-slate-100 dark:hover:text-brand-300"
        >
          {s.name}
        </Link>
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
      <td className="px-4 py-3 sm:px-6">
        <div className="flex justify-end">
          <EditIconButton
            size="compact"
            to={`/subscriptions/${s.id}/edit`}
            aria-label={`Editar assinatura ${s.name}`}
            title="Editar assinatura"
          />
        </div>
      </td>
    </tr>
  )
}

export function SubscriptionsLayout() {
  const navigate = useNavigate()
  const outlet = useOutlet()
  const location = useLocation()
  const pathname = location.pathname
  const isNewRoute = pathname === '/subscriptions/new'
  const isEditRoute = /^\/subscriptions\/[^/]+\/edit$/.test(pathname)
  const isModalOpen = isNewRoute || isEditRoute
  const modalTitle = isNewRoute ? 'Nova assinatura' : 'Editar assinatura'

  const { formatCurrency } = useValuesVisibility()
  const { subscriptions, loading: subscriptionsLoading } = useSubscriptions()

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
  const { setActions, setTitle, setMobileFab } = useHeaderActions()
  const [periodTab, setPeriodTab] = useState<SubscriptionPeriodTab>('monthly')

  useEffect(() => {
    setTitle('Assinaturas')
    return () => setTitle('', null)
  }, [setTitle])
  useEffect(() => {
    setActions(
      <Button to="/subscriptions/new">
        <Plus className="h-4 w-4" />
        Nova assinatura
      </Button>
    )
    return () => setActions(null)
  }, [setActions])
  useEffect(() => {
    setMobileFab(
      <MobileFab
        to="/subscriptions/new"
        ariaLabel="Nova assinatura"
        icon={<Plus className="h-7 w-7" strokeWidth={2.25} aria-hidden />}
      />
    )
    return () => setMobileFab(null)
  }, [setMobileFab])

  return (
    <>
      {subscriptionsLoading ? (
        <div aria-busy="true">
          <SubscriptionsPageSkeleton />
        </div>
      ) : subscriptions.length === 0 ? (
        <Card>
          <EmptyState
            icon={Repeat}
            title="Nenhuma assinatura cadastrada"
            description="Controle Netflix, Spotify, planos anuais e outros gastos recorrentes."
          >
            <Button to="/subscriptions/new">
              <Plus className="h-4 w-4" />
              Nova assinatura
            </Button>
          </EmptyState>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Mobile: dois cards compactos lado a lado | Desktop: mantém MetricCard atual */}
          <div className="grid grid-cols-2 gap-3 max-[360px]:grid-cols-1 sm:hidden">
            <Card className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ds-muted">
                Mensal (ativas)
              </p>
              <p className="mt-1 font-display text-xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-[var(--text-primary)]">
                {formatCurrency(totalMonthly)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ds-muted">
                Anual (ativas)
              </p>
              <p className="mt-1 font-display text-xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-[var(--text-primary)]">
                {formatCurrency(totalAnnual)}
              </p>
            </Card>
          </div>
          <div className="hidden gap-4 sm:grid sm:grid-cols-2">
            <MetricCard
              title="Total mensal (ativas)"
              value={formatCurrency(totalMonthly)}
            />
            <MetricCard
              title="Total anual (ativas)"
              value={formatCurrency(totalAnnual)}
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-ds-muted-strong">
                {periodTab === 'monthly'
                  ? `${monthly.length} ${monthly.length === 1 ? 'assinatura mensal' : 'assinaturas mensais'}`
                  : `${annual.length} ${annual.length === 1 ? 'assinatura anual' : 'assinaturas anuais'}`}
              </span>
            </div>
            <div
              role="tablist"
              aria-label="Periodicidade das assinaturas"
              className="grid w-full grid-cols-2 gap-1 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-100/90 to-slate-50/80 p-1 shadow-sm ring-1 ring-slate-900/[0.03] sm:w-auto sm:min-w-[12rem] sm:shrink-0 dark:border-[var(--border-default)] dark:from-zinc-900/80 dark:to-zinc-800/60 dark:ring-[var(--ring-default)]"
            >
              {SUBSCRIPTION_PERIOD_TABS.map(({ value, label, icon: Icon }) => {
                const selected = periodTab === value
                return (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    id={`sub-period-${value}`}
                    onClick={() => setPeriodTab(value)}
                    className={clsx(
                      'flex min-h-[2.75rem] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-center transition-[color,background-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 motion-reduce:transition-none sm:min-h-0 sm:flex-1 sm:flex-row sm:gap-2 sm:px-3 sm:py-2',
                      selected
                        ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200/80 dark:bg-[var(--bg-elevated)] dark:text-[var(--text-primary)] dark:shadow-none dark:ring-[var(--border-default)]'
                        : 'text-slate-500 hover:bg-white/55 hover:text-slate-800 active:scale-[0.98] motion-reduce:active:scale-100 dark:text-[var(--text-secondary)] dark:hover:bg-white/[0.06] dark:hover:text-[var(--text-primary)]'
                    )}
                  >
                    <Icon
                      className={clsx(
                        'h-4 w-4 shrink-0 transition-opacity duration-200',
                        selected ? 'text-slate-700 dark:text-[var(--text-secondary)]' : 'opacity-55'
                      )}
                      aria-hidden
                      strokeWidth={2.25}
                    />
                    <span
                      className={clsx(
                        'text-[11px] font-semibold leading-tight tracking-tight sm:text-sm',
                        selected && 'font-display sm:tracking-tight'
                      )}
                    >
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <section
            className="min-w-0"
            role="tabpanel"
            aria-labelledby={`sub-period-${periodTab}`}
          >
            <Card className="overflow-hidden">
              <div className="card-block-header">
                <h2 className="card-block-title">
                  {periodTab === 'monthly'
                    ? 'Assinaturas mensais'
                    : 'Assinaturas anuais'}
                </h2>
              </div>
              {periodTab === 'monthly' ? (
                monthly.length > 0 ? (
                  <div className="card-block-body-flush min-w-0 overflow-x-auto">
                    <table className="w-full min-w-0 table-fixed border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/90 dark:border-white/[0.08] dark:bg-zinc-900/40">
                          <th className="w-[24%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                            Serviço
                          </th>
                          <th className="w-[17%] px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                            Valor
                          </th>
                          <th className="w-[9%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                            Dia
                          </th>
                          <th className="w-[20%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                            Pagamento
                          </th>
                          <th className="w-[12%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                            Status
                          </th>
                          <th className="w-[18%] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 sm:px-6">
                            Ações
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
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="card-block-body-flush px-6 py-8">
                    <p className="card-prose m-0">Nenhuma assinatura mensal</p>
                  </div>
                )
              ) : annual.length > 0 ? (
                <div className="card-block-body-flush min-w-0 overflow-x-auto">
                  <table className="w-full min-w-0 table-fixed border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/90 dark:border-white/[0.08] dark:bg-zinc-900/40">
                        <th className="w-[24%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          Serviço
                        </th>
                        <th className="w-[17%] px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          Valor anual
                        </th>
                        <th className="w-[9%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          Dia
                        </th>
                        <th className="w-[20%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          Pagamento
                        </th>
                        <th className="w-[12%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          Status
                        </th>
                        <th className="w-[18%] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 sm:px-6">
                          Ações
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
      )}

      {isModalOpen && (
        <Modal
          fullBleedMobile
          title={modalTitle}
          onClose={() => navigate('/subscriptions')}
          className="md:max-w-lg"
        >
          {outlet}
        </Modal>
      )}
    </>
  )
}
