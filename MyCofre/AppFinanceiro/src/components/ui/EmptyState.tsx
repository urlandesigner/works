import { type LucideIcon } from 'lucide-react'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  /** Ações (ex.: Button com link) */
  children?: ReactNode
  /** `default`: destaque maior; `compact`: listas e cards menores */
  variant?: 'default' | 'compact'
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const compact = variant === 'compact'

  return (
    <div
      className={clsx(
        'animate-empty-in text-center',
        compact ? 'py-2' : 'py-6 sm:py-8',
        className
      )}
    >
      {Icon ? (
        <div
          className={clsx(
            'mx-auto flex items-center justify-center rounded-2xl bg-slate-100 text-ds-muted ring-1 ring-slate-900/[0.04] dark:bg-zinc-800 dark:ring-white/[0.06]',
            compact ? 'mb-3 h-11 w-11' : 'mb-4 h-14 w-14 sm:h-16 sm:w-16'
          )}
          aria-hidden
        >
          <Icon className={compact ? 'h-5 w-5' : 'h-7 w-7 sm:h-8 sm:w-8'} strokeWidth={1.5} />
        </div>
      ) : null}
      <h3
        className={clsx(
          'font-display font-semibold tracking-tight text-slate-950 dark:text-slate-100',
          compact ? 'text-sm' : 'text-base sm:text-lg'
        )}
      >
        {title}
      </h3>
      {description ? (
        <p
          className={clsx(
            'card-prose mx-auto mt-2 max-w-md',
            compact ? 'text-xs' : 'text-sm'
          )}
        >
          {description}
        </p>
      ) : null}
      {children ? (
        <div
          className={clsx(
            'flex flex-wrap items-center justify-center gap-2',
            compact ? 'mt-3' : 'mt-5'
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
