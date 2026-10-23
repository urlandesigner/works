import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { useUserProfile } from '../contexts/UserProfileContext'
import { useValuesVisibility } from '../contexts/ValuesVisibilityContext'
import { useMobileMenu } from '../contexts/MobileMenuContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { DashboardAlertPopover } from './DashboardAlertPopover'
import { HeaderNotificationsPopover } from './HeaderNotificationsPopover'
import { Eye, EyeOff, Menu } from 'lucide-react'
import { branding } from '../../config/branding'

/** Mesmo padrão do sino e do olho (notificações / visibilidade). */
const circularHeaderBtn =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm ring-1 ring-gray-200/70 transition hover:bg-white hover:text-gray-900 hover:ring-gray-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 dark:bg-zinc-800/90 dark:text-slate-300 dark:ring-white/10 dark:hover:bg-zinc-700 dark:hover:text-slate-100 dark:hover:ring-white/15 dark:focus-visible:ring-white/25'

function firstNameForGreeting(fullName: string): string | null {
  const t = fullName.trim()
  if (!t || t === 'Usuário') return null
  const first = t.split(/\s+/)[0]
  return first || null
}

export function AppHeader() {
  const mdUp = useMediaQuery('(min-width: 768px)')
  const { pathname } = useLocation()
  const { profile } = useUserProfile()
  const { actions, title, subtitle, dashboardAlert } = useHeaderActions()
  const { valuesHidden, toggleValuesVisibility } = useValuesVisibility()
  const { open: openMobileMenu } = useMobileMenu()

  const isDashboardHome = pathname === '/dashboard' || pathname === '/'

  const mobileHomeHeading = useMemo(() => {
    const first = firstNameForGreeting(profile.name)
    return first ? `Olá, ${first} 👋` : 'Bem-vindo de volta 👋'
  }, [profile.name])

  const actionCluster = (
    <>
      {actions != null ? (
        <div className="flex shrink-0 flex-nowrap items-center justify-end gap-1.5 sm:gap-2">
          {actions}
        </div>
      ) : null}
      {dashboardAlert ? (
        <DashboardAlertPopover alert={dashboardAlert} />
      ) : null}
      <HeaderNotificationsPopover />
      <button
        type="button"
        onClick={toggleValuesVisibility}
        title={valuesHidden ? 'Mostrar valores' : 'Ocultar valores'}
        aria-label={valuesHidden ? 'Mostrar valores monetários' : 'Ocultar valores monetários'}
        className={circularHeaderBtn}
      >
        {valuesHidden ? (
          <EyeOff className="h-5 w-5" aria-hidden />
        ) : (
          <Eye className="h-5 w-5" aria-hidden />
        )}
      </button>
    </>
  )

  const mobileTitle = !mdUp && isDashboardHome ? mobileHomeHeading : title
  const mobileSubtitle = !mdUp && isDashboardHome ? branding.tagline : null

  return (
    <header className="bg-transparent shadow-none">
      {mdUp ? (
        <div className="flex min-h-[64px] flex-row flex-wrap items-center justify-between gap-4 py-1">
          <div className="min-w-0 flex-1">
            {title ? (
              <div>
                <h1 className="truncate font-display text-[1.75rem] font-bold leading-tight tracking-tight text-gray-900 dark:text-slate-100">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-1.5 truncate text-sm font-normal leading-relaxed text-gray-500 dark:text-slate-400">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="h-9" aria-hidden />
            )}
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
            {actionCluster}
          </div>
        </div>
      ) : (
        <div className="py-1.5">
          <div className="flex min-h-11 items-center gap-2">
            <button
              type="button"
              onClick={openMobileMenu}
              className={circularHeaderBtn}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            {mobileTitle ? (
              <h1 className="min-w-0 flex-1 truncate font-display text-lg font-bold leading-tight tracking-tight text-gray-900 dark:text-slate-100">
                {mobileTitle}
              </h1>
            ) : (
              <div className="h-7 min-w-0 flex-1" aria-hidden />
            )}
            <button
              type="button"
              onClick={toggleValuesVisibility}
              title={valuesHidden ? 'Mostrar valores' : 'Ocultar valores'}
              aria-label={valuesHidden ? 'Mostrar valores monetários' : 'Ocultar valores monetários'}
              className={circularHeaderBtn}
            >
              {valuesHidden ? (
                <EyeOff className="h-5 w-5" aria-hidden />
              ) : (
                <Eye className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
          {mobileSubtitle ? (
            <p className="mt-0 min-w-0 line-clamp-1 pl-[calc(2.75rem+0.5rem)] text-xs font-normal leading-snug text-gray-500 dark:text-slate-400 md:mt-0.5">
              {mobileSubtitle}
            </p>
          ) : null}
        </div>
      )}
    </header>
  )
}
