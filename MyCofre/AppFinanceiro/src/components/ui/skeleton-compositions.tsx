import { clsx } from 'clsx'
import { Card } from './Card'
import { Skeleton } from './Skeleton'

/** Mesmas proporções do `MetricCard` (desktop). */
export function MetricCardSkeleton({
  className,
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'compact'
}) {
  if (variant === 'compact') {
    return (
      <Card className={clsx('p-4', className)}>
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-2 h-7 w-[70%] max-w-[10rem]" />
      </Card>
    )
  }
  return (
    <div
      className={clsx(
        'flex min-h-[148px] flex-col rounded-2xl border border-gray-200 bg-[#FFFFFF] p-6 shadow-sm ring-1 ring-gray-900/[0.02] sm:min-h-[156px] dark:border-white/[0.08] dark:bg-zinc-900/90 dark:ring-white/[0.04]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
      </div>
      <div className="mt-auto flex min-h-0 flex-1 flex-col justify-end pt-7">
        <Skeleton className="h-8 w-[65%] max-w-[11rem]" />
      </div>
    </div>
  )
}

export function ListItemSkeleton({
  className,
  iconShape = 'square',
}: {
  className?: string
  /** `square` alinha com ícones em listas de contas/investimentos; `circle` com transações. */
  iconShape?: 'square' | 'circle'
}) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-6 py-3',
        className
      )}
    >
      <Skeleton
        className={clsx(
          'h-9 w-9 shrink-0',
          iconShape === 'circle' ? 'rounded-full' : 'rounded-lg'
        )}
      />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-[72%] max-w-xs" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-4 w-20 shrink-0" />
    </div>
  )
}

function tableSkeletonCellClass(i: number, columns: number): string {
  if (columns === 7) {
    const widths = [
      'w-[min(100%,9rem)]',
      'w-24',
      'w-20',
      'w-20',
      'w-20',
      'w-24',
      'w-10',
    ]
    return widths[i] ?? 'w-16'
  }
  const widths6 = [
    'w-[min(100%,10rem)]',
    'w-24',
    'w-8',
    'w-28',
    'w-16',
    'w-10',
  ]
  return widths6[i] ?? 'w-16'
}

export function TableRowSkeleton({
  columns = 6,
  className,
}: {
  columns?: number
  className?: string
}) {
  const rightAlign = (i: number) =>
    columns === 7 ? i >= 3 && i <= 5 : i === 1 || i === columns - 1

  return (
    <tr className={clsx('border-b border-gray-100 last:border-b-0', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <td
          key={i}
          className={clsx(
            'px-4 py-3 sm:px-6',
            rightAlign(i) && 'text-right',
            i === columns - 1 && columns === 7 && 'w-1 pr-2 sm:pr-4'
          )}
        >
          <Skeleton
            className={clsx(
              'inline-block h-4',
              tableSkeletonCellClass(i, columns),
              i === columns - 1 && columns !== 7 && 'ml-auto'
            )}
          />
        </td>
      ))}
    </tr>
  )
}

export function SectionHeaderSkeleton({ className }: { className?: string }) {
  return <Skeleton className={clsx('mb-2 h-4 w-36', className)} />
}

/** Calendário da Home: título real fica no `Card` pai quando necessário. */
export function CalendarSkeleton({ compact = false }: { compact?: boolean }) {
  const gap = compact ? 'gap-0.5' : 'gap-1 sm:gap-1.5'
  const cell = compact ? 'rounded-md' : 'rounded-lg'
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-36" />
        <div className="flex gap-1">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
      <div className={clsx('grid grid-cols-7 text-center', gap)}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="mx-auto h-3 w-6" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square w-full min-w-0">
            <Skeleton className={clsx('h-full w-full', cell)} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProfileCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:items-start">
        <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
        <div className="w-full min-w-0 flex-1 space-y-4">
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-sm" />
          <Skeleton className="h-4 w-full max-w-xs" />
        </div>
      </div>
    </Card>
  )
}

export function AccountCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={clsx('overflow-hidden', className)}>
      <div className="card-block-header items-start gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-[80%]" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
      </div>
      <div className="card-block-body-flush px-6 py-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      </div>
    </Card>
  )
}

export function InvestmentCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={clsx('overflow-hidden', className)}>
      <div className="card-block-header items-start gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-[70%]" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex shrink-0 gap-1.5">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
      </div>
      <div className="card-block-body-flush px-6 py-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </Card>
  )
}

export function GoalCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={clsx('overflow-hidden', className)}>
      <div className="card-block-header items-start gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-6 w-[75%]" />
        </div>
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
      </div>
      <div className="px-6 pb-6">
        <Skeleton className="mt-2 h-2 w-full rounded-full" />
        <div className="mt-4 flex justify-between gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </Card>
  )
}

export function DashboardMonthFlowSkeleton() {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:gap-8">
        <div className="min-w-0 space-y-2">
          <div className="flex justify-between gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-[55%] max-w-[10rem]" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex justify-between gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-[55%] max-w-[10rem]" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 sm:px-5 lg:mt-8 lg:py-4 dark:border-white/[0.08] dark:bg-zinc-800/50">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-2 h-8 w-36" />
      </div>
    </>
  )
}

export function GoalProjectionCardSkeleton({ compact }: { compact?: boolean }) {
  return (
    <Card>
      <div className="flex items-start gap-2">
        <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-full max-w-md" />
        </div>
      </div>
      <div className={compact ? 'mt-3 space-y-2' : 'mt-4 space-y-3'}>
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </Card>
  )
}

