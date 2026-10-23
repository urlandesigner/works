import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { X } from 'lucide-react'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { useBottomSheetViewport } from '../../hooks/useBottomSheetViewport'

const Z_OUTER: Record<50 | 100, string> = {
  50: 'z-50',
  100: 'z-[100]',
}

const Z_INNER: Record<50 | 100, string> = {
  50: 'z-[51]',
  100: 'z-[101]',
}

/**
 * - `full` (default): altura fixa ~85dvh no mobile, corpo com scroll (formulários longos).
 * - `auto`: altura conforme o conteúdo até `max-h-[90dvh]` (seleções curtas, sem área vazia).
 */
export type SheetModalFrameVariant = 'full' | 'auto'

export type SheetModalFrameProps = {
  /** Quando false, não renderiza (útil para sheets controlados por estado). */
  open: boolean
  onClose: () => void
  /** Conteúdo rolável (body). */
  children: ReactNode
  /**
   * Cabeçalho fixo (shrink-0). Se `title` também for passado, `header` tem prioridade.
   */
  header?: ReactNode
  /** Título com estilo padrão do app (barra superior). Ignorado se `header` for definido. */
  title?: string
  /** Descrição opcional abaixo do título padrão. Ignorado se `header` for definido. */
  description?: string
  /** id do `<h2>` quando usar `title` (default: `modal-title` em fluxos com título string). */
  titleId?: string
  /** id do título quando `header` é custom (aria-labelledby do dialog). */
  ariaLabelledBy?: string
  /**
   * Mobile: folha full-bleed (100% largura). Se false, padding horizontal no wrapper (px-3).
   */
  fullBleedMobile?: boolean
  /** Classes extras no painel (ex.: `md:max-w-xl`). */
  className?: string
  zIndex?: 50 | 100
  /** Classes do container rolável (default: `p-6`). */
  bodyClassName?: string
  /** Rodapé fixo abaixo do body (ex.: campo de mensagem no assistente). */
  footer?: ReactNode
  /** Fundo do overlay: padrão (cinza) ou estilo home (escuro + blur). */
  overlayVariant?: 'default' | 'home'
  /** Com `title` string: exibir botão X (default true, alinhado ao sheet da Home). */
  showTitleCloseButton?: boolean
  /**
   * Mobile: `full` = folha alta com scroll interno; `auto` = altura ao conteúdo até 90dvh.
   * Desktop (`md+`) permanece modal com altura automática nos dois casos.
   * Com `footer` volumoso ou formulário longo, prefira `full` (default).
   */
  variant?: SheetModalFrameVariant
}

/**
 * Shell compartilhado: um único componente com layout responsivo.
 * - Mobile: bottom sheet (`justify-end`), safe-area inferior no slot do painel.
 * - Desktop (`md+`): modal centralizado na viewport (`justify-center` + padding).
 * `variant` controla altura no mobile; em `md+` o painel segue `h-auto` / `max-h-[90dvh]`.
 */
export function SheetModalFrame({
  open,
  onClose,
  children,
  header,
  title,
  description,
  titleId = 'modal-title',
  ariaLabelledBy,
  fullBleedMobile = true,
  className,
  zIndex = 50,
  bodyClassName = 'p-6',
  footer,
  overlayVariant = 'default',
  showTitleCloseButton = true,
  variant = 'full',
}: SheetModalFrameProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useBodyScrollLock(open)
  useBottomSheetViewport(panelRef, open, scrollRef)

  useEffect(() => {
    if (!open) return
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  const hasCustomHeader = header != null
  const showTitleBar = !hasCustomHeader && Boolean(title)
  const isAutoHeight = variant === 'auto'

  const overlayClass =
    overlayVariant === 'home'
      ? 'bg-black/50 backdrop-blur-[2px] transition-opacity duration-200 ease-out dark:bg-black/65'
      : 'bg-gray-900/45 dark:bg-black/70'

  const content = (
    <div
      className={clsx(
        'modal-overlay-enter fixed inset-0 flex max-h-full flex-col overflow-hidden overscroll-none bg-transparent',
        /* Mobile: bottom sheet. Desktop: modal centralizado na viewport. */
        'justify-end md:justify-center md:px-4 md:py-6',
        Z_OUTER[zIndex]
      )}
      role="presentation"
    >
      <div
        className={clsx('absolute inset-0 touch-none overscroll-none', overlayClass)}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={clsx(
          'pointer-events-none relative flex w-full shrink-0 justify-center',
          /* Safe area só no mobile (sheet no bottom); no desktop o padding vem do outer. */
          'pb-[max(0.25rem,env(safe-area-inset-bottom,0px))] md:max-h-[min(100dvh,100%)] md:min-h-0 md:pb-0',
          fullBleedMobile ? 'px-0' : 'px-3 sm:px-4',
          Z_INNER[zIndex]
        )}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={
            ariaLabelledBy ?? (showTitleBar ? titleId : undefined)
          }
          className={clsx(
            'pointer-events-auto flex min-h-0 w-full min-w-0 flex-col overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)] dark:shadow-2xl dark:shadow-black/40',
            fullBleedMobile
              ? clsx(
                  'max-w-full shrink-0 rounded-t-2xl border-b-0',
                  isAutoHeight
                    ? 'h-auto max-h-[90dvh]'
                    : 'h-[85dvh] max-h-[100dvh]',
                  'md:mx-auto md:mb-4 md:h-auto md:max-h-[90dvh] md:rounded-2xl md:border-b',
                  className ?? 'md:max-w-xl'
                )
              : clsx(
                  'modal-panel-enter shrink-0 rounded-t-2xl transition-transform duration-200 ease-out will-change-transform',
                  isAutoHeight
                    ? 'h-auto max-h-[90dvh]'
                    : 'h-[85dvh] max-h-[100dvh]',
                  'md:mx-auto md:h-auto md:max-h-[90dvh] md:rounded-2xl',
                  className ?? 'max-w-lg'
                )
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {hasCustomHeader ? (
            header
          ) : showTitleBar ? (
            <div className="shrink-0 border-b border-gray-100 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top,0px))] md:px-6 md:py-4 dark:border-[var(--border-default)]">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1 pr-2">
                  <h2
                    id={titleId}
                    className="min-w-0 font-display text-lg font-semibold leading-snug tracking-tight text-gray-900 dark:text-[var(--text-primary)]"
                  >
                    {title}
                  </h2>
                  {description ? (
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                      {description}
                    </p>
                  ) : null}
                </div>
                {showTitleCloseButton ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 rounded-xl p-2 text-ds-muted transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label="Fechar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div
            ref={scrollRef}
            className={clsx(
              /* pointer-events-auto: garante cliques/toque no formulário dentro do shell (pai pointer-events-none) */
              'pointer-events-auto flex min-w-0 flex-col overflow-x-hidden overscroll-contain',
              isAutoHeight
                ? 'shrink-0 overflow-y-auto max-h-[calc(90dvh-6.5rem)] md:max-h-[min(85dvh,calc(100dvh-4rem))]'
                : 'min-h-0 flex-1 overflow-y-auto',
              bodyClassName
            )}
          >
            {children}
          </div>

          {footer ? <div className="shrink-0">{footer}</div> : null}
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
