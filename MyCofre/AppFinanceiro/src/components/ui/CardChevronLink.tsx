import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

/** Alinhamento padrão do grupo lápis + chevron nos headers de card. */
export const cardHeaderActionsClass =
  'flex shrink-0 items-start gap-1.5'

const chevronLinkClass =
  'flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2 motion-reduce:transition-none dark:text-[var(--icon-default)] dark:hover:bg-white/[0.06] dark:hover:text-[var(--text-primary)] dark:focus-visible:ring-white/20 dark:focus-visible:ring-offset-zinc-900'

/**
 * Ícone de chevron padrão para navegação em cards (uso dentro de um Link maior).
 */
export function CardChevronIcon({ className }: { className?: string }) {
  return (
    <ChevronRight
      className={clsx(
        'h-6 w-6 shrink-0 text-slate-600 dark:text-[var(--icon-default)]',
        className
      )}
      strokeWidth={2.25}
      aria-hidden
    />
  )
}

/**
 * Ação principal de navegação do card — mesmo padrão visual em todo o app.
 */
export function CardChevronLink({
  to,
  'aria-label': ariaLabel,
  title,
  className,
}: {
  to: string
  'aria-label': string
  title?: string
  className?: string
}) {
  return (
    <Link
      to={to}
      className={clsx(chevronLinkClass, className)}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
    >
      <CardChevronIcon />
    </Link>
  )
}
