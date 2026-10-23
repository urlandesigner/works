import { clsx } from 'clsx'
import { Loader2, Send } from 'lucide-react'
import { SheetModalFrame } from '../../../components/ui/SheetModalFrame'
import { Button } from '../../../components/ui/Button'
import { useToast } from '../../../contexts/ToastContext'
import { useFinancialAssistantChat } from '../hooks/useFinancialAssistantChat'
import { AssistantPreviewSidebarCard } from './AssistantPreviewSidebarCard'
import { TransactionPreviewCard } from './TransactionPreviewCard'

const QUICK_SUGGESTIONS = [
  'gastei 50 no mercado',
  'recebi 2000 de salário',
  'paguei 120 de internet',
]

export interface FinancialAssistantSheetProps {
  open: boolean
  onClose: () => void
}

export function FinancialAssistantSheet({ open, onClose }: FinancialAssistantSheetProps) {
  const { success } = useToast()

  const {
    messages,
    hydrated,
    input,
    setInput,
    currentDraft,
    currentParsed,
    isProcessing,
    isPersisting,
    sendError,
    canRetrySendError,
    chatEndRef,
    setCurrentDraft,
    clearSendError,
    handleSend,
    handleConfirmDraft,
    retryLastFailedAction,
    handleCancelDraft,
    applyQuickSuggestion,
  } = useFinancialAssistantChat(() => {
    success('Transação salva com sucesso.', 5000)
  })

  return (
    <SheetModalFrame
      open={open}
      onClose={onClose}
      zIndex={100}
      fullBleedMobile
      className="md:max-w-xl"
      overlayVariant="home"
      title="Assistente financeiro"
      description="Escreva como você falaria no dia a dia. Mostramos uma prévia; ao confirmar, o lançamento é salvo no app e aparece em Transações e na visão geral."
      titleId="financial-assistant-sheet-title"
      bodyClassName="px-4 py-4"
      footer={
        <footer className="border-t border-gray-100 bg-white/95 px-4 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)]">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => {
                if (sendError) clearSendError()
                setInput(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (!isProcessing) handleSend()
                }
              }}
              rows={2}
              placeholder="Ex.: gastei 120 no uber ontem"
              disabled={isProcessing}
              className="min-h-[2.75rem] min-w-0 flex-1 resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-[border-color,box-shadow] placeholder:text-gray-400 hover:border-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-white/[0.12] dark:bg-zinc-900 dark:text-slate-100 dark:hover:border-white/20 dark:focus:border-brand-500 dark:focus:ring-brand-500/35"
            />
            <Button
              type="button"
              variant="primary"
              className="shrink-0 self-end"
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              loading={isProcessing}
            >
              <Send className="h-4 w-4" />
              Enviar
            </Button>
          </div>
        </footer>
      }
    >
      {!hydrated ? (
        <p className="text-sm text-ds-muted">Carregando…</p>
      ) : null}

      {hydrated && messages.length === 0 && !isProcessing ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-zinc-900/40">
          <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
            Experimente uma destas frases:
          </p>
          <ul className="mt-2 list-inside list-disc text-xs text-gray-600 dark:text-slate-400">
            <li>gastei 50 no mercado</li>
            <li>recebi 2000 de salário</li>
            <li>paguei 120 de internet</li>
          </ul>
        </div>
      ) : null}

      <div className="space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={clsx(
              'max-w-[95%] rounded-2xl px-3 py-2 text-sm',
              m.role === 'user'
                ? 'ml-auto bg-brand-600 text-white dark:bg-brand-700'
                : 'mr-auto border border-gray-200 bg-gray-50 text-gray-800 dark:border-white/10 dark:bg-zinc-900 dark:text-slate-200'
            )}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
            <p className="mt-1 text-[10px] opacity-70">
              {new Date(m.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
        ))}
        {isProcessing ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Só um instante…
          </div>
        ) : null}
        {sendError ? (
          <div className="mr-auto max-w-[95%] rounded-2xl border border-red-200/90 bg-red-50/90 px-3 py-2.5 text-sm text-red-900 dark:border-red-800/60 dark:bg-red-950/35 dark:text-red-100">
            <p>{sendError}</p>
            <div className="mt-2 flex items-center gap-3">
              {canRetrySendError ? (
                <button
                  type="button"
                  onClick={() => void retryLastFailedAction()}
                  className="text-xs font-semibold text-red-800 underline decoration-red-400/70 underline-offset-2 transition hover:text-red-900 dark:text-red-200 dark:decoration-red-300/50 dark:hover:text-red-100"
                >
                  Tentar novamente
                </button>
              ) : null}
              <button
                type="button"
                onClick={clearSendError}
                className="text-xs text-red-700/90 transition hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : null}
        <div ref={chatEndRef} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_SUGGESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => applyQuickSuggestion(q)}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-left text-xs text-gray-700 transition hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-zinc-900 dark:text-slate-300 dark:hover:bg-white/10"
          >
            {q}
          </button>
        ))}
      </div>

      {currentDraft && currentParsed ? (
        <div className="mt-4">
          <TransactionPreviewCard
            draft={currentDraft}
            parsed={currentParsed}
            onChange={(value) => {
              clearSendError()
              setCurrentDraft(value)
            }}
            onConfirm={handleConfirmDraft}
            onCancel={handleCancelDraft}
            isPersisting={isPersisting}
            className="p-3 sm:p-4"
          />
        </div>
      ) : null}

      <div className="mt-4">
        <AssistantPreviewSidebarCard draft={currentDraft} compact />
      </div>
    </SheetModalFrame>
  )
}
