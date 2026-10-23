import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { clsx } from 'clsx'
import { Card } from '../../../components/ui/Card'
import type {
  InvoiceConfidenceLevel,
  InvoiceItem,
  InvoiceItemReviewStatus,
} from '../types'

interface InvoiceReviewTableProps {
  items: InvoiceItem[]
  onChange: (next: InvoiceItem[]) => void
}

function badge(t: InvoiceItemReviewStatus): { label: string; className: string } {
  if (t === 'needs_review') {
    return {
      label: 'Revisar',
      className:
        'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100',
    }
  }
  if (t === 'ignored') {
    return {
      label: 'Ignorado',
      className:
        'border-slate-300 bg-slate-100 text-slate-700 dark:border-white/20 dark:bg-zinc-800 dark:text-slate-300',
    }
  }
  if (t === 'confirmed') {
    return {
      label: 'Confirmado',
      className:
        'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-200',
    }
  }
  return {
    label: 'OK',
    className:
      'border-slate-200 bg-white text-slate-800 dark:border-white/10 dark:bg-zinc-900/60 dark:text-slate-200',
  }
}

function confidenceUi(level: InvoiceConfidenceLevel | undefined): {
  label: string
  className: string
} {
  if (level === 'high') {
    return {
      label: 'Alta',
      className:
        'border-emerald-400 bg-emerald-50 text-emerald-950 dark:border-emerald-600/50 dark:bg-emerald-950/50 dark:text-emerald-100',
    }
  }
  if (level === 'medium') {
    return {
      label: 'Média',
      className:
        'border-sky-400 bg-sky-50 text-sky-950 dark:border-sky-600/50 dark:bg-sky-950/50 dark:text-sky-100',
    }
  }
  if (level === 'low') {
    return {
      label: 'Baixa',
      className:
        'border-rose-400 bg-rose-50 text-rose-950 dark:border-rose-600/50 dark:bg-rose-950/50 dark:text-rose-100',
    }
  }
  return {
    label: '—',
    className:
      'border-slate-200 bg-slate-50 text-slate-600 dark:border-white/15 dark:bg-zinc-800/60 dark:text-slate-300',
  }
}

