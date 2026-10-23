import { clsx } from 'clsx'
import type { LucideIcon } from 'lucide-react'

/** Tom do item selecionado — igual ao filtro de Transações (Todas / Receitas / Despesas). */
export type SegmentedTabTone = 'default' | 'income' | 'expense'

export type SegmentedTabItem<T extends string = string> = {
  value: T
  label: string
  icon: LucideIcon
  /** Padrão: `default` (superfície neutra). */
  tone?: SegmentedTabTone
}

const tablistContainerClass =
  'grid w-full gap-1 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-100/90 to-slate-50/80 p-1 shadow-sm ring-1 ring-slate-900/[0.03] sm:w-auto sm:shrink-0 dark:border-[var(--border-default)] dark:from-zinc-900/80 dark:to-zinc-800/60 dark:ring-[var(--ring-default)]'

const buttonBaseClass =
  'flex min-h-[2.75rem] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-center transition-[color,background-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 motion-reduce:transition-none sm:min-h-0 sm:flex-1 sm:flex-row sm:gap-2 sm:px-3 sm:py-2'

const unselectedClass =
  'text-slate-500 hover:bg-white/55 hover:text-slate-800 active:scale-[0.98] motion-reduce:active:scale-100 dark:text-[var(--text-secondary)] dark:hover:bg-white/[0.06] dark:hover:text-[var(--text-primary)]'

function gridColsClass(count: number): string {
  if (count <= 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-2'
  if (count === 3) return 'grid-cols-3'
  if (count === 4) return 'grid-cols-4'
  return 'grid-cols-3'
}

/** Largura mínima em sm+ alinhada ao uso de 3 abas em Transações. */
function smMinWidthClass(count: number): string {
  if (count === 2) return 'sm:min-w-[14rem]'
  if (count >= 4) return 'sm:min-w-[24rem]'
  return 'sm:min-w-[17.5rem]'
}

function selectedButtonClass(tone: SegmentedTabTone): string {
  if (tone === 'income') {
    return 'bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-200/70 dark:bg-emerald-950/30 dark:text-emerald-100 dark:shadow-none dark:ring-emerald-400/15'
  }
  if (tone === 'expense') {
    return 'bg-red-50 text-red-900 shadow-sm ring-1 ring-red-200/70 dark:bg-red-950/25 dark:text-red-100 dark:shadow-none dark:ring-red-400/15'
  }
  return 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200/80 dark:bg-[var(--bg-elevated)] dark:text-[var(--text-primary)] dark:shadow-none dark:ring-[var(--border-default)]'
}

function iconClass(tone: SegmentedTabTone, selected: boolean): string {
  if (!selected) return 'opacity-55'
  if (tone === 'income') return 'text-emerald-600'
  if (tone === 'expense') return 'text-danger-600'
  return 'text-slate-700 dark:text-[var(--text-secondary)]'
}

export type SegmentedTabListProps<T extends string> = {
  items: SegmentedTabItem<T>[]
  value: T
  onChange: (value: T) => void
  /** Acessibilidade: descreve o propósito do grupo de abas. */
  ariaLabel: string
  /** Prefixo dos `id` dos botões (`${idPrefix}-${value}`). */
  idPrefix: string
  className?: string
}

export function SegmentedTabList<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  idPrefix,
  className,
}: SegmentedTabListProps<T>) {
  const n = items.length
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={clsx(
        tablistContainerClass,
        gridColsClass(n),
        smMinWidthClass(n),
        className
      )}
    >
      {items.map(({ value: itemValue, label, icon: Icon, tone = 'default' }) => {
        const selected = value === itemValue
        return (
          <button
            key={itemValue}
            type="button"
            role="tab"
            aria-selected={selected}
            id={`${idPrefix}-${itemValue}`}
            onClick={() => onChange(itemValue)}
            className={clsx(
              buttonBaseClass,
              selected ? selectedButtonClass(tone) : unselectedClass
            )}
          >
            <Icon
              className={clsx(
                'h-4 w-4 shrink-0 transition-opacity duration-200',
                iconClass(tone, selected)
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
  )
}
