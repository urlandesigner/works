import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { MoreVertical, Settings, LogOut } from 'lucide-react'
import { ProfileAvatar } from '../profile/ProfileAvatar'
import { useUserProfile } from '../../contexts/UserProfileContext'
import { useAuth } from '../../contexts/AuthContext'

interface SidebarUserCardProps {
  collapsed: boolean
  /** Alinhar ao tema da sidebar escura. */
  variant?: 'light' | 'dark'
  onNavigate?: () => void
}

export function SidebarUserCard({
  collapsed,
  variant = 'light',
  onNavigate,
}: SidebarUserCardProps) {
  const isDark = variant === 'dark'
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { profile, displayAvatarUrl } = useUserProfile()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return
      }
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const menuPanel = menuOpen ? (
    <div
      ref={menuRef}
      className={clsx(
        'absolute z-50 min-w-[10rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg',
        collapsed
          ? 'bottom-0 left-full ml-1'
          : 'bottom-full right-0 mb-1'
      )}
      role="menu"
    >
      <Link
        to="/settings"
        role="menuitem"
        onClick={() => {
          setMenuOpen(false)
          onNavigate?.()
        }}
        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
      >
        <Settings
          className="h-4 w-4 shrink-0 text-ds-muted dark:text-[var(--icon-default)]"
          aria-hidden
        />
        Configurações
      </Link>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setMenuOpen(false)
          void signOut().then(() => navigate('/login', { replace: true }))
        }}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
      >
        <LogOut className="h-4 w-4 shrink-0 text-ds-muted dark:text-[var(--icon-default)]" aria-hidden />
        Deslogar
      </button>
    </div>
  ) : null

  return (
    <div
      className={clsx(
        'relative rounded-xl p-2',
        isDark
          ? 'border border-white/[0.08] bg-[#1A1A1A]/80 backdrop-blur-sm'
          : 'border border-slate-200/80 bg-slate-100/80 shadow-card-sm',
        collapsed ? 'flex flex-col items-center' : 'flex items-center gap-2'
      )}
    >
      {collapsed ? (
        <>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={clsx(
              'shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]',
              isDark
                ? 'text-white focus-visible:ring-white/35'
                : 'focus-visible:ring-slate-400'
            )}
            title="Opções da conta"
            aria-label="Abrir menu do usuário"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <ProfileAvatar
              size="sm"
              src={displayAvatarUrl}
              name={profile.name}
              decorative
              className={clsx(
                'transition ring-2',
                isDark
                  ? 'ring-white/12 hover:ring-white/30'
                  : 'ring-transparent hover:ring-slate-300/80'
              )}
            />
          </button>
          {menuPanel}
        </>
      ) : (
        <>
          <Link
            to="/profile"
            onClick={onNavigate}
            className={clsx(
              'flex min-w-0 flex-1 items-center gap-2 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              isDark
                ? 'focus-visible:ring-white/35 focus-visible:ring-offset-[#141414]'
                : 'focus-visible:ring-slate-400 focus-visible:ring-offset-white'
            )}
          >
            <ProfileAvatar size="sm" src={displayAvatarUrl} name={profile.name} />
            <div className="min-w-0 flex-1">
              <p
                className={clsx(
                  'truncate text-sm font-medium',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                {profile.name}
              </p>
              <p
                className={clsx(
                  'truncate text-xs',
                  isDark ? 'text-[#A1A1AA]' : 'text-slate-500'
                )}
              >
                {profile.email}
              </p>
            </div>
          </Link>
          <div className="relative shrink-0">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className={clsx(
                'flex h-8 w-8 items-center justify-center rounded-lg transition',
                isDark
                  ? 'text-[#A1A1AA] hover:bg-[#1F1F1F] hover:text-white'
                  : 'text-slate-500 hover:bg-slate-200/80 hover:text-slate-700'
              )}
              title="Opções"
              aria-label="Abrir menu do usuário"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <MoreVertical className="h-4 w-4" aria-hidden />
            </button>
            {menuPanel}
          </div>
        </>
      )}
    </div>
  )
}