export function InvoiceReviewTable({ items, onChange }: InvoiceReviewTableProps) {
  const confidenceCounts = useMemo(() => {
    let high = 0
    let medium = 0
    let low = 0
    let none = 0
    for (const i of items) {
      const l = i.confidenceLevel
      if (l === 'high') high++
      else if (l === 'medium') medium++
      else if (l === 'low') low++
      else none++
    }
    return { high, medium, low, none }
  }, [items])

  if (items.length === 0) {
    return (
      <Card>
        <p className="card-prose">Nenhum lancamento detectado ainda.</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="card-block-heading mb-0">Revisão assistida dos lançamentos</h2>
        <p className="text-xs text-ds-muted">
          {items.filter((i) => i.selected && i.reviewStatus !== 'ignored').length} selecionados
          {' · '}
          confirme itens médios/baixos na coluna &quot;Revisei&quot; antes de consolidar
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-700 dark:text-slate-300">
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/80 bg-emerald-50/90 px-2 py-1 font-medium text-emerald-900 dark:border-emerald-700/40 dark:bg-emerald-950/40 dark:text-emerald-100">
          Confiança alta: {confidenceCounts.high}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-sky-300/80 bg-sky-50/90 px-2 py-1 font-medium text-sky-900 dark:border-sky-700/40 dark:bg-sky-950/40 dark:text-sky-100">
          Média: {confidenceCounts.medium}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-300/80 bg-rose-50/90 px-2 py-1 font-medium text-rose-900 dark:border-rose-700/40 dark:bg-rose-950/40 dark:text-rose-100">
          Baixa: {confidenceCounts.low}
        </span>
        {confidenceCounts.none > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-300/80 bg-slate-50 px-2 py-1 font-medium text-slate-700 dark:border-white/15 dark:bg-zinc-800/60 dark:text-slate-300">
            Sem pontuação: {confidenceCounts.none}
          </span>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/[0.08]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-zinc-900/70 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2">OK</th>
              <th className="px-3 py-2">Confiança</th>
              <th className="px-3 py-2" title="Obrigatório para confiança média ou baixa">
                Revisei
              </th>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Descricao</th>
              <th className="px-3 py-2">Parcela</th>
              <th className="px-3 py-2">Valor</th>
              <th className="px-3 py-2">Categoria</th>
              <th className="px-3 py-2">Acao</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-white/[0.08] dark:bg-zinc-900/30">
            {items.map((item, index) => {
              const b = badge(item.reviewStatus)
              const c = confidenceUi(item.confidenceLevel)
              const reasonsText =
                item.confidenceReasons && item.confidenceReasons.length > 0
                  ? item.confidenceReasons.join('\n')
                  : undefined
              const suspicious =
                item.confidenceLevel === 'medium' ||
                (item.confidenceLevel === 'low' && item.selected) ||
                (item.confidenceLevel == null &&
                  item.reviewStatus === 'needs_review' &&
                  !item.parserTrusted)
              return (
                <tr
                  key={item.id}
                  className={clsx(
                    item.reviewStatus === 'ignored' && 'opacity-50',
                    suspicious && item.reviewStatus !== 'ignored' && 'bg-amber-50/80 dark:bg-amber-950/25'
                  )}
                >
                  <td className="px-3 py-2 align-top">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      disabled={item.reviewStatus === 'ignored'}
                      onChange={(e) => {
                        const next = [...items]
                        const sel = e.target.checked
                        const needsAck =
                          sel &&
                          (item.confidenceLevel === 'medium' ||
                            item.confidenceLevel === 'low')
                        next[index] = {
                          ...item,
                          selected: sel,
                          reviewConfirmedByUser: needsAck
                            ? false
                            : item.reviewConfirmedByUser,
                        }
                        onChange(next)
                      }}
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span
                      title={reasonsText}
                      className={clsx(
                        'inline-flex cursor-help flex-col gap-0.5 rounded-lg border px-2 py-1 text-[10px] font-semibold uppercase',
                        c.className
                      )}
                    >
                      <span>{c.label}</span>
                      {item.confidenceScore != null ? (
                        <span className="text-[10px] font-normal normal-case opacity-90">
                          {item.confidenceScore}/100
                        </span>
                      ) : null}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top">
                    {item.reviewStatus === 'ignored' ? (
                      <span className="text-xs text-ds-faint">—</span>
                    ) : item.confidenceLevel === 'medium' ||
                      item.confidenceLevel === 'low' ? (
                      <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={item.reviewConfirmedByUser === true}
                          disabled={!item.selected}
                          onChange={(e) => {
                            const next = [...items]
                            next[index] = {
                              ...item,
                              reviewConfirmedByUser: e.target.checked,
                            }
                            onChange(next)
                          }}
                        />
                        <span className={!item.selected ? 'opacity-50' : ''}>
                          Confirmo
                        </span>
                      </label>
                    ) : (
                      <span className="text-xs text-ds-faint" title="Alta confiança">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) => {
                        const next = [...items]
                        next[index] = { ...item, date: e.target.value }
                        onChange(next)
                      }}
                      className="w-40 max-w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-white/[0.12] dark:bg-zinc-900"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span
                      className={clsx(
                        'mb-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase',
                        b.className
                      )}
                    >
                      {b.label}
                    </span>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const next = [...items]
                        next[index] = { ...item, description: e.target.value }
                        onChange(next)
                      }}
                      className="mt-1 block w-[min(100%,20rem)] rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-white/[0.12] dark:bg-zinc-900"
                    />
                    {suspicious ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Verifique se e compra real.
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="text"
                      value={item.installments ?? ''}
                      placeholder="ex. 3/12"
                      onChange={(e) => {
                        const next = [...items]
                        next[index] = {
                          ...item,
                          installments: e.target.value.trim() || null,
                        }
                        onChange(next)
                      }}
                      className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-white/[0.12] dark:bg-zinc-900"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.amount}
                      onChange={(e) => {
                        const parsed = Number.parseFloat(e.target.value)
                        const next = [...items]
                        next[index] = {
                          ...item,
                          amount: Number.isFinite(parsed) ? Math.abs(parsed) : 0,
                        }
                        onChange(next)
                      }}
                      className="w-28 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-900 dark:border-white/[0.12] dark:bg-zinc-900 dark:text-slate-100"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="text"
                      value={item.suggestedCategory ?? ''}
                      onChange={(e) => {
                        const next = [...items]
                        next[index] = {
                          ...item,
                          suggestedCategory: e.target.value || null,
                        }
                        onChange(next)
                      }}
                      className="w-36 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-white/[0.12] dark:bg-zinc-900"
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
                          selected: !ignored,
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
