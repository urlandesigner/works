import { type ReactNode } from 'react'
import { clsx } from 'clsx'

interface MetricCardProps {
  /** Título pequeno (label) no topo */
  title: string
  /** Descrição opcional abaixo do título */
  description?: string
  /** Ícone exibido no canto superior direito (ex.: componente Lucide) */
  icon?: ReactNode
  /** Classes do container do ícone (tom de marca por métrica) */
  iconWrapperClassName?: string
  /** Tamanho do quadrado do ícone (ex.: h-10 w-10). Default: h-11 w-11 */
  iconBoxClassName?: string
  /** Valor principal em destaque (ex.: R$ 0) */
  value: ReactNode
  /** Sobrescreve peso/cor do valor (default: negrito, texto primário). */
  valueClassName?: string
  /** Informação secundária alinhada à direita (ex.: porcentagem, meta) */
  secondary?: ReactNode
  /** Classes adicionais no container do card */
  className?: string
}

const defaultIconWrap =
  'bg-gradient-to-br from-violet-50 to-slate-50 text-violet-700 ring-violet-900/[0.06] dark:from-violet-950/80 dark:to-zinc-800 dark:text-violet-300 dark:ring-violet-400/20'

export function MetricCard({
  title,
  description,
  icon,
  iconWrapperClassName,
  iconBoxClassName,
  value,
  valueClassName,
  secondary,
  className,
}: MetricCardProps) {
  return (
    <div
      className={clsx(
        'flex min-h-[148px] flex-col rounded-2xl border border-gray-200 bg-[#FFFFFF] p-6 shadow-sm ring-1 ring-gray-900/[0.02] transition-shadow duration-200 ease-out motion-safe:hover:shadow-md sm:min-h-[156px] dark:border-[var(--border-default)] dark:bg-[var(--bg-card)] dark:ring-[var(--ring-default)] dark:shadow-none dark:motion-safe:hover:shadow-lg dark:motion-safe:hover:shadow-black/30',
        className
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide leading-snug text-gray-500 dark:text-[var(--text-secondary)]">
            {title}
          </p>
          {description && (
            <p className="mt-2 text-sm font-normal leading-snug text-gray-600 dark:text-[var(--text-muted)]">
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={clsx(
              'flex shrink-0 items-center justify-center rounded-xl ring-1',
              iconBoxClassName ?? 'h-11 w-11',
              iconWrapperClassName ?? defaultIconWrap
            )}
            aria-hidden
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-end pt-7">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              className={clsx(
                'font-display text-2xl leading-snug tabular-nums tracking-tight',
                valueClassName ?? 'font-bold text-gray-900 dark:text-[var(--text-primary)]'
              )}
            >
              {value}
            </p>
          </div>
          {secondary != null && secondary !== '' && (
            <div className="shrink-0 text-sm font-medium text-gray-600 dark:text-[var(--text-muted)]">
              {secondary}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
