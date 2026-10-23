import { useMemo, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { clsx } from 'clsx'
import { SegmentedTabList, type SegmentedTabItem } from '../../components/ui/SegmentedTabList'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { EditIconButton } from '../../components/ui/EditIconButton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { MobileFab } from '../../components/ui/MobileFab'
import {
  SectionHeaderSkeleton,
  TransactionListRowSkeleton,
} from '../../components/ui/skeleton-compositions'
import { formatDate } from '../../lib'
import {
  financeExpenseAmount,
  financeExpenseIconWrap,
  financeIncomeAmount,
  financeIncomeIconWrap,
} from '../../lib/financeDisplay'
import { useValuesVisibility } from '../../contexts/ValuesVisibilityContext'
import { useTransactions } from '../../contexts/TransactionsContext'
import { useAccounts } from '../../contexts/AccountsContext'
import { useHeaderActions } from '../../contexts/HeaderActionsContext'
import { useCategories } from '../../contexts/CategoriesContext'
import {
  Plus,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
} from 'lucide-react'
import type { Transaction } from '../../types'
import {
  buildTransactionMonthOptions,
  currentYearMonthString,
  expandTransactionsForSelectedMonth,
  formatYearMonthLabel,
} from '../../lib/transactionMonthFilter'

type FilterType = 'all' | 'income' | 'expense'

const TRANSACTION_FILTER_TABS: SegmentedTabItem<FilterType>[] = [
  { value: 'all', label: 'Todas', icon: ArrowLeftRight, tone: 'default' },
  { value: 'income', label: 'Receitas', icon: ArrowDownLeft, tone: 'income' },
  { value: 'expense', label: 'Despesas', icon: ArrowUpRight, tone: 'expense' },
]

function formatGroupDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function groupByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>()
  for (const t of transactions) {
    const key = t.transaction_date
    const list = map.get(key) ?? []
    list.push(t)
    map.set(key, list)
  }
  for (const list of map.values()) {
    list.sort((a, b) => (a.id < b.id ? -1 : 1))
  }
  return map
}

