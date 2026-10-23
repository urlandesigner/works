import { useState, useCallback } from 'react'
import { clsx } from 'clsx'
import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { branding } from '../../../config/branding'
import { getSidebarExpanded, setSidebarExpanded } from '../../lib/storage'
import { AppNav } from './AppNav'
import { SidebarUserCard } from './SidebarUserCard'

export function Sidebar() {
  const [expanded, setExpandedState] = useState(getSidebarExpanded)

  const toggle = useCallback(() => {
    setExpandedState((prev) => {
      const next = !prev
      setSidebarExpanded(next)
      return next
    })
  }, [])

  return (
    <aside
      className={clsx(
        'flex h-full shrink-0 flex-col border-r border-white/[0.08] bg-[#141414] px-3 transition-[width] duration-200 ease-out',
        expanded ? 'w-[250px]' : 'w-[4.5rem]'
      )}
    >
      {/* Header: fixo no topo */}
      <div
        className={clsx(
          'flex h-14 shrink-0 items-center gap-2',
          expanded ? 'justify-between' : 'justify-center'
        )}
      >
        {expanded && (
          <h1 className="truncate font-display text-lg font-semibold tracking-tight text-white">
            {branding.name}
          </h1>
        )}
        <button
          type="button"
          onClick={toggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#A1A1AA] transition hover:bg-[#1A1A1A] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          title={expanded ? 'Recolher menu' : 'Expandir menu'}
          aria-label={expanded ? 'Recolher menu' : 'Expandir menu'}
        >
          {expanded ? (
            <PanelLeftClose className="h-5 w-5" aria-hidden />
          ) : (
            <PanelLeft className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>

      {/* Navegação: única área com scroll */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-2 pt-2">
        <AppNav variant="dark" collapsed={!expanded} />
      </div>

      {/* Footer: fixo na parte inferior */}
      <div className="shrink-0 py-2">
        <SidebarUserCard variant="dark" collapsed={!expanded} />
      </div>
    </aside>
  )
}
