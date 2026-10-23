import { clsx } from 'clsx'
import { Card } from '../../../components/ui/Card'
import type { TransactionDraft } from '../types'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface ConfirmedTransactionsListProps {
  items: TransactionDraft[]
  /** Lista compacta para bottom sheet / espaços estreitos. */
  compact?: boolean
}

export function ConfirmedTransactionsList({
  items,
  compact = false,
}: ConfirmedTransactionsListProps) {
  const confirmed = items.filter((i) => i.status === 'confirmed')

  if (confirmed.length === 0) {
    return (
      <Card className={compact ? 'py-3' : undefined}>
        <h3
          className={
            compact
              ? 'text-xs font-semibold text-slate-900 dark:text-slate-100'
              : 'text-sm font-semibold text-slate-900 dark:text-slate-100'
          }
        >
          Salvos localmente
        </h3>
        <p className="mt-1 text-xs text-ds-muted">
          {compact
            ? 'Nenhum ainda.'
            : 'Nenhum lançamento confirmado ainda. Eles aparecem aqui após você confirmar a prévia — só neste navegador.'}
        </p>
      </Card>
    )
  }

  return (
    <Card className={compact ? 'py-3' : undefined}>
      <h3
        className={
          compact
            ? 'text-xs font-semibold text-slate-900 dark:text-slate-100'
            : 'text-sm font-semibold text-slate-900 dark:text-slate-100'
        }
      >
        {compact ? 'Últimos (local)' : 'Lançamentos confirmados (local)'}
      </h3>
      <p className="mt-1 text-xs text-ds-muted">
        {confirmed.length} item(ns) — não integrados ao banco nem ao restante do app.
      </p>
      <ul
        className={clsx(
          'mt-2 divide-y divide-slate-100 dark:divide-white/[0.08]',
          compact && 'max-h-28 overflow-y-auto'
        )}
      >
        {confirmed.map((t) => (
          <li
            key={t.id}
            className={clsx(
              'flex flex-wrap items-baseline justify-between gap-2 py-2',
              compact ? 'text-xs' : 'text-sm'
            )}
          >
            <div>
              <span
                className={
                  t.type === 'income'
                    ? 'font-medium text-emerald-700 dark:text-emerald-300'
                    : 'font-medium text-rose-700 dark:text-rose-300'
                }
              >
                {t.type === 'income' ? 'Receita' : 'Despesa'}
              </span>
              <span className="text-slate-600 dark:text-slate-400"> · {t.description}</span>
              {t.category ? (
                <span className="ml-1 text-xs text-ds-muted">({t.category})</span>
              ) : null}
            </div>
            <div className="text-right">
              <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {BRL.format(t.amount)}
              </span>
              <span className="ml-2 text-xs text-ds-muted">{t.date}</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
