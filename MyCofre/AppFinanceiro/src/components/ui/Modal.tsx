import { type ReactNode } from 'react'
import { SheetModalFrame } from './SheetModalFrame'

interface ModalProps {
  /** Conteúdo do modal */
  children: ReactNode
  /** Chamado ao fechar (Escape ou clique no overlay) */
  onClose: () => void
  /** Título exibido no topo (opcional) */
  title?: string
  /** Largura máxima do painel no desktop (default: fullBleed `md:max-w-xl`, senão `max-w-lg`) */
  className?: string
  /**
   * Mobile: folha full-width ~85dvh; em md+ mantém largura controlada por `className`.
   */
  fullBleedMobile?: boolean
}

/**
 * Modal de rota / formulário: no mobile usa o mesmo shell de bottom sheet que o restante do app.
 */
export function Modal({
  children,
  onClose,
  title,
  className,
  fullBleedMobile = false,
}: ModalProps) {
  return (
    <SheetModalFrame
      open
      onClose={onClose}
      title={title}
      titleId="modal-title"
      fullBleedMobile={fullBleedMobile}
      className={className}
      zIndex={50}
      bodyClassName="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] md:p-6"
    >
      {children}
    </SheetModalFrame>
  )
}
