import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { Card } from './ui/Card'
import {
  getTransactionDaysInMonth,
  getFirstWeekdayOfMonth,
  getDaysInMonth,
  WEEKDAY_LABELS,
  WEEKDAY_NAMES_LONG,
  MONTH_LABELS,
} from '../lib/calendar'
import { useTransactions } from '../contexts/TransactionsContext'
import { useValuesVisibility } from '../contexts/ValuesVisibilityContext'
import { useCategories } from '../contexts/CategoriesContext'
import {
  financeExpenseAmountDisplay,
  financeIncomeAmountDisplay,
} from '../lib/financeDisplay'
import { CalendarOff, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { EmptyState } from './ui/EmptyState'

export type TransactionCalendarProps = {
  /** Grade e tipografia mais compactas (ex.: home mobile). */
  compact?: boolean
  /** Em telas &lt; lg, inicia recolhido com opção de expandir. */
  collapsibleOnNarrow?: boolean
}

export function TransactionCalendar({
  compact = false,
  collapsibleOnNarrow = false,
}: TransactionCalendarProps) {
  const { transactions } = useTransactions()
  const isLg = useMediaQuery('(min-width: 1024px)')
  const [narrowExpanded, setNarrowExpanded] = useState(false)

  useEffect(() => {
    if (isLg) setNarrowExpanded(true)
  }, [isLg])

  const showCalendarBody =
    !collapsibleOnNarrow || isLg || narrowExpanded
  const { getCategoryName } = useCategories()
  const { formatCurrency } = useValuesVisibility()
  const now = new Date()
  const [viewedYear, setViewedYear] = useState(now.getFullYear())
  const [viewedMonth, setViewedMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { daysWithTransactions, transactionsByDate } = useMemo(
    () => getTransactionDaysInMonth(viewedYear, viewedMonth, transactions),
    [viewedYear, viewedMonth, transactions]
  )

  const firstWeekday = getFirstWeekdayOfMonth(viewedYear, viewedMonth)
  const daysInMonth = getDaysInMonth(viewedYear, viewedMonth)
  const leadingBlanks = firstWeekday
  const totalCells = leadingBlanks + daysInMonth
  const paddedLength = Math.ceil(totalCells / 7) * 7

  const goPrev = () => {
    if (viewedMonth === 1) {
      setViewedMonth(12)
      setViewedYear((y) => y - 1)
    } else {
      setViewedMonth((m) => m - 1)
    }
    setSelectedDate(null)
  }

  const goNext = () => {
    if (viewedMonth === 12) {
      setViewedMonth(1)
      setViewedYear((y) => y + 1)
    } else {
      setViewedMonth((m) => m + 1)
    }
    setSelectedDate(null)
  }

  const selectedTransactions = selectedDate
    ? (transactionsByDate.get(selectedDate) ?? [])
    : []

  const monthLabel = `${MONTH_LABELS[viewedMonth - 1]} ${viewedYear}`

  const dayCells: (number | null)[] = []
  for (let i = 0; i < leadingBlanks; i++) dayCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) dayCells.push(d)
  while (dayCells.length < paddedLength) dayCells.push(null)

  const gridGap = compact ? 'gap-0.5' : 'gap-1 sm:gap-1.5'
  const dayText = compact ? 'text-[10px]' : 'text-xs font-medium'
  const weekdayText = compact
    ? 'py-0.5 text-[9px] font-medium uppercase leading-tight tracking-wide text-ds-faint'
    : 'py-1 text-[11px] font-medium uppercase leading-tight tracking-wide text-ds-faint sm:text-xs'

  const canCollapse = collapsibleOnNarrow && !isLg

  return (
    <Card>
      <div className="card-block-header items-start">
        <h2 className="card-block-title">Calendário</h2>
        <div className="flex shrink-0 items-center gap-0.5">
          {showCalendarBody ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="card-icon-button"
                aria-label="Mês anterior"
              >
                <ChevronLeft className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="card-icon-button"
                aria-label="Próximo mês"
              >
                <ChevronRight className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />
              </button>
            </>
          ) : null}
        </div>
      </div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
        <p className="card-section-label !mb-0">{monthLabel}</p>
        {canCollapse ? (
          <button
            type="button"
            onClick={() => setNarrowExpanded((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-100 dark:focus-visible:ring-white/15"
            aria-expanded={narrowExpanded}
          >
            {narrowExpanded ? 'Ocultar' : 'Mostrar calendário'}
            <ChevronDown
              className={clsx(
                'h-4 w-4 shrink-0 transition-transform duration-200 ease-out',
                narrowExpanded && 'rotate-180'
              )}
              aria-hidden
            />
          </button>
        ) : null}
      </div>

      {showCalendarBody ? (
        <>
      <div
        className={clsx('grid grid-cols-7 text-center', gridGap)}
        aria-label={`Calendário de ${monthLabel}`}
      >
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            aria-label={WEEKDAY_NAMES_LONG[i]}
            className={weekdayText}
          >
            <span aria-hidden>{label}</span>
          </div>
        ))}
        {dayCells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="aspect-square w-full min-w-0"
                aria-hidden
              />
            )
          }
          const hasTransaction = daysWithTransactions.has(day)
          const dateKey = `${viewedYear}-${String(viewedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isSelected = selectedDate === dateKey
          const dayTransactions = transactionsByDate.get(dateKey) ?? []
          const hasIncome = dayTransactions.some((t) => t.type === 'income')
          const hasExpense = dayTransactions.some((t) => t.type === 'expense')
          const txCount = dayTransactions.length
          const ariaDay = new Date(
            `${viewedYear}-${String(viewedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00`
          ).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
          const ariaTx =
            txCount === 0
              ? 'Sem lançamentos'
              : txCount === 1
                ? '1 transação'
                : `${txCount} transações`
          return (
            <div key={dateKey} className="aspect-square w-full min-w-0">
              <button
                type="button"
                aria-label={`${ariaDay}. ${ariaTx}.`}
                aria-pressed={isSelected}
                onClick={() => setSelectedDate((prev) => (prev === dateKey ? null : dateKey))}
                className={clsx(
                  'relative flex h-full w-full items-center justify-center rounded-lg transition-[transform,background-color,color,box-shadow] duration-150 ease-out motion-safe:active:scale-[0.97]',
                  dayText,
                  !compact && 'font-medium',
                  isSelected
                    ? 'z-10 bg-slate-900 text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:shadow-md dark:hover:bg-zinc-100'
                    : hasTransaction
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-200 dark:hover:bg-zinc-700'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.05]'
                )}
              >
                <span aria-hidden>{day}</span>
                {hasTransaction && (
                  <span
                    className="pointer-events-none absolute bottom-0.5 left-1/2 flex -translate-x-1/2 items-center justify-center gap-0.5"
                    aria-hidden
                  >
                    {hasIncome && (
                      <span className="h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                    )}
                    {hasExpense && (
                      <span className="h-1 w-1 shrink-0 rounded-full bg-danger-500" />
                    )}
                  </span>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {selectedDate ? (
        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-4 sm:px-5 dark:border-white/[0.08] dark:bg-zinc-800/50">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
            })}
          </p>
          {selectedTransactions.length > 0 ? (
            <ul className="mt-3 divide-y divide-gray-200/80 dark:divide-white/[0.08]">
              {selectedTransactions.map((t) => (
                <li key={t.id}>
                  <Link
                    to={`/transactions/${t.id}`}
                    className="flex min-h-11 items-center justify-between gap-3 py-2.5 text-left transition-colors hover:opacity-90 focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-gray-900/10 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50/80 dark:focus-visible:ring-white/15 dark:focus-visible:ring-offset-zinc-800/80"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
                        {t.description || getCategoryName(t.category_id)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                        {t.description ? (
                          <>
                            {getCategoryName(t.category_id)}
                            {' · '}
                            {t.type === 'income' ? 'Receita' : 'Despesa'}
                          </>
                        ) : (
                          <>{t.type === 'income' ? 'Receita' : 'Despesa'}</>
                        )}
                      </p>
                    </div>
                    <span
                      className={clsx(
                        'shrink-0',
                        t.type === 'income'
                          ? financeIncomeAmountDisplay
                          : financeExpenseAmountDisplay
                      )}
                    >
                      {t.type === 'income' ? '+' : '−'}
                      {formatCurrency(t.amount)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3">
              <EmptyState
                variant="compact"
                icon={CalendarOff}
                title="Sem movimentações"
                description="Não há lançamentos nesta data. Toque em outro dia ou registre uma transação."
              />
            </div>
          )}
        </div>
      ) : null}
        </>
      ) : null}
    </Card>
  )
}
