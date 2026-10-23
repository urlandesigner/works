import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { SegmentedTabList, type SegmentedTabItem } from '../components/ui/SegmentedTabList'
import { EditIconButton } from '../components/ui/EditIconButton'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate } from '../lib'
import {
  financeExpenseAmount,
  financeExpenseIconWrap,
  financeIncomeAmount,
  financeIncomeIconWrap,
} from '../lib/financeDisplay'
import { useValuesVisibility } from '../contexts/ValuesVisibilityContext'
import { useTransactions } from '../contexts/TransactionsContext'
import { useAccounts } from '../contexts/AccountsContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { mockCategories } from '../data'
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Plus } from 'lucide-react'
import type { Transaction } from '../types'

function getCategoryName(id: string) {
  return mockCategories.find((c) => c.id === id)?.name ?? '—'
}

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

export function TransactionsPage() {
  const [filterType, setFilterType] = useState<FilterType>('all')
  const { formatCurrency } = useValuesVisibility()
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    refetchTransactions,
  } = useTransactions()
  const { getAccountById } = useAccounts()
  const { setTitle } = useHeaderActions()
  const getAccountLabel = (accountId: string | null) =>
    accountId ? (getAccountById(accountId)?.name ?? '—') : 'Sem conta vinculada'

  useEffect(() => {
    setTitle('Transações', 'Suas movimentações por data')
    return () => setTitle('', null)
  }, [setTitle])

  const filtered = useMemo(() => {
    if (filterType === 'all') return [...transactions]
    return transactions.filter((t) => t.type === filterType)
  }, [filterType, transactions])

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

  return (
    <div className="space-y-6">
      {transactionsError ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          <p className="font-medium">Erro ao carregar transações</p>
          <p className="mt-1 text-red-800/90">{transactionsError}</p>
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-ds-muted">
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
          idPrefix="tx-page-filter"
        />
      </div>

      <div className="space-y-6">
        {dateKeys.length === 0 ? (
          <Card>
            {transactionsLoading ? (
              <p className="py-10 text-center text-sm text-ds-muted">
                Carregando transações…
              </p>
            ) : (
              <EmptyState
                icon={ArrowLeftRight}
                title="Nenhuma transação encontrada"
                description={
                  filterType === 'all'
                    ? 'Comece registrando receitas e despesas para ver o histórico por dia.'
                    : filterType === 'income'
                      ? 'Não há receitas com os filtros atuais. Tente “Todas” ou cadastre uma receita.'
                      : 'Não há despesas com os filtros atuais. Tente “Todas” ou cadastre uma despesa.'
                }
              >
                <Button to="/transactions/new">
                  <Plus className="h-4 w-4" />
                  Nova transação
                </Button>
              </EmptyState>
            )}
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
                    <li key={t.id}>
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
                                ? `shrink-0 ${financeIncomeAmount}`
                                : `shrink-0 ${financeExpenseAmount}`
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
  )
}
