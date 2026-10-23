import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { AlertTriangle, CheckCircle2, OctagonAlert } from 'lucide-react'
import type { AlertCardAction, AlertCardType } from '../../types/alert-card'

const defaultIcon: Record<AlertCardType, ReactNode> = {
  positive: (
    <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
  ),
  warning: (
    <AlertTriangle className="h-4 w-4" strokeWidth={1.5} aria-hidden />
  ),
  danger: (
    <OctagonAlert className="h-4 w-4" strokeWidth={1.5} aria-hidden />
  ),
}

const typeStyles: Record<
  AlertCardType,
  { surface: string; accent: string; iconWrap: string; title: string; desc: string }
> = {
  positive: {
    surface: 'bg-[#F4FBF7] dark:bg-emerald-950/35',
    accent: 'border-l-emerald-500',
    iconWrap:
      'border border-emerald-100/80 bg-white/80 text-emerald-600/70 shadow-sm dark:border-emerald-800/50 dark:bg-zinc-900/80 dark:text-emerald-400',
    title: 'text-gray-900 dark:text-slate-100',
    desc: 'text-gray-600 dark:text-slate-400',
  },
  warning: {
    surface: 'bg-[#FFF7ED] dark:bg-amber-950/30',
    accent: 'border-l-amber-400',
    iconWrap:
      'border border-amber-100/90 bg-white/80 text-amber-600/75 shadow-sm dark:border-amber-800/45 dark:bg-zinc-900/80 dark:text-amber-300',
    title: 'text-gray-900 dark:text-slate-100',
    desc: 'text-gray-600 dark:text-slate-400',
  },
  danger: {
    surface: 'bg-[#FEF7F7] dark:bg-red-950/30',
    accent: 'border-l-red-400',
    iconWrap:
      'border border-red-100/90 bg-white/80 text-red-600/70 shadow-sm dark:border-red-800/45 dark:bg-zinc-900/80 dark:text-red-400',
    title: 'text-gray-900 dark:text-slate-100',
    desc: 'text-gray-600 dark:text-slate-400',
  },
}

export interface AlertCardProps {
  type: AlertCardType
  title: string
  description: string
  icon?: ReactNode
  action?: AlertCardAction
  className?: string
}

export function AlertCard({
  type,
  title,
  description,
  icon,
  action,
  className,
}: AlertCardProps) {
  const styles = typeStyles[type]
  const iconNode = icon ?? defaultIcon[type]

  return (
    <div
      role="status"
      className={clsx(
        'rounded-2xl border border-gray-200 py-6 pl-6 pr-6 shadow-sm dark:border-white/[0.1] dark:shadow-none',
        'border-l-4',
        styles.surface,
        styles.accent,
        className
      )}
    >
      <div className="flex gap-4 sm:items-start">
        <div
          className={clsx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            styles.iconWrap
          )}
          aria-hidden
        >
          {iconNode}
        </div>
        <div className="min-w-0 flex-1">
          <h2
            className={clsx(
              'font-display text-base font-semibold leading-snug tracking-tight',
              styles.title
            )}
          >
            {title}
          </h2>
          <p
            className={clsx(
              'mt-2 text-sm font-normal leading-relaxed',
              styles.desc
            )}
          >
            {description}
          </p>
          {action ? (
            <div className="mt-5">
              {action.to ? (
                <Link to={action.to} className="card-action-text inline-flex">
                  {action.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={action.onClick}
                  className="card-action-text"
                >
                  {action.label}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
