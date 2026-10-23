import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { clsx } from 'clsx'
import {
  buildTodaysReminders,
  type TodayReminderItem,
  type TodayReminderKind,
} from '../lib/todaysReminders'
import { useSubscriptions } from '../contexts/SubscriptionsContext'
import { useCreditCards } from '../contexts/CreditCardsContext'
import { useTransactions } from '../contexts/TransactionsContext'
import { useValuesVisibility } from '../contexts/ValuesVisibilityContext'

const triggerBtnClass =
  'relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm ring-1 ring-gray-200/70 transition hover:bg-white hover:text-gray-900 hover:ring-gray-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 dark:bg-zinc-800/90 dark:text-slate-300 dark:ring-white/10 dark:hover:bg-zinc-700 dark:hover:text-slate-100 dark:focus-visible:ring-white/25'

const kindLabel: Record<TodayReminderKind, string> = {
  subscription: 'Assinatura',
  credit_card_bill: 'Fatura',
  recurring_transaction: 'Transação recorrente',
}

export function HeaderNotificationsPopover() {
  const { subscriptions } = useSubscriptions()
  const { creditCards, getBillsByCardId } = useCreditCards()
  const { transactions } = useTransactions()
  const { formatCurrency } = useValuesVisibility()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const allBills = useMemo(
    () => creditCards.flatMap((c) => getBillsByCardId(c.id)),
    [creditCards, getBillsByCardId]
  )

  const reminders = useMemo(() => {
    return buildTodaysReminders({
      today: new Date(),
      subscriptions,
      bills: allBills,
      creditCards,
      transactions,
    })
  }, [subscriptions, allBills, creditCards, transactions])

  const count = reminders.length

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          count > 0
            ? `Lembretes de hoje: ${count} item${count === 1 ? '' : 's'}`
            : 'Lembretes de hoje'
        }
        className={triggerBtnClass}
      >
        <Bell className="h-5 w-5" strokeWidth={2} aria-hidden />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-zinc-900">
            {count > 9 ? '9+' : count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Lembretes do dia"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-gray-900/[0.04] dark:border-white/[0.1] dark:bg-zinc-900 dark:ring-white/[0.06] dark:shadow-2xl dark:shadow-black/40"
        >
          <div className="border-b border-gray-100 px-4 py-3 dark:border-white/[0.08]">
            <p className="font-display text-sm font-semibold text-gray-900 dark:text-slate-100">
              Lembretes de hoje
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
              Vencimentos e cobranças previstas para hoje
            </p>
          </div>
          <div className="max-h-[min(24rem,70dvh)] overflow-y-auto overscroll-contain p-2">
            {reminders.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-gray-500 dark:text-slate-400">
                Nenhum vencimento para hoje
              </p>
            ) : (
              <ul className="space-y-1">
                {reminders.map((item) => (
                  <ReminderRow
                    key={item.id}
                    item={item}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ReminderRow({
  item,
  formatCurrency,
}: {
  item: TodayReminderItem
  formatCurrency: (n: number) => string
}) {
  return (
    <li
      className={clsx(
        'rounded-lg px-3 py-2.5 transition-colors',
        'hover:bg-gray-50 dark:hover:bg-white/[0.05]'
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-ds-faint">
        {kindLabel[item.kind]}
      </p>
      <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-slate-100">
        {item.title}
      </p>
      <p className="mt-1 font-display text-sm font-bold tabular-nums text-gray-900 dark:text-slate-100">
        {formatCurrency(item.amount)}
      </p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
        {item.supportText}
      </p>
    </li>
  )
}
