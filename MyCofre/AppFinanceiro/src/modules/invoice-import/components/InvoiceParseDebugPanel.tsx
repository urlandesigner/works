import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { Card } from '../../../components/ui/Card'
import type { InvoiceParseDebug, PdfTextExtractionDebug } from '../types'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface InvoiceParseDebugPanelProps {
  debug: InvoiceParseDebug | null | undefined
  pdfExtraction?: PdfTextExtractionDebug | null
}

export function InvoiceParseDebugPanel({
  debug,
  pdfExtraction,
}: InvoiceParseDebugPanelProps) {
  const [open, setOpen] = useState(true)

  const { accepted, rejected, sampleRejected } = useMemo(() => {
    if (!debug) {
      return { accepted: [], rejected: [], sampleRejected: [] }
    }
    const acc = debug.lines.filter((l) => l.outcome === 'accepted')
    const rej = debug.lines.filter((l) => l.outcome === 'rejected')
    return {
      accepted: acc,
      rejected: rej,
      sampleRejected: rej.slice(0, 40),
    }
  }, [debug])

  if (!debug && !pdfExtraction) return null

  return (
    <Card className="border-dashed border-slate-300 dark:border-slate-600">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 text-left"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-ds-muted dark:text-[var(--icon-default)]" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-ds-muted dark:text-[var(--icon-default)]" />
        )}
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Debug (PDF + parser)
        </span>
        {debug ? (
          <span className="text-xs text-ds-muted">
            {debug.linesScanned} linhas texto · {debug.acceptedCount} aceitas · total{' '}
            {debug.totalDetected != null ? BRL.format(debug.totalDetected) : '—'}
          </span>
        ) : (
          <span className="text-xs text-ds-muted">Extração PDF</span>
        )}
      </button>

      {open ? (
        <div className="mt-4 space-y-4 text-sm">
          {pdfExtraction ? (
            <div className="rounded-lg border border-blue-200/80 bg-blue-50/50 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
              <p className="text-xs font-semibold uppercase text-blue-900 dark:text-blue-200">
                Extração do PDF (pdf.js)
              </p>
              <dl className="mt-2 grid gap-2 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-blue-800/80 dark:text-blue-300/80">Páginas</dt>
                  <dd className="font-medium text-blue-950 dark:text-blue-100">
                    {pdfExtraction.pageCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-blue-800/80 dark:text-blue-300/80">Itens (str)</dt>
                  <dd className="font-medium text-blue-950 dark:text-blue-100">
                    {pdfExtraction.totalItems}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-blue-800/80 dark:text-blue-300/80">Linhas reconstruídas</dt>
                  <dd className="font-medium text-blue-950 dark:text-blue-100">
                    {pdfExtraction.totalLines}
                  </dd>
                </div>
              </dl>
              <p className="mt-2 text-xs font-medium uppercase text-blue-900 dark:text-blue-200">
                Prévia (20 primeiras linhas)
              </p>
              <ul className="mt-1 max-h-48 overflow-y-auto rounded border border-blue-200/60 bg-white/80 p-2 font-mono text-[11px] text-slate-800 dark:border-blue-800/40 dark:bg-zinc-900/60 dark:text-slate-200">
                {pdfExtraction.linePreview.map((line, i) => (
                  <li key={i} className="border-b border-blue-100/80 py-0.5 last:border-0 dark:border-blue-900/30">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {debug ? (
            <>
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase text-ds-muted">Total lançamentos atuais (PDF)</dt>
              <dd className="font-medium">
                {debug.totalLancamentosAtuais != null
                  ? BRL.format(debug.totalLancamentosAtuais)
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-ds-muted">Linhas no texto</dt>
              <dd className="font-medium">{debug.linesScanned}</dd>
            </div>
          </dl>

          {debug.reconciliation ? (
            <div
              className={clsx(
                'rounded-lg border p-3',
                debug.reconciliation.coverage === 'complete'
                  ? 'border-emerald-300/90 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-950/25'
                  : debug.reconciliation.coverage === 'partial'
                    ? 'border-amber-300/90 bg-amber-50/60 dark:border-amber-800/50 dark:bg-amber-950/25'
                    : 'border-slate-200/90 bg-slate-50/80 dark:border-white/10 dark:bg-zinc-900/40'
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  Reconciliação (soma vs total)
                </p>
                <span
                  className={clsx(
                    'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    debug.reconciliation.coverage === 'complete' &&
                      'bg-emerald-600 text-white dark:bg-emerald-700',
                    debug.reconciliation.coverage === 'partial' &&
                      'bg-amber-600 text-white dark:bg-amber-700',
                    debug.reconciliation.coverage === 'unknown' &&
                      'bg-slate-500 text-white dark:bg-slate-600'
                  )}
                >
                  {debug.reconciliation.coverage === 'complete'
                    ? 'Parsing completo (±5%)'
                    : debug.reconciliation.coverage === 'partial'
                      ? 'Parsing parcial'
                      : 'Sem total de referência'}
                </span>
              </div>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-[11px] uppercase text-ds-secondary">
                    Total referência (PDF)
                  </dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">
                    {debug.reconciliation.referenceTotal != null
                      ? BRL.format(debug.reconciliation.referenceTotal)
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase text-ds-secondary">
                    Soma aceita
                  </dt>
                  <dd className="font-medium text-emerald-800 dark:text-emerald-200">
                    {BRL.format(debug.reconciliation.sumAccepted)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase text-ds-secondary">
                    Soma descartadas c/ valor
                  </dt>
                  <dd className="font-medium text-amber-800 dark:text-amber-200">
                    {BRL.format(debug.reconciliation.sumDiscardedMonetary)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase text-ds-secondary">
                    Aceito + descartado (valores)
                  </dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">
                    {BRL.format(debug.reconciliation.sumAcceptedPlusDiscarded)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase text-ds-secondary">
                    Diferença (aceita − ref)
                  </dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">
                    {debug.reconciliation.diffToReference != null
                      ? `${BRL.format(debug.reconciliation.diffToReference)} (${debug.reconciliation.percentDiff != null ? (Math.abs(debug.reconciliation.percentDiff) * 100).toFixed(2) : '—'}%)`
                      : '—'}
                  </dd>
                </div>
              </dl>
              <div className="mt-3">
                <p className="text-[11px] font-medium uppercase text-ds-secondary">
                  Valores aceitos ({debug.reconciliation.acceptedValues.length})
                </p>
                <p className="mt-1 max-h-24 overflow-y-auto rounded border border-slate-200/80 bg-white/90 p-2 font-mono text-[11px] text-slate-800 dark:border-white/10 dark:bg-zinc-900/60 dark:text-slate-200">
                  {debug.reconciliation.acceptedValues.length === 0
                    ? '—'
                    : debug.reconciliation.acceptedValues
                        .map((v) => v.toFixed(2).replace('.', ','))
                        .join(' · ')}
                </p>
              </div>
              <div className="mt-3">
                <p className="text-[11px] font-medium uppercase text-ds-secondary">
                  Descartadas com valor monetário ({debug.reconciliation.discardedWithMoney.length})
                </p>
                <ul className="mt-1 max-h-56 overflow-y-auto rounded border border-amber-200/70 bg-white/90 p-2 font-mono text-[11px] dark:border-amber-900/40 dark:bg-zinc-900/50">
                  {debug.reconciliation.discardedWithMoney.length === 0 ? (
                    <li className="text-ds-muted">Nenhuma</li>
                  ) : (
                    debug.reconciliation.discardedWithMoney.map((d, i) => (
                      <li
                        key={i}
                        className="border-b border-amber-100/80 py-1.5 last:border-0 dark:border-amber-900/20"
                      >
                        <span className="font-semibold text-amber-900 dark:text-amber-200">
                          {BRL.format(d.lastAmount)}
                        </span>
                        {d.reason ? (
                          <span className="ml-2 text-amber-800/90 dark:text-amber-300/90">
                            {d.reason}
                          </span>
                        ) : null}
                        <span className="mt-0.5 block truncate text-ds-secondary">
                          {d.normalized || d.raw}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-medium uppercase text-ds-muted">Aceitas ({accepted.length})</p>
            <ul className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200/80 bg-slate-50/80 p-2 font-mono text-xs dark:border-white/10 dark:bg-zinc-900/50">
              {accepted.map((l, i) => (
                <li key={i} className="border-b border-slate-200/50 py-1 last:border-0 dark:border-white/5">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                    {l.extractedAmount != null ? BRL.format(l.extractedAmount) : '—'}
                    {l.recoveredFromFallback ? (
                      <span className="ml-1 rounded bg-violet-200/80 px-1 text-[10px] font-semibold text-violet-900 dark:bg-violet-900/50 dark:text-violet-200">
                        fallback
                      </span>
                    ) : null}
                    {l.hadMultipleMoneyValues ? (
                      <span className="ml-1 font-normal text-amber-700 dark:text-amber-300">
                        (vários valores na linha)
                      </span>
                    ) : null}
                    {l.confidenceScore != null ? (
                      <span
                        title={
                          l.confidenceReasons?.length
                            ? l.confidenceReasons.join('\n')
                            : undefined
                        }
                        className="ml-1 cursor-help rounded bg-slate-200/90 px-1 text-[10px] font-semibold text-slate-800 dark:bg-zinc-700 dark:text-slate-100"
                      >
                        {l.confidenceLevel ?? '?'} {l.confidenceScore}
                      </span>
                    ) : null}
                  </span>
                  {l.confidenceReasons && l.confidenceReasons.length > 0 ? (
                    <span className="mt-0.5 block text-[10px] leading-snug text-ds-muted">
                      {l.confidenceReasons.slice(0, 4).join(' · ')}
                      {l.confidenceReasons.length > 4 ? '…' : ''}
                    </span>
                  ) : null}
                  <span className="mt-0.5 block truncate text-slate-700 dark:text-slate-300">
                    {l.normalized || l.raw}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-ds-muted">
              Descartadas ({rejected.length}) — amostra de {sampleRejected.length}
            </p>
            <ul className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200/80 bg-slate-50/80 p-2 font-mono text-xs dark:border-white/10 dark:bg-zinc-900/50">
              {sampleRejected.map((l, i) => (
                <li
                  key={i}
                  className={clsx(
                    'border-b border-slate-200/60 py-1 last:border-0 dark:border-white/5',
                    'text-slate-700 dark:text-slate-300'
                  )}
                >
                  <span className="text-amber-800 dark:text-amber-200">
                    {l.reason ?? '—'}
                  </span>
                  <span className="block truncate text-ds-muted">
                    {(l.normalized || l.raw).slice(0, 120)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-ds-muted">
            Também registrado em console (dev): <code className="rounded bg-slate-100 px-1 dark:bg-zinc-800">[invoice-parser]</code>
          </p>
            </>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}
