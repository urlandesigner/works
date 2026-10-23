import { Card } from '../ui/Card'
import {
  CalendarSkeleton,
  DashboardMonthFlowSkeleton,
  GoalProjectionCardSkeleton,
  ListItemSkeleton,
  MetricCardSkeleton,
  TransactionListRowSkeleton,
} from '../ui/skeleton-compositions'
import { Skeleton } from '../ui/Skeleton'

type DashboardSkeletonProps = {
  isLg: boolean
}

/**
 * Espelha a grade da Home (mobile + desktop) para evitar layout shift durante o carregamento.
 */
export function DashboardSkeleton({ isLg }: DashboardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr),320px] lg:items-stretch lg:gap-x-8 lg:gap-y-0">
      {!isLg && (
        <section className="col-span-1 order-1 lg:hidden">
          <Card className="border-emerald-100/90 bg-gradient-to-br from-emerald-50/50 via-white to-white ring-1 ring-emerald-900/[0.05] dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-zinc-900/90 dark:to-zinc-900/90 dark:ring-emerald-900/20">
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-9 w-[85%] max-w-[12rem]" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 dark:border-white/[0.08]">
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-full" />
              </div>
            </div>
          </Card>
        </section>
      )}

      <div className="contents lg:col-start-1 lg:row-span-full lg:flex lg:min-w-0 lg:max-w-full lg:flex-col lg:gap-6">
        {isLg && (
          <section className="col-span-1 hidden lg:block">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </div>
          </section>
        )}

        <section className="col-span-1 order-2 lg:order-none">
          <Card>
            <h2 className="card-block-heading">Receitas e despesas do mês</h2>
            <p className="mb-3 hidden text-xs font-normal leading-relaxed text-gray-500 dark:text-slate-400 lg:mb-6 lg:block">
              Carregando totais do mês…
            </p>
            <p className="mb-4 text-xs leading-snug text-gray-500 dark:text-slate-400 lg:hidden">
              Carregando…
            </p>
            <DashboardMonthFlowSkeleton />
          </Card>
        </section>

        <section className="col-span-1 order-4 lg:order-none">
          <GoalProjectionCardSkeleton compact={!isLg} />
        </section>

        <section className="col-span-1 order-5 lg:order-none">
          <Card>
            <div className="card-block-header">
              <h2 className="card-block-title">Contas</h2>
            </div>
            <ul className="card-list">
              {[0, 1, 2].map((i) => (
                <ListItemSkeleton key={i} iconShape="square" />
              ))}
            </ul>
          </Card>
        </section>

        <section className="col-span-1 order-6 lg:order-none">
          <Card>
            <div className="card-block-header">
              <h2 className="card-block-title">Investimentos</h2>
            </div>
            <ul className="card-list">
              {[0, 1, 2].map((i) => (
                <ListItemSkeleton key={i} iconShape="square" />
              ))}
            </ul>
          </Card>
        </section>
      </div>

      <div className="contents lg:col-start-2 lg:row-span-full lg:flex lg:min-w-0 lg:w-full lg:max-w-[320px] lg:flex-col lg:gap-6">
        <section className="col-span-1 order-7 lg:order-none">
          <Card>
            <div className="card-block-header items-start">
              <h2 className="card-block-title">Calendário</h2>
            </div>
            <CalendarSkeleton compact={!isLg} />
          </Card>
        </section>
        <section className="col-span-1 order-3 lg:order-none">
          <Card>
            <div className="card-block-header">
              <h2 className="card-block-title">Últimas transações</h2>
            </div>
            <ul className="card-list-flush">
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i}>
                  <TransactionListRowSkeleton />
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </div>
    </div>
  )
}
