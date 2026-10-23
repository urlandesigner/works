import { useEffect, useState } from 'react'
import { Check, Pencil, Send, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useHeaderActions } from '../../../contexts/HeaderActionsContext'
import { useToast } from '../../../contexts/ToastContext'
import { useFinancialAssistantChat } from '../hooks/useFinancialAssistantChat'

const QUICK_SUGGESTIONS = [
  'gastei 50 no mercado',
  'recebi 2000 de salário',
  'paguei 120 de internet',
]

export function FinancialAssistantPage() {
  const { setTitle, setActions } = useHeaderActions()
  const { success } = useToast()
  const [editingDraft, setEditingDraft] = useState(false)

  const {
    messages,
    hydrated,
    input,
    setInput,
    currentDraft,
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
    setEditingDraft(false)
  })

  const hasConversationContent =
    messages.length > 0 || Boolean(currentDraft) || isProcessing || Boolean(sendError)
  const userInteractions = messages.filter((m) => m.role === 'user').length
  const showOnboardingCard = userInteractions < 3
  const isNewUser = userInteractions === 0

  useEffect(() => {
    setTitle('Assistente financeiro', 'Prévia e confirmação')
    setActions(null)
    return () => {
      setTitle('', null)
    }
  }, [setTitle, setActions])

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-5 pb-12">
      {showOnboardingCard ? (
        <Card className="border-slate-200/70 bg-slate-50/30 p-3 shadow-card-sm dark:border-white/[0.08] dark:bg-zinc-900/30">
          <div className="flex items-start gap-2.5">
            <div className="rounded-lg bg-violet-50 p-2 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              {isNewUser ? (
                <>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Escreva do seu jeito e o assistente interpreta tipo, valor, descrição e data para você confirmar.
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-ds-muted">
                    <li>gastei 38 no uber hoje</li>
                    <li>recebi 3200 de salário ontem</li>
                    <li>paguei 120 de internet dia 10</li>
                  </ul>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Pode escrever do seu jeito — a gente entende 👍
                </p>
              )}
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="flex h-auto flex-col">
        <div className="mb-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Conversa</h2>
        </div>

        <div className="relative rounded-2xl border border-slate-200/90 bg-white p-2 shadow-sm dark:border-white/[0.10] dark:bg-zinc-900/70">
          <textarea
            value={input}
            onChange={(e) => {
              if (sendError) clearSendError()
              setInput(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            rows={4}
            placeholder="Me conte sua movimentação. Ex.: gastei 45 no ifood hoje."
            disabled={isProcessing}
            className="min-h-[7.5rem] md:min-h-[8.75rem] w-full resize-y rounded-xl border-0 bg-transparent px-3 py-3 pr-14 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <Button
            type="button"
            variant="primary"
            className="absolute bottom-3 right-3 h-11 w-11 rounded-xl p-0 shadow-md"
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            loading={isProcessing}
          >
            <Send className="h-4 w-4" aria-hidden />
            <span className="sr-only">Enviar</span>
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_SUGGESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => applyQuickSuggestion(q)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 dark:border-white/[0.12] dark:bg-zinc-900 dark:text-slate-300 dark:hover:border-brand-400/40 dark:hover:bg-brand-500/12"
            >
              {q}
            </button>
          ))}
        </div>

        {hasConversationContent ? (
          <div className="mt-4 h-auto space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-white/[0.08] dark:bg-zinc-900/30">
            {!hydrated ? (
              <p className="text-sm text-ds-muted">Carregando…</p>
            ) : null}
            {messages.map((m) => (
              <div
                key={m.id}
                className={clsx(
                  'max-w-[96%] rounded-2xl px-3.5 py-2.5 text-sm',
                  m.role === 'user'
                    ? 'ml-auto bg-brand-600 text-white dark:bg-brand-700'
                    : 'mr-auto border border-slate-200/90 bg-white text-slate-800 dark:border-white/10 dark:bg-zinc-900 dark:text-slate-200'
                )}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p className="mt-1 text-[10px] opacity-70">
                  {new Date(m.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            ))}

            {currentDraft ? (
              <div className="mr-auto max-w-[96%] rounded-2xl border border-violet-200/80 bg-violet-50/70 px-3.5 py-3 text-sm shadow-sm dark:border-violet-500/30 dark:bg-violet-950/25">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                  Interpretação do assistente
                </p>

                {!editingDraft ? (
                  <div className="mt-2 space-y-1.5 text-slate-800 dark:text-slate-200">
                    <p>
                      <span className="text-ds-muted">Tipo:</span>{' '}
                      <span className="font-medium">
                        {currentDraft.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </p>
                    <p>
                      <span className="text-ds-muted">Valor:</span>{' '}
                      <span className="font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(currentDraft.amount || 0)}
                      </span>
                    </p>
                    <p>
                      <span className="text-ds-muted">Descrição:</span>{' '}
                      <span className="font-medium">{currentDraft.description || '—'}</span>
                    </p>
                    <p>
                      <span className="text-ds-muted">Data:</span>{' '}
                      <span className="font-medium">{currentDraft.date || '—'}</span>
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => void handleConfirmDraft()}
                        loading={isPersisting}
                        disabled={isPersisting}
                      >
                        <Check className="h-4 w-4" aria-hidden />
                        Confirmar lançamento
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setEditingDraft(true)}
                        disabled={isPersisting}
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          handleCancelDraft()
                          setEditingDraft(false)
                        }}
                        disabled={isPersisting}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <label className="text-xs font-medium text-ds-secondary">
                      Tipo
                      <select
                        value={currentDraft.type}
                        onChange={(e) =>
                          {
                            clearSendError()
                            setCurrentDraft((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    type: e.target.value as 'income' | 'expense',
                                  }
                                : prev
                            )
                          }
                        }
                        className="ui-field mt-1"
                      >
                        <option value="expense">Despesa</option>
                        <option value="income">Receita</option>
                      </select>
                    </label>
                    <label className="text-xs font-medium text-ds-secondary">
                      Valor
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={currentDraft.amount || ''}
                        onChange={(e) =>
                          {
                            clearSendError()
                            setCurrentDraft((prev) => {
                              if (!prev) return prev
                              const v = Number.parseFloat(e.target.value)
                              return { ...prev, amount: Number.isFinite(v) ? Math.abs(v) : 0 }
                            })
                          }
                        }
                        inputMode="decimal"
                        className="ui-field mt-1"
                      />
                    </label>
                    <label className="text-xs font-medium text-ds-secondary sm:col-span-2">
                      Descrição
                      <input
                        type="text"
                        value={currentDraft.description}
                        onChange={(e) =>
                          {
                            clearSendError()
                            setCurrentDraft((prev) =>
                              prev ? { ...prev, description: e.target.value } : prev
                            )
                          }
                        }
                        className="ui-field mt-1"
                      />
                    </label>
                    <label className="text-xs font-medium text-ds-secondary">
                      Data
                      <input
                        type="date"
                        value={currentDraft.date}
                        onChange={(e) =>
                          {
                            clearSendError()
                            setCurrentDraft((prev) =>
                              prev ? { ...prev, date: e.target.value } : prev
                            )
                          }
                        }
                        className="ui-field mt-1"
                      />
                    </label>

                    <div className="sm:col-span-2 mt-1 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => void handleConfirmDraft()}
                        loading={isPersisting}
                        disabled={isPersisting}
                      >
                        <Check className="h-4 w-4" aria-hidden />
                        Confirmar lançamento
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setEditingDraft(false)}
                        disabled={isPersisting}
                      >
                        Voltar resumo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {isProcessing ? (
              <div className="mr-auto max-w-[96%] rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-zinc-900 dark:text-slate-300">
                Analisando sua movimentação...
              </div>
            ) : null}

            {sendError ? (
              <div className="mr-auto max-w-[96%] rounded-2xl border border-red-200/90 bg-red-50/90 px-3.5 py-2.5 text-sm text-red-900 dark:border-red-800/60 dark:bg-red-950/35 dark:text-red-100">
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
        ) : null}
      </Card>
    </div>
  )
}