export function CreditCardsSummarySkeletonMobile() {
  return (
    <div className="space-y-3 sm:hidden">
      <div className="grid grid-cols-2 gap-3 max-[360px]:grid-cols-1">
        <MetricCardSkeleton variant="compact" />
        <MetricCardSkeleton variant="compact" />
      </div>
      <Card className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-10" />
        </div>
      </Card>
    </div>
  )
}

/** Linha da lista de transações (com coluna para ação). */
export function TransactionListRowSkeleton() {
  return (
    <div className="card-list-actions-row">
      <div className="flex min-w-0 items-center gap-3 py-0.5">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-[72%] max-w-xs" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-5 w-24 shrink-0" />
      </div>
      <Skeleton className="h-11 w-11 shrink-0 justify-self-end rounded-xl" />
    </div>
  )
}

export function TablistTwoSlotSkeleton() {
  return (
    <div className="grid w-full grid-cols-2 gap-1 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-100/90 to-slate-50/80 p-1 shadow-sm ring-1 ring-slate-900/[0.03] sm:w-auto sm:min-w-[12rem] sm:shrink-0 dark:border-[var(--border-default)] dark:from-zinc-900/80 dark:to-zinc-800/60 dark:ring-[var(--ring-default)]">
      <Skeleton className="min-h-[2.75rem] rounded-xl sm:min-h-0 sm:h-10" />
      <Skeleton className="min-h-[2.75rem] rounded-xl sm:min-h-0 sm:h-10" />
    </div>
  )
}

export function SubscriptionsPageSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 max-[360px]:grid-cols-1 sm:hidden">
        <MetricCardSkeleton variant="compact" />
        <MetricCardSkeleton variant="compact" />
      </div>
      <div className="hidden gap-4 sm:grid sm:grid-cols-2">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-44" />
        <TablistTwoSlotSkeleton />
      </div>
      <section className="min-w-0">
        <Card className="overflow-hidden">
          <div className="card-block-header">
            <h2 className="card-block-title">Assinaturas mensais</h2>
          </div>
          <div className="card-block-body-flush min-w-0 overflow-x-auto">
            <table className="w-full min-w-0 table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/90 dark:border-[var(--border-default)] dark:bg-zinc-900/40">
                  <th className="w-[24%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">
                    Serviço
                  </th>
                  <th className="w-[17%] px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">
                    Valor
                  </th>
                  <th className="w-[9%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">
                    Dia
                  </th>
                  <th className="w-[20%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">
                    Pagamento
                  </th>
                  <th className="w-[12%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)]">
                    Status
                  </th>
                  <th className="w-[18%] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[var(--text-secondary)] sm:px-6">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3, 4].map((i) => (
                  <TableRowSkeleton key={i} columns={6} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  )
}

export function InvestmentsPortfolioSkeleton({
  view = 'cards',
}: {
  view?: 'cards' | 'table'
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3 w-28" />
        <div className="ui-segmented inline-flex min-w-0 shrink-0">
          <Skeleton className="h-9 min-w-[5.5rem] rounded-md" />
          <Skeleton className="h-9 min-w-[6rem] rounded-md" />
        </div>
      </div>
      {view === 'table' ? (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left text-xs tabular-nums sm:min-w-0 sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-slate-50/90 dark:border-[var(--border-default)] dark:bg-zinc-900/40">
                  <th className="px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-ds-muted-strong sm:px-4 sm:py-3 sm:text-xs">
                    Nome
                  </th>
                  <th className="hidden px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-ds-muted-strong sm:table-cell sm:px-4 sm:py-3 sm:text-xs">
                    Conta
                  </th>
                  <th className="hidden px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-ds-muted-strong md:table-cell sm:px-4 sm:py-3 sm:text-xs">
                    Tipo
                  </th>
                  <th className="px-2 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-ds-muted-strong sm:px-4 sm:py-3 sm:text-xs">
                    Investido
                  </th>
                  <th className="px-2 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-ds-muted-strong sm:px-4 sm:py-3 sm:text-xs">
                    Atual
                  </th>
                  <th className="px-2 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-ds-muted-strong sm:px-4 sm:py-3 sm:text-xs">
                    Rent.
                  </th>
                  <th className="w-1 px-2 py-2.5 text-right sm:pr-4" />
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3, 4].map((i) => (
                  <TableRowSkeleton key={i} columns={7} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <InvestmentCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  )
}

export function CreditCardBillsSectionSkeleton({
  sections = 2,
}: {
  sections?: number
}) {
  return (
    <div className="space-y-6">
      {Array.from({ length: sections }).map((_, block) => (
        <section key={block}>
          <div className="mb-3 flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-[60%]" />
              </div>
            </div>
            <Skeleton className="h-6 w-6 shrink-0 rounded" />
          </div>
          <ul className="card-list">
            {[0, 1, 2].map((row) => (
              <li key={row}>
                <div className="card-list-row">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function CreditCardsPageSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <CreditCardsSummarySkeletonMobile />
      <div className="hidden gap-4 sm:grid sm:grid-cols-3">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
      <div className="space-y-4">
        <h2 className="card-block-title">Faturas por cartão</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <Card className="min-w-0">
            <CreditCardBillsSectionSkeleton sections={1} />
          </Card>
          <Card className="min-w-0">
            <CreditCardBillsSectionSkeleton sections={1} />
          </Card>
        </div>
      </div>
    </div>
  )
}

export function InvestmentsSummarySkeleton() {
  return (
    <>
      <div className="space-y-3 sm:hidden">
        <Card className="p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-9 w-[80%] max-w-[12rem]" />
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <MetricCardSkeleton variant="compact" />
          <MetricCardSkeleton variant="compact" />
        </div>
      </div>
      <div className="hidden gap-4 sm:grid sm:grid-cols-3">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    </>
  )
}

