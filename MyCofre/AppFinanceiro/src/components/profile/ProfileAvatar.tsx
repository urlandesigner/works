import { clsx } from 'clsx'

const sizeClasses = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-24 w-24 text-2xl sm:h-28 sm:w-28 sm:text-3xl',
  xl: 'h-32 w-32 text-4xl',
} as const

function displayInitial(name: string): string {
  const t = name.trim()
  if (!t) return '?'
  return t.charAt(0).toUpperCase()
}

interface ProfileAvatarProps {
  /** Data URL ou URL absoluta; vazio/null mostra inicial. */
  src?: string | null
  name: string
  size?: keyof typeof sizeClasses
  className?: string
  /** Quando true, a imagem/inicial é só decorativa (ex.: dentro de botão com aria-label). */
  decorative?: boolean
}

/**
 * Avatar com imagem ou fallback por inicial (estado vazio = ?).
 */
export function ProfileAvatar({
  src,
  name,
  size = 'md',
  className,
  decorative = false,
}: ProfileAvatarProps) {
  const initial = displayInitial(name)

  if (src) {
    return (
      <div
        className={clsx(
          'relative shrink-0 overflow-hidden rounded-full bg-slate-100 ring-2 ring-white shadow-sm',
          sizeClasses[size],
          className
        )}
      >
        <img
          src={src}
          alt={
            decorative
              ? ''
              : `Foto de ${name.trim() || 'perfil'}`
          }
          className="h-full w-full object-cover"
          decoding="async"
        />
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-slate-200 font-display font-semibold text-brand-800 ring-2 ring-white shadow-sm',
        sizeClasses[size],
        className
      )}
      aria-hidden={decorative || initial === '?'}
    >
      {initial}
    </div>
  )
}
