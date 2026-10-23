import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { clsx } from 'clsx'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  CardChevronLink,
  cardHeaderActionsClass,
} from '../../components/ui/CardChevronLink'
import { EditIconButton } from '../../components/ui/EditIconButton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { MobileFab } from '../../components/ui/MobileFab'
import { useValuesVisibility } from '../../contexts/ValuesVisibilityContext'
import { useInvestments } from '../../contexts/InvestmentsContext'
import { useAccounts } from '../../contexts/AccountsContext'
import { useLatestClosingInvestmentCurrentMap } from '../../hooks/useLatestClosingInvestmentCurrentMap'
import { mergeInvestmentsWithClosingCurrentById } from '../../lib/investmentClosingOverlay'
import { useHeaderActions } from '../../contexts/HeaderActionsContext'
import type { Investment } from '../../types/investment'
import { LayoutGrid, Plus, Table2, TrendingUp } from 'lucide-react'
import { financeGainText, financeLossText } from '../../lib/financeDisplay'
import {
  InvestmentsPortfolioSkeleton,
  InvestmentsSummarySkeleton,
} from '../../components/ui/skeleton-compositions'

const investmentTypeLabels: Record<string, string> = {
  fixed_income: 'Renda fixa',
  variable_income: 'Renda variável',
  crypto: 'Cripto',
}

function getReturnPercent(invested: number, current: number): number | null {
  if (invested === 0) return null
  return ((current - invested) / invested) * 100
}

function InvestmentCard({
  inv,
  formatCurrency,
  getAccountName,
}: {
  inv: Investment
  formatCurrency: (value: number) => string
  getAccountName: (accountId: string | null) => string
}) {
  const returnAmount = inv.current_amount - inv.invested_amount
  const returnPercent = getReturnPercent(inv.invested_amount, inv.current_amount)
  return (
    <Card className="overflow-hidden transition hover:border-slate-300">
      <div className="card-block-header items-start gap-3">
        <Link
          to={`/investments/${inv.id}`}
          className="min-w-0 flex-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:ring-offset-2 dark:focus-visible:ring-white/20 dark:focus-visible:ring-offset-transparent"
        >
          <h2 className="card-block-title">{inv.name}</h2>
          <p className="mt-2 text-sm text-ds-muted">
            {getAccountName(inv.account_id)}
          </p>
          <p className="mt-1 text-xs text-ds-muted">
            {investmentTypeLabels[inv.type] ?? inv.type}
          </p>
        </Link>
        <div className={cardHeaderActionsClass}>
          <EditIconButton
            size="compact"
            to={`/investments/${inv.id}/edit`}
            aria-label={`Editar investimento ${inv.name}`}
            title="Editar investimento"
            className="self-start"
          />
          <CardChevronLink
            to={`/investments/${inv.id}`}
            aria-label={`Abrir investimento ${inv.name}`}
            title="Ver detalhes"
          />
        </div>
      </div>
      <Link
        to={`/investments/${inv.id}`}
        className="card-block-body-flush block px-6 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:ring-offset-2 dark:focus-visible:ring-white/20 dark:focus-visible:ring-offset-transparent"
      >
        <dl className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <dt className="text-ds-muted">
              Valor investido
            </dt>
            <dd className="font-medium tabular-nums text-ds-secondary">
              {formatCurrency(inv.invested_amount)}
            </dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-ds-muted">
              Valor atual
            </dt>
            <dd className="font-bold tabular-nums text-slate-900 dark:text-[var(--text-primary)]">
              {formatCurrency(inv.current_amount)}
            </dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-ds-muted">
              Rentabilidade
            </dt>
            <dd className="text-right font-medium tabular-nums">
              <span
                className={returnAmount >= 0 ? financeGainText : financeLossText}
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
      </Link>
    </Card>
  )
}

const thClass =
  'whitespace-nowrap px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-ds-muted-strong sm:px-4 sm:py-3 sm:text-xs'
const tdClass = 'px-2 py-2 align-middle sm:px-4 sm:py-2.5'