export function TransactionsLayout() {
  const navigate = useNavigate()
  const outlet = useOutlet()
  const { setActions, setTitle, setMobileFab } = useHeaderActions()
  const location = useLocation()
  const pathname = location.pathname
  const isNewRoute = pathname === '/transactions/new'
  const isEditRoute = /^\/transactions\/[^/]+\/edit$/.test(pathname)
  const isModalOpen = isNewRoute || isEditRoute
  const modalTitle = isNewRoute ? 'Nova transação' : 'Editar transação'

  useEffect(() => {
    setTitle('Transações', 'Suas movimentações por data')
    return () => setTitle('', null)
  }, [setTitle])
  useEffect(() => {
    setActions(
      <Button to="/transactions/new">
        <Plus className="h-4 w-4" />
        Nova transação
      </Button>
    )
    return () => setActions(null)
  }, [setActions])
  useEffect(() => {
    setMobileFab(
      <MobileFab
        to="/transactions/new"
        ariaLabel="Nova transação"
        icon={<Plus className="h-7 w-7" strokeWidth={2.25} aria-hidden />}
      />
    )
    return () => setMobileFab(null)
  }, [setMobileFab])

  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonthString)
  const { formatCurrency } = useValuesVisibility()
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    refetchTransactions,
  } = useTransactions()
  const { getAccountById } = useAccounts()
  const { getCategoryName } = useCategories()
  const getAccountLabel = (accountId: string | null) =>
    accountId ? (getAccountById(accountId)?.name ?? '—') : 'Sem conta vinculada'

  const monthOptions = useMemo(
    () => buildTransactionMonthOptions(transactions, selectedMonth),
    [transactions, selectedMonth]
  )

  const inMonth = useMemo(
    () => expandTransactionsForSelectedMonth(transactions, selectedMonth),
    [transactions, selectedMonth]
  )

  const filtered = useMemo(() => {
    if (filterType === 'all') return [...inMonth]
    return inMonth.filter((t) => t.type === filterType)
  }, [filterType, inMonth])

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(b.transaction_date).getTime() -
          new Date(a.transaction_date).getTime()
      ),
    [filtered]
  )

  const byDate = useMemo(() => groupByDate(sorted), [sorted])
  const dateKeys = useMemo(
    () => Array.from(byDate.keys()).sort((a, b) => b.localeCompare(a)),
    [byDate]
  )

  const partialTotals = useMemo(() => {
    let income = 0
    let expense = 0
    for (const t of filtered) {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    }
    return { income, expense }
  }, [filtered])

  return (
    <>
      <div className="space-y-6">
        {transactionsError ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-900 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-100"
            role="alert"
          >
            <p className="font-medium">Erro ao carregar transações</p>
            <p className="mt-1 text-red-800/90 dark:text-red-200/90">
              {transactionsError}
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-3 text-xs"
              onClick={() => void refetchTransactions()}
            >
              Tentar novamente
            </Button>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <label
                htmlFor="tx-month-filter"
                className="shrink-0 text-sm font-medium text-ds-secondary"
              >
                Mês
              </label>
              <select
                id="tx-month-filter"
                className="ui-field min-w-0 max-w-full py-2 text-sm sm:min-w-[12.5rem]"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                aria-label="Filtrar transações por mês"
              >
                {monthOptions.map((ym) => (
                  <option key={ym} value={ym}>
                    {formatYearMonthLabel(ym)}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-sm text-ds-muted-strong">
              {transactionsLoading
                ? 'Carregando…'
                : `${sorted.length} ${sorted.length === 1 ? 'transação' : 'transações'}`}
            </span>
          </div>
          <SegmentedTabList
            items={TRANSACTION_FILTER_TABS}
            value={filterType}
            onChange={setFilterType}
            ariaLabel="Filtrar transações por tipo"
            idPrefix="tx-filter"
          />
        </div>

        {!transactionsLoading && !transactionsError && sorted.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-900/[0.03] dark:border-white/[0.10] dark:bg-zinc-900/60 dark:ring-white/[0.04] dark:shadow-none">
              <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
                Total receitas (lista atual)
              </p>
              <p className={clsx('mt-1 text-lg', financeIncomeAmount)}>
                +{formatCurrency(partialTotals.income)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-900/[0.03] dark:border-white/[0.10] dark:bg-zinc-900/60 dark:ring-white/[0.04] dark:shadow-none">
              <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
                Total despesas (lista atual)
              </p>
              <p className={clsx('mt-1 text-lg', financeExpenseAmount)}>
                −{formatCurrency(partialTotals.expense)}
              </p>
            </div>
          </div>
        ) : null}

        <div className="space-y-6">
          {transactionsLoading ? (
            <div
              className="space-y-6"
              aria-busy="true"
              aria-label="Carregando transações"
            >
              {[0, 1].map((g) => (
                <section key={g}>
                  <SectionHeaderSkeleton className="mb-2 h-4 w-40" />
                  <Card>
                    <ul className="card-list-flush">
                      {[0, 1, 2].map((i) => (
                        <li key={i}>
                          <TransactionListRowSkeleton />
                        </li>
                      ))}
                    </ul>
                  </Card>
                </section>
              ))}
            </div>
          ) : dateKeys.length === 0 ? (
            <Card>
              <EmptyState
                  icon={ArrowLeftRight}
                  title="Nenhuma transação encontrada"
                  description={
                    filterType === 'all'
                      ? `Não há lançamentos em ${formatYearMonthLabel(selectedMonth)}. Escolha outro mês ou registre movimentações.`
                      : filterType === 'income'
                        ? `Sem receitas em ${formatYearMonthLabel(selectedMonth)}. Experimente “Todas”, outro mês ou crie uma nova receita.`
                        : `Sem despesas em ${formatYearMonthLabel(selectedMonth)}. Experimente “Todas”, outro mês ou crie uma nova despesa.`
                  }
                >
                  <Button to="/transactions/new">
                    <Plus className="h-4 w-4" />
                    Nova transação
                  </Button>
                </EmptyState>
            </Card>
          ) : (
            dateKeys.map((dateKey) => (
              <section key={dateKey}>
                <h2 className="mb-2 card-section-label">
                  {formatGroupDate(dateKey)}
                </h2>
                <Card>
                  <ul className="card-list-flush">
                    {byDate.get(dateKey)!.map((t) => (
                      <li key={`${t.id}-${t.transaction_date}`}>
                        <div className="card-list-actions-row">
                          <Link
                            to={`/transactions/${t.id}`}
                            className="flex min-w-0 items-center gap-3 py-0.5 rounded-lg transition-opacity duration-150 ease-out hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:ring-offset-2"
                          >
                            <span
                              className={
                                t.type === 'income'
                                  ? financeIncomeIconWrap
                                  : financeExpenseIconWrap
                              }
                            >
                              {t.type === 'income' ? (
                                <ArrowDownLeft className="h-4 w-4" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4" />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {t.description || getCategoryName(t.category_id)}
                              </p>
                              <p className="mt-0.5 text-xs text-ds-muted">
                                {t.description
                                  ? `${getCategoryName(t.category_id)} · `
                                  : ''}
                                {getAccountLabel(t.account_id)}
                                {' · '}
                                {formatDate(t.transaction_date)}
                              </p>
                            </div>
                            <p
                              className={
                                t.type === 'income'
                                  ? financeIncomeAmount
                                  : financeExpenseAmount
                              }
                            >
                              {t.type === 'income' ? '+' : '−'}
                              {formatCurrency(t.amount)}
                            </p>
                          </Link>
                          <EditIconButton
                            to={`/transactions/${t.id}/edit`}
                            aria-label={`Editar transação: ${t.description || getCategoryName(t.category_id)}`}
                            title="Editar transação"
                            className="self-center"
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              </section>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <Modal
          fullBleedMobile
          title={modalTitle}
          onClose={() => navigate('/transactions', { replace: true })}
          className="md:max-w-xl"
        >
          {outlet}
        </Modal>
      )}
    </>
  )
}
