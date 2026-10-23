import { AlertTriangle } from 'lucide-react'
import { clsx } from 'clsx'
import { Card } from '../../../components/ui/Card'
import type { StatementImportItem, StatementImportTransactionType } from '../types'

interface StatementImportReviewTableProps {
  items: StatementImportItem[]
  onChange: (nextItems: StatementImportItem[]) => void
}

function typeBadgeClasses(t: StatementImportTransactionType): string {
  if (t === 'income') {
    return 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-200'
  }
  if (t === 'expense') {
    return 'border-red-300 bg-red-50 text-red-900 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200'
  }
  return 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-100'
}

function typeBadgeLabel(t: StatementImportTransactionType): string {
  if (t === 'income') return 'Entrada'
  if (t === 'expense') return 'Saida'
  return 'Revisar'
}

export function StatementImportReviewTable({
  items,
  onChange,
}: StatementImportReviewTableProps) {
  if (items.length === 0) {
    return (
      <Card>
        <p className="card-prose">
          Nenhuma transacao foi detectada automaticamente neste arquivo.
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="card-block-heading mb-0">Revisao das transacoes detectadas</h2>
        <p className="text-xs text-ds-muted">
          {items.filter((item) => item.isSelected).length} selecionadas
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/[0.08]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-zinc-900/70 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2">OK</th>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Descricao</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Valor</th>
              <th className="px-3 py-2">Categoria sugerida</th>
              <th className="px-3 py-2">Acao</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-white/[0.08] dark:bg-zinc-900/30">
            {items.map((item, index) => {
              const suspicious =
                item.type === 'needs_review' ||
                item.reviewStatus === 'needs_review' ||
                item.duplicateHint
              return (
                <tr
                  key={item.id}
                  className={clsx(
                    item.reviewStatus === 'ignored' && 'opacity-50',
                    suspicious &&
                      item.reviewStatus !== 'ignored' &&
                      'bg-amber-50/80 dark:bg-amber-950/25'
                  )}
                >
                  <td className="px-3 py-2 align-top">
                    <input
                      type="checkbox"
                      checked={item.isSelected}
                      onChange={(event) => {
                        const next = [...items]
                        next[index] = { ...item, isSelected: event.target.checked }
                        onChange(next)
                      }}
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="date"
                      value={item.transactionDate}
                      onChange={(event) => {
                        const next = [...items]
                        next[index] = { ...item, transactionDate: event.target.value }
                        onChange(next)
                      }}
                      className="w-40 max-w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-white/[0.12] dark:bg-zinc-900"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span
                        className={clsx(
                          'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                          typeBadgeClasses(item.type)
                        )}
                      >
                        {typeBadgeLabel(item.type)}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(event) => {
                        const next = [...items]
                        next[index] = { ...item, description: event.target.value }
                        onChange(next)
                      }}
                      className="w-[20rem] rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-white/[0.12] dark:bg-zinc-900"
                    />
                    {item.duplicateHint ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {item.duplicateReason ?? 'Possivel duplicidade'}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <select
                      value={item.type}
                      onChange={(event) => {
                        const nextType = event.target.value as StatementImportTransactionType
                        const next = [...items]
                        const abs = Math.abs(item.amount)
                        next[index] = {
                          ...item,
                          type: nextType,
                          amount:
                            nextType === 'income'
                              ? abs
                              : nextType === 'expense'
                                ? -abs
                                : abs,
                          reviewStatus:
                            nextType === 'needs_review' ? 'needs_review' : item.reviewStatus,
                        }
                        onChange(next)
                      }}
                      className="max-w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-white/[0.12] dark:bg-zinc-900"
                    >
                      <option value="income">Entrada</option>
                      <option value="expense">Saida</option>
                      <option value="needs_review">Revisar (ambiguo)</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="number"
                      value={item.type === 'needs_review' ? Math.abs(item.amount) : item.amount}
                      step="0.01"
                      onChange={(event) => {
                        const parsed = Number.parseFloat(event.target.value)
                        const next = [...items]
                        const absolute = Number.isFinite(parsed) ? Math.abs(parsed) : 0
                        next[index] = {
                          ...item,
                          amount:
                            item.type === 'income'
                              ? absolute
                              : item.type === 'expense'
                                ? -absolute
                                : absolute,
                        }
                        onChange(next)
                      }}
                      className="w-28 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-white/[0.12] dark:bg-zinc-900"
                    />
                    <p className="mt-1 text-xs text-ds-muted">
                      {item.type === 'needs_review'
                        ? 'Valor sem sinal; defina Entrada ou Saida.'
                        : item.type === 'income'
                          ? 'Credito (positivo).'
                          : 'Debito (negativo).'}
                    </p>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="text"
                      value={item.suggestedCategory ?? ''}
                      placeholder="Ex.: Alimentacao"
                      onChange={(event) => {
                        const next = [...items]
                        next[index] = {
                          ...item,
                          suggestedCategory: event.target.value || null,
                        }
                        onChange(next)
                      }}
                      className="w-40 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-white/[0.12] dark:bg-zinc-900"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-100 dark:border-white/[0.12] dark:hover:bg-white/[0.06]"
                      onClick={() => {
                        const next = [...items]
                        const ignored = item.reviewStatus !== 'ignored'
                        next[index] = {
                          ...item,
                          reviewStatus: ignored ? 'ignored' : 'pending',
                          isSelected: !ignored,
                        }
                        onChange(next)
                      }}
                    >
                      {item.reviewStatus === 'ignored' ? 'Reativar' : 'Ignorar'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
