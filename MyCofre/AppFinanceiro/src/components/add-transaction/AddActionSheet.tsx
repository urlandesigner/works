import { clsx } from 'clsx'
import { ListChecks, Sparkles } from 'lucide-react'
import { SheetModalFrame } from '../ui/SheetModalFrame'

export interface AddActionSheetProps {
  open: boolean
  onClose: () => void
  onSelectAssistant: () => void
  onSelectManual: () => void
  /** Quando false, só exibe a opção manual (feature flag do assistente). */
  showAssistant?: boolean
}

export function AddActionSheet({
  open,
  onClose,
  onSelectAssistant,
  onSelectManual,
  showAssistant = true,
}: AddActionSheetProps) {
  return (
    <SheetModalFrame
      open={open}
      onClose={onClose}
      zIndex={100}
      variant="auto"
      fullBleedMobile
      className="md:max-w-xl"
      overlayVariant="home"
      title="Como você quer adicionar?"
      titleId="add-action-sheet-title"
      bodyClassName="p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]"
    >
      <div className="grid gap-3">
        {showAssistant ? (
          <button
            type="button"
            onClick={onSelectAssistant}
            className={clsx(
              'group flex w-full items-start gap-4 rounded-2xl border px-4 py-4 text-left shadow-sm transition duration-200 ease-out active:scale-[0.99] motion-reduce:transition-none',
              'border-brand-200/80 bg-gradient-to-br from-brand-50/90 via-white to-slate-50/85 ring-1 ring-brand-900/[0.06]',
              'hover:border-brand-400/70 hover:shadow-md hover:ring-brand-500/20',
              'dark:border-brand-400/28 dark:border-white/[0.10]',
              'dark:!bg-[linear-gradient(145deg,rgba(59,130,246,0.14)_0%,var(--bg-elevated)_44%,rgb(24_24_27)_100%)]',
              'dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
              'dark:ring-1 dark:ring-brand-400/18',
              'dark:hover:border-brand-300/45 dark:hover:!bg-[linear-gradient(145deg,rgba(59,130,246,0.22)_0%,var(--bg-elevated)_48%,rgb(24_24_27)_100%)]',
              'dark:hover:shadow-lg dark:hover:shadow-black/40 dark:hover:ring-brand-300/24'
            )}
          >
            <span
              className={clsx(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md ring-1',
                'bg-brand-600 ring-brand-900/15',
                'dark:bg-brand-500/90 dark:shadow-brand-950/40 dark:ring-brand-400/25',
                'dark:group-hover:bg-brand-400/95 dark:group-hover:ring-brand-300/30'
              )}
            >
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                Assistente
              </span>
              <span className="mt-0.5 block text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                Descreva em linguagem natural
              </span>
            </span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={onSelectManual}
          className={clsx(
            'group flex w-full items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50/90 px-4 py-4 text-left transition duration-200 ease-out active:scale-[0.99] motion-reduce:transition-none',
            'hover:border-gray-300 hover:bg-white',
            'dark:border-[var(--border-default)] dark:bg-[var(--bg-surface)]',
            'dark:hover:border-white/[0.14] dark:hover:bg-white/[0.04]'
          )}
        >
          <span
            className={clsx(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-gray-700 ring-1 ring-black/[0.04]',
              'border-gray-200 bg-white',
              'dark:border-white/[0.10] dark:bg-zinc-900/80 dark:text-[var(--text-secondary)] dark:ring-white/[0.04]',
              'dark:group-hover:border-white/[0.14] dark:group-hover:bg-zinc-900'
            )}
          >
            <ListChecks className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-gray-900 dark:text-[var(--text-primary)]">
              Manual
            </span>
            <span className="mt-0.5 block text-sm text-gray-600 dark:text-[var(--text-muted)]">
              Preencha os campos
            </span>
          </span>
        </button>
      </div>
    </SheetModalFrame>
  )
}
