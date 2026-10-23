import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { clsx } from 'clsx'

/** Frame cinza discreto + ícone; alinhado à altura do chevron em `compact`. */
const frameStyles = {
  default:
    'min-h-11 min-w-11 rounded-xl bg-slate-100 ring-1 ring-slate-900/[0.07] text-slate-600 hover:bg-slate-200/75 hover:text-slate-900 hover:ring-slate-900/10 dark:bg-[var(--bg-elevated)] dark:ring-[var(--border-default)] dark:text-[var(--icon-default)] dark:hover:bg-white/[0.06] dark:hover:text-[var(--text-primary)] [&_svg]:h-4 [&_svg]:w-4',
  compact:
    'min-h-11 min-w-11 rounded-xl bg-slate-100 ring-1 ring-slate-900/[0.07] text-slate-600 hover:bg-slate-200/75 hover:text-slate-900 hover:ring-slate-900/10 dark:bg-[var(--bg-elevated)] dark:ring-[var(--border-default)] dark:text-[var(--icon-default)] dark:hover:bg-white/[0.06] dark:hover:text-[var(--text-primary)] [&_svg]:h-3.5 [&_svg]:w-3.5',
} as const

const baseClass =
  'inline-flex shrink-0 items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2 motion-reduce:transition-none dark:focus-visible:ring-white/20 dark:focus-visible:ring-offset-zinc-900'

type EditIconButtonAsLink = {
  to: string
  onClick?: never
  type?: never
}

type EditIconButtonAsButton = {
  to?: never
  onClick: () => void
  type?: 'button'
}

type EditIconButtonProps = (EditIconButtonAsLink | EditIconButtonAsButton) & {
  /** `compact`: ícone ligeiramente menor (mesmo frame que default). */
  size?: keyof typeof frameStyles
  'aria-label'?: string
  title?: string
  className?: string
}

/**
 * Edição secundária em cards — lápis em frame cinza claro, reutilizável.
 */
export function EditIconButton(props: EditIconButtonProps) {
  const {
    size = 'default',
    'aria-label': ariaLabel = 'Editar',
    title = ariaLabel,
    className,
  } = props
  const c = clsx(baseClass, frameStyles[size], className)

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={c} aria-label={ariaLabel} title={title}>
        <Pencil className="shrink-0" strokeWidth={2} aria-hidden />
      </Link>
    )
  }

  const { onClick } = props as EditIconButtonAsButton
  return (
    <button
      type="button"
      onClick={onClick}
      className={c}
      aria-label={ariaLabel}
      title={title}
    >
      <Pencil className="shrink-0" strokeWidth={2} aria-hidden />
    </button>
  )
}
