import { clsx } from 'clsx'
import type { HTMLAttributes } from 'react'

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-md bg-slate-200/80 animate-pulse motion-reduce:animate-none dark:bg-zinc-700/70',
        className
      )}
      {...props}
    />
  )
}
