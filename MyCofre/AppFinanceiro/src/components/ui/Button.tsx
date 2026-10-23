import { type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface BaseButtonProps {
  variant?: ButtonVariant
  className?: string
  children: ReactNode
  'aria-label'?: string
  /** Exibe spinner e desabilita o botão (feedback de ação em andamento). */
  loading?: boolean
}

interface ButtonAsButton extends BaseButtonProps {
  to?: never
  href?: never
  type?: 'button' | 'submit'
  onClick?: () => void
  disabled?: boolean
}

interface ButtonAsLink extends BaseButtonProps {
  to: string
  type?: never
  onClick?: never
  disabled?: never
}

type ButtonProps = ButtonAsButton | ButtonAsLink

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm shadow-slate-900/15 hover:bg-brand-700 focus:ring-brand-500 dark:bg-slate-100 dark:text-zinc-950 dark:shadow-md dark:shadow-black/30 dark:hover:bg-white dark:focus:ring-slate-400',
  secondary:
    'border border-slate-200/80 bg-white text-slate-800 shadow-card-sm hover:bg-slate-50 focus:ring-slate-400 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)] dark:text-[var(--text-primary)] dark:shadow-none dark:hover:bg-white/[0.06] dark:focus:ring-white/20',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300 dark:text-[var(--text-secondary)] dark:hover:bg-white/[0.06] dark:hover:text-[var(--text-primary)] dark:focus:ring-white/20',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500',
}

export function Button({
  variant = 'primary',
  className,
  children,
  'aria-label': ariaLabel,
  loading = false,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-[160ms] ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:active:scale-100 dark:focus:ring-offset-zinc-900'

  const combined = clsx(base, variantStyles[variant], className)

  if ('to' in props && props.to) {
    const { to } = props
    return (
      <Link to={to} className={combined} aria-label={ariaLabel}>
        {children}
      </Link>
    )
  }

  const { type = 'button', onClick, disabled } = props as ButtonAsButton
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combined}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
      ) : null}
      {children}
    </button>
  )
}
