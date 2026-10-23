import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, OctagonAlert } from 'lucide-react'
import type { DashboardFinancialAlert } from '../types/alert-card'

const frameByType: Record<
  DashboardFinancialAlert['type'],
  string
> = {
  positive:
    'bg-emerald-50 text-emerald-700 ring-emerald-200/50 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800/50',
  warning:
    'bg-[#FFF4E5] text-amber-700 ring-amber-200/55 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800/40',
  danger:
    'bg-red-50 text-red-700 ring-red-200/65 dark:bg-red-950/45 dark:text-red-300 dark:ring-red-800/50',
}

interface DashboardAlertPopoverProps {
  alert: DashboardFinancialAlert
}

export function DashboardAlertPopover({ alert }: DashboardAlertPopoverProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

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

  const frame = frameByType[alert.type]
  const Icon = alert.type === 'danger' ? OctagonAlert : AlertTriangle
  const action = alert.action

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Alerta: ${alert.title}`}
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-sm ring-1 transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 dark:focus-visible:ring-white/25 ${frame}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
      </button>
      {open ? (
        <div
          role="dialog"
          aria-labelledby="dashboard-alert-popover-title"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white p-4 shadow-lg ring-1 ring-gray-900/[0.04] dark:border-white/[0.1] dark:bg-zinc-900 dark:ring-white/[0.06] dark:shadow-2xl dark:shadow-black/40"
        >
          <h2
            id="dashboard-alert-popover-title"
            className="font-display text-sm font-semibold leading-snug text-gray-900 dark:text-slate-100"
          >
            {alert.title}
          </h2>
          <p className="mt-2 text-sm font-normal leading-relaxed text-gray-600 dark:text-slate-400">
            {alert.description}
          </p>
          {action ? (
            <div className="mt-4">
              {action.to ? (
                <Link
                  to={action.to}
                  onClick={() => setOpen(false)}
                  className="card-action-text inline-flex text-sm font-medium"
                >
                  {action.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    action.onClick?.()
                    setOpen(false)
                  }}
                  className="card-action-text text-sm font-medium"
                >
                  {action.label}
                </button>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