function InvestmentsTable({
  investments,
  formatCurrency,
  getAccountName,
}: {
  investments: Investment[]
  formatCurrency: (value: number) => string
  getAccountName: (accountId: string | null) => string
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left text-xs tabular-nums sm:min-w-0 sm:text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-slate-50/90 dark:border-[var(--border-default)] dark:bg-zinc-900/40">
              <th scope="col" className={thClass}>
                Nome
              </th>
              <th scope="col" className={clsx(thClass, 'hidden sm:table-cell')}>
                Conta
              </th>
              <th scope="col" className={clsx(thClass, 'hidden md:table-cell')}>
                Tipo
              </th>
              <th scope="col" className={clsx(thClass, 'text-right')}>
                Investido
              </th>
              <th scope="col" className={clsx(thClass, 'text-right')}>
                Atual
              </th>
              <th scope="col" className={clsx(thClass, 'text-right')}>
                Rent.
              </th>
              <th scope="col" className={clsx(thClass, 'w-1 pr-2 text-right sm:pr-4')}>
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {investments.map((inv) => {
              const returnAmount = inv.current_amount - inv.invested_amount
              const returnPercent = getReturnPercent(
                inv.invested_amount,
                inv.current_amount
              )
              return (
                <tr
                  key={inv.id}
                  className="border-t border-gray-100 transition hover:bg-slate-50/80 dark:border-[var(--border-default)] dark:hover:bg-white/[0.04]"
                >
                  <td className={tdClass}>
                    <Link
                      to={`/investments/${inv.id}`}
                      className="block max-w-[9rem] truncate font-semibold text-slate-900 underline-offset-2 hover:underline sm:max-w-[14rem] md:max-w-xs dark:text-[var(--text-primary)]"
                    >
                      {inv.name}
                    </Link>
                    <p className="mt-0.5 truncate text-[11px] text-ds-muted sm:hidden">
                      {getAccountName(inv.account_id)}
                    </p>
                  </td>
                  <td
                    className={clsx(
                      tdClass,
                      'hidden max-w-[10rem] text-ds-secondary sm:table-cell'
                    )}
                  >
                    <span className="block truncate">
                      {getAccountName(inv.account_id)}
                    </span>
                  </td>
                  <td
                    className={clsx(
                      tdClass,
                      'hidden text-ds-secondary md:table-cell'
                    )}
                  >
                    {investmentTypeLabels[inv.type] ?? inv.type}
                  </td>
                  <td
                    className={clsx(
                      tdClass,
                      'text-right font-medium text-ds-secondary'
                    )}
                  >
                    {formatCurrency(inv.invested_amount)}
                  </td>
                  <td
                    className={clsx(
                      tdClass,
                      'text-right font-bold text-slate-900 dark:text-[var(--text-primary)]'
                    )}
                  >
                    {formatCurrency(inv.current_amount)}
                  </td>
                  <td className={clsx(tdClass, 'text-right font-medium')}>
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
                        className={clsx(
                          'ml-1 text-[10px] sm:text-xs',
                          returnPercent >= 0 ? financeGainText : financeLossText
                        )}
                      >
                        ({returnPercent >= 0 ? '+' : ''}
                        {returnPercent.toFixed(1)}%)
                      </span>
                    )}
                  </td>
                  <td className={clsx(tdClass, 'whitespace-nowrap text-right')}>
                    <div className={cardHeaderActionsClass}>
                      <EditIconButton
                        size="compact"
                        to={`/investments/${inv.id}/edit`}
                        aria-label={`Editar investimento ${inv.name}`}
                        title="Editar investimento"
                      />
                      <CardChevronLink
                        to={`/investments/${inv.id}`}
                        aria-label={`Abrir investimento ${inv.name}`}
                        title="Ver detalhes"
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

type ListViewMode = 'cards' | 'table'

export function InvestmentsLayout() {
  const navigate = useNavigate()
  const outlet = useOutlet()
  const location = useLocation()
  const pathname = location.pathname
  const isNewRoute = pathname === '/investments/new'
  const isEditRoute = /^\/investments\/[^/]+\/edit$/.test(pathname)
  const isModalOpen = isNewRoute || isEditRoute
  const modalTitle = isNewRoute ? 'Novo investimento' : 'Editar investimento'
  const [listView, setListView] = useState<ListViewMode>('cards')

  const { formatCurrency } = useValuesVisibility()
  const { investments, loading: investmentsLoading } = useInvestments()
  const { getAccountById, loading: accountsLoading } = useAccounts()
  const { map: latestClosingCurrentByInvId, loading: snapshotLoading } =
    useLatestClosingInvestmentCurrentMap({
      investmentCount: investments.length,
      pathKey: pathname,
    })

  const portfolioInvestments = useMemo(
    () =>
      mergeInvestmentsWithClosingCurrentById(
        investments,
        latestClosingCurrentByInvId
      ),
    [investments, latestClosingCurrentByInvId]
  )

  const investmentsPageLoading =
    investmentsLoading || accountsLoading || snapshotLoading
  const getAccountName = (accountId: string | null) =>
    accountId ? getAccountById(accountId)?.name ?? '—' : 'Sem conta vinculada'
  const totalInvested = portfolioInvestments.reduce(
    (s, i) => s + i.invested_amount,
    0
  )
  const totalCurrent = portfolioInvestments.reduce(
    (s, i) => s + i.current_amount,
    0
  )
  const totalReturn = totalCurrent - totalInvested
  const { setActions, setTitle, setMobileFab } = useHeaderActions()

  useEffect(() => {
    setTitle('Investimentos')
    return () => setTitle('', null)
  }, [setTitle])
  useEffect(() => {
    setActions(
      <Button to="/investments/new">
        <Plus className="h-4 w-4" />
        Novo investimento
      </Button>
    )
    return () => setActions(null)
  }, [setActions])
  useEffect(() => {
    setMobileFab(
      <MobileFab
        to="/investments/new"
        ariaLabel="Novo investimento"
        icon={<Plus className="h-7 w-7" strokeWidth={2.25} aria-hidden />}
      />
    )
    return () => setMobileFab(null)
  }, [setMobileFab])

  return (
    <>
      <div className="space-y-6" aria-busy={investmentsPageLoading}>
        {investmentsPageLoading ? (
          <>
            <InvestmentsSummarySkeleton />
            <InvestmentsPortfolioSkeleton view={listView} />
          </>
        ) : (
          <>
        {/* Mobile: valor atual em destaque + dois cards compactos lado a lado */}
        <div className="space-y-3 sm:hidden">
          <Card className="p-4">
            <p className="text-sm font-medium text-ds-muted">
              Valor atual
            </p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-[var(--text-primary)]">
              {formatCurrency(totalCurrent)}
            </p>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <p className="text-xs font-medium text-ds-muted">
                Total investido
              </p>
              <p className="mt-1 text-lg font-medium tabular-nums leading-snug text-ds-secondary">
                {formatCurrency(totalInvested)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium text-ds-muted">
                Rentabilidade
              </p>
              <p
                className={`mt-1 text-lg font-medium tabular-nums leading-snug ${
                  totalReturn >= 0 ? financeGainText : financeLossText
                }`}
              >
                {totalReturn >= 0 ? '+' : ''}
                {formatCurrency(totalReturn)}
              </p>
            </Card>
          </div>
        </div>

        {/* Desktop: três cards em linha (visual atual) */}
        <div className="hidden gap-4 sm:grid sm:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-ds-muted">
              Total investido
            </p>
            <p className="mt-1 text-2xl font-medium tabular-nums text-ds-secondary">
              {formatCurrency(totalInvested)}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-ds-muted">
              Valor atual
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-[var(--text-primary)]">
              {formatCurrency(totalCurrent)}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-ds-muted">
              Rentabilidade
            </p>
            <p
              className={`mt-1 text-2xl font-medium tabular-nums ${
                totalReturn >= 0 ? financeGainText : financeLossText
              }`}
            >
              {totalReturn >= 0 ? '+' : ''}
              {formatCurrency(totalReturn)}
            </p>
          </Card>
        </div>

        {portfolioInvestments.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <EmptyState
                icon={TrendingUp}
                title="Nenhum investimento ainda"
                description="Cadastre ativos vinculados às contas que permitem investimentos."
              >
                <Button to="/investments/new">
                  <Plus className="h-4 w-4" />
                  Novo investimento
                </Button>
              </EmptyState>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-wide text-ds-muted">
                Sua carteira
              </p>
              <div
                className="ui-segmented shrink-0"
                role="group"
                aria-label="Modo de visualização da lista"
              >
                <button
                  type="button"
                  onClick={() => setListView('cards')}
                  aria-pressed={listView === 'cards'}
                  className={clsx(
                    listView === 'cards'
                      ? 'ui-segmented-item-active'
                      : 'ui-segmented-item',
                    'inline-flex items-center justify-center gap-1.5'
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setListView('table')}
                  aria-pressed={listView === 'table'}
                  className={clsx(
                    listView === 'table'
                      ? 'ui-segmented-item-active'
                      : 'ui-segmented-item',
                    'inline-flex items-center justify-center gap-1.5'
                  )}
                >
                  <Table2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
                  Tabela
                </button>
              </div>
            </div>

            {listView === 'cards' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {portfolioInvestments.map((inv) => (
                  <InvestmentCard
                    key={inv.id}
                    inv={inv}
                    formatCurrency={formatCurrency}
                    getAccountName={getAccountName}
                  />
                ))}
              </div>
            ) : (
              <InvestmentsTable
                investments={portfolioInvestments}
                formatCurrency={formatCurrency}
                getAccountName={getAccountName}
              />
            )}
          </div>
        )}
          </>
        )}
      </div>

      {isModalOpen && (
        <Modal
          fullBleedMobile
          title={modalTitle}
          onClose={() => navigate('/investments')}
          className="md:max-w-lg"
        >
          {outlet}
        </Modal>
      )}
    </>
  )
}
