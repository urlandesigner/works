import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'

type MobileFabProps = {
  ariaLabel: string
  icon: ReactNode
  to?: string
  onClick?: () => void
  className?: string
}

const baseClassName =
  'fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-slate-900/25 transition-[transform,box-shadow,background-color] duration-200 ease-out hover:bg-brand-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.96] motion-reduce:active:scale-100 dark:bg-slate-100 dark:text-zinc-950 dark:shadow-md dark:shadow-black/30 dark:hover:bg-white dark:focus-visible:ring-slate-400 dark:focus-visible:ring-offset-zinc-900 md:hidden'

export function MobileFab({
  ariaLabel,
  icon,
  to,
  onClick,
  className,
}: MobileFabProps) {
  if (to) {
    return (
      <Link
        to={to}
        aria-label={ariaLabel}
        className={clsx(baseClassName, className)}
      >
        {icon}
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={clsx(baseClassName, className)}
    >
      {icon}
    </button>
  )
}
