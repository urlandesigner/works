import { useRef } from 'react'
import { clsx } from 'clsx'
import { Tag } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import type { ParsedFinanceAction, TransactionDraft } from '../types'
import { formatPreviewSummaryLine } from '../utils/previewFormatting'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface TransactionPreviewCardProps {
  draft: TransactionDraft
  parsed: ParsedFinanceAction | null
  onChange: (next: TransactionDraft) => void
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  /** Evita confirmação duplicada enquanto grava no banco. */
  isPersisting?: boolean
  className?: string
}

function fieldRing(
  highlight: boolean
): string {
  return clsx(
    'mt-1 block w-full max-w-full min-w-0 rounded-lg border bg-white px-2 py-2 text-sm transition-shadow dark:bg-zinc-900',
    highlight
      ? 'border-amber-400 ring-2 ring-amber-400/35 dark:border-amber-500/50'
      : 'border-slate-300 dark:border-white/[0.12]'
  )
}

export function TransactionPreviewCard({
  draft,
  parsed,
  onChange,
  onConfirm,
  onCancel,
  isPersisting = false,
  className,
}: TransactionPreviewCardProps) {
  const descriptionRef = useRef<HTMLInputElement>(null)
  const amountRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)

  const canConfirm =
    draft.amount > 0 &&
    draft.description.trim().length > 0 &&
    Boolean(draft.date)

  const highlightAmount = draft.amount <= 0
  const highlightDescription = !draft.description.trim()
  const highlightDate = !draft.date

  const handleEditFocus = () => {
    const scroll = (el: HTMLElement | null) =>
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    if (highlightAmount) {
      amountRef.current?.focus()
      scroll(amountRef.current)
    } else if (highlightDescription) {
      descriptionRef.current?.focus()
      scroll(descriptionRef.current)
    } else if (highlightDate) {
      dateRef.current?.focus()
      scroll(dateRef.current)
    } else {
      descriptionRef.current?.focus()
      scroll(descriptionRef.current)
    }
  }

  return (
    <Card
      className={clsx(
        'overflow-hidden border-2 border-brand-200/80 shadow-lg shadow-brand-900/5 dark:border-brand-800/40 dark:shadow-black/20',
        className
      )}
    >
      <header className="border-b border-slate-100/90 pb-3 dark:border-white/[0.06]">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Prévia do lançamento
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-ds-muted">
          Confira os dados abaixo. O lançamento só entra no app depois de você confirmar — até lá é
          só uma prévia.
        </p>
      </header>

      <div className="mt-4 rounded-xl bg-gradient-to-br from-brand-50/90 to-slate-50/80 px-3 py-3 dark:from-brand-950/35 dark:to-zinc-900/60">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ds-muted">
          Resumo
        </p>
        <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
          {formatPreviewSummaryLine(draft)}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-ds-secondary">
          Tipo
          <select
            value={draft.type}
            onChange={(e) =>
              onChange({
                ...draft,
                type: e.target.value as 'income' | 'expense',
              })
            }
            className={fieldRing(false)}
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </label>
        <label className="block text-xs font-medium text-ds-secondary">
          Valor
          <input
            ref={amountRef}
            type="number"
            min={0}
            step="0.01"
            value={draft.amount || ''}
            onChange={(e) => {
              const v = Number.parseFloat(e.target.value)
              onChange({
                ...draft,
                amount: Number.isFinite(v) ? Math.abs(v) : 0,
              })
            }}
            inputMode="decimal"
            className={fieldRing(highlightAmount)}
            aria-invalid={highlightAmount}
          />
        </label>
        <label className="block text-xs font-medium text-ds-secondary sm:col-span-2">
          Descrição
          <input
            ref={descriptionRef}
            type="text"
            value={draft.description}
            onChange={(e) => onChange({ ...draft, description: e.target.value })}
            className={fieldRing(highlightDescription)}
            aria-invalid={highlightDescription}
          />
        </label>
        <label className="block text-xs font-medium text-ds-secondary">
          Data
          <input
            ref={dateRef}
            type="date"
            value={draft.date}
            onChange={(e) => onChange({ ...draft, date: e.target.value })}
            className={fieldRing(highlightDate)}
            aria-invalid={highlightDate}
          />
          {parsed?.data.dateAssumed ? (
            <span className="mt-1 block text-[11px] text-ds-muted">
              Você não citou data na frase — usamos hoje; altere aqui se for outro dia.
            </span>
          ) : null}
        </label>
        <label className="block text-xs font-medium text-ds-secondary">
          <span className="inline-flex items-center gap-1">
            <Tag className="h-3.5 w-3.5 text-ds-faint dark:text-[var(--icon-default)]" aria-hidden />
            Categoria
          </span>
          <input
            type="text"
            value={draft.category ?? ''}
            onChange={(e) =>
              onChange({ ...draft, category: e.target.value.trim() || null })
            }
            placeholder="Ex.: Alimentação"
            className={fieldRing(false)}
          />
        </label>
      </div>

      {!canConfirm ? (
        <p className="mt-3 text-xs text-amber-800 dark:text-amber-200">
          Preencha valor e descrição para habilitar a confirmação
          {highlightAmount ? ' — o valor precisa ser maior que zero' : ''}
          {highlightDescription ? ' — descreva a movimentação' : ''}.
        </p>
      ) : null}

      <footer className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-white/[0.06] sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          type="button"
          variant="primary"
          className="w-full sm:min-w-[12rem] sm:flex-1"
          disabled={!canConfirm || isPersisting}
          loading={isPersisting}
          onClick={() => {
            void onConfirm()
          }}
        >
          Confirmar lançamento
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          disabled={isPersisting}
          onClick={handleEditFocus}
        >
          Editar
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          disabled={isPersisting}
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </footer>

      <p className="mt-3 text-center text-[11px] text-ds-faint">
        Valor exibido:{' '}
        <span className="font-semibold tabular-nums text-slate-600 dark:text-slate-300">
          {BRL.format(draft.amount || 0)}
        </span>
      </p>
    </Card>
  )
}
