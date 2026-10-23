import { type ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/[0.02] transition-shadow duration-200 ease-out motion-safe:hover:shadow-md dark:border-[var(--border-default)] dark:bg-[var(--bg-card)] dark:ring-[var(--ring-default)] dark:shadow-none dark:motion-safe:hover:shadow-lg dark:motion-safe:hover:shadow-black/25',
        className
      )}
    >
      {children}
    </div>
  )
}
