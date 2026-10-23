import { useEffect } from 'react'
import { clsx } from 'clsx'
import { X } from 'lucide-react'
import { branding } from '../../../config/branding'
import { useMobileMenu } from '../../contexts/MobileMenuContext'
import { AppNav } from './AppNav'
import { SidebarUserCard } from './SidebarUserCard'

export function MobileNavDrawer() {
  const { isOpen, close } = useMobileMenu()

  useEffect(() => {
    if (!isOpen) return
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, close])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay: visível apenas em mobile quando menu aberto */}
      <div
        role="presentation"
        aria-hidden={!isOpen}
        onClick={close}
        className={clsx(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ease-out md:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      {/* Drawer: painel deslizante da esquerda */}
      <aside
        aria-label="Menu de navegação"
        aria-modal="true"
        role="dialog"
        className={clsx(
          'fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-white/[0.08] bg-[#141414] pt-[env(safe-area-inset-top,0px)] shadow-2xl shadow-black/40 transition-transform duration-200 ease-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Cabeçalho do drawer */}
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/[0.08] px-4">
          <h1 className="truncate font-display text-lg font-semibold tracking-tight text-white">
            {branding.name}
          </h1>
          <button
            type="button"
            onClick={close}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#A1A1AA] transition hover:bg-[#1A1A1A] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Navegação: mesmo conteúdo do sidebar, sempre expandido */}
        <div className="min-h-0 flex-1 overflow-y-auto px-1 py-4">
          <AppNav variant="dark" collapsed={false} onNavigate={close} />
        </div>

        {/* Área do usuário */}
        <div className="shrink-0 border-t border-white/[0.08] p-4">
          <SidebarUserCard variant="dark" collapsed={false} onNavigate={close} />
        </div>
      </aside>
    </>
  )
}
