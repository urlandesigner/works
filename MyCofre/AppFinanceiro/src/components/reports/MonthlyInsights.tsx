import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { clsx } from 'clsx'
import type { MonthlyInsightRow } from '../../lib/reports/monthlyInsights'

type MonthlyInsightsProps = {
  insights: MonthlyInsightRow[] | null
  loading?: boolean
}

function toneClass(tone: MonthlyInsightRow['tone']): string {
  if (tone === 'positive') {
    return 'border-emerald-200/80 bg-emerald-50/60 text-emerald-950 dark:border-emerald-800/40 dark:bg-emerald-950/25 dark:text-emerald-100'
  }
  if (tone === 'negative') {
    return 'border-red-200/80 bg-red-50/60 text-red-950 dark:border-red-900/40 dark:bg-red-950/25 dark:text-red-100'
  }
  return 'border-slate-200/80 bg-slate-50/70 text-slate-800 dark:border-white/[0.08] dark:bg-zinc-800/40 dark:text-slate-100'
}

export function MonthlyInsights({ insights, loading = false }: MonthlyInsightsProps) {
  if (loading) {
    return (
      <Card className="p-4 sm:p-5">
        <div className="mb-3">
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </Card>
    )
  }

  if (!insights || insights.length === 0) return null

  return (
    <Card className="p-4 sm:p-5">
      <h2 className="card-block-heading mb-4">Insights do mês</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {insights.map((item) => (
          <li
            key={item.id}
            className={clsx(
              'rounded-xl border px-3 py-3 text-sm leading-relaxed',
              toneClass(item.tone)
            )}
          >
            {item.text}
          </li>
        ))}
      </ul>
    </Card>
  )
}
