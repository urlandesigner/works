import { useEffect, useMemo, useRef, type ChangeEvent } from 'react'
import { clsx } from 'clsx'

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function formatBRL(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0
  return brlFormatter.format(safe)
}

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  name?: string
  className?: string
  onBlur?: () => void
  autoFocus?: boolean
  'aria-describedby'?: string
}

export function CurrencyInput({
  value,
  onChange,
  placeholder,
  disabled,
  id,
  name,
  className,
  onBlur,
  autoFocus,
  'aria-describedby': ariaDescribedBy,
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const displayValue = useMemo(() => formatBRL(value), [value])

  const moveCaretToEnd = () => {
    const el = inputRef.current
    if (!el) return
    const pos = el.value.length
    el.setSelectionRange(pos, pos)
  }

  useEffect(() => {
    moveCaretToEnd()
  }, [displayValue])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    const cents = Number.parseInt(digits || '0', 10)
    onChange(cents / 100)
    requestAnimationFrame(moveCaretToEnd)
  }

  return (
    <input
      ref={inputRef}
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      autoFocus={autoFocus}
      disabled={disabled}
      value={displayValue}
      onChange={handleChange}
      onBlur={onBlur}
      onFocus={moveCaretToEnd}
      aria-describedby={ariaDescribedBy}
      placeholder={placeholder}
      className={clsx(
        /* text-base: evita zoom automático no foco (iOS) em inputs com fonte < 16px */
        'w-full rounded-lg border border-slate-300 px-3 py-2 text-base tabular-nums focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-slate-100 sm:text-sm dark:border-zinc-600 dark:bg-zinc-800/60 dark:text-slate-100 dark:focus:border-brand-400 dark:focus:ring-brand-400 dark:disabled:bg-zinc-800',
        className
      )}
    />
  )
}
