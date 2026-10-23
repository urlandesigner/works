import { useMemo } from 'react'
import { Card } from '../../../components/ui/Card'
import type { InvoiceDraft, InvoiceItem } from '../types'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface InvoiceSummaryCardsProps {
  draft: InvoiceDraft | null
  items: InvoiceItem[]
}

export function InvoiceSummaryCards({ draft, items }: InvoiceSummaryCardsProps) {
  const {
    sumAllActive,
    sumSelected,
    countFound,
    diffReadVsSelected,
    diffInvoiceVsSelected,
    refTotalLabel,
  } = useMemo(() => {
    const active = items.filter((i) => i.reviewStatus !== 'ignored')
    const selected = active.filter((i) => i.selected)

    const sumAllActive = active.reduce((s, i) => s + i.amount, 0)
    const sumSelected = selected.reduce((s, i) => s + i.amount, 0)
    const countFound = items.filter((i) => i.reviewStatus !== 'ignored').length

    const refTotal =
      draft?.totalLancamentosAtuais != null && draft.totalLancamentosAtuais > 0
        ? draft.totalLancamentosAtuais
        : draft?.totalAmount != null && draft.totalAmount > 0
          ? draft.totalAmount
          : null

    const refTotalLabel =
      draft?.totalLancamentosAtuais != null && draft.totalLancamentosAtuais > 0
        ? 'Total lançamentos atuais (PDF)'
        : 'Total da fatura (PDF)'

    return {
      sumAllActive,
      sumSelected,
      countFound,
      diffReadVsSelected: sumAllActive - sumSelected,
      diffInvoiceVsSelected: refTotal != null ? refTotal - sumSelected : null,
      refTotalLabel,
    }
  }, [draft, items])

  if (!draft && items.length === 0) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
          Total no PDF (detectado)
        </p>
        <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
          {draft?.totalAmount != null ? BRL.format(draft.totalAmount) : '—'}
        </p>
      </Card>

      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
          Lancamentos encontrados
        </p>
        <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
          {countFound}
        </p>
      </Card>

      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
          Soma dos lancamentos (ativos)
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-200">
          {BRL.format(sumAllActive)}
        </p>
      </Card>

      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
          Total selecionado
        </p>
        <p className="mt-1 text-xl font-bold text-brand-700 dark:text-brand-300">
          {BRL.format(sumSelected)}
        </p>
      </Card>

      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
          Diferenca: soma lida - selecionado
        </p>
        <p className="mt-1 text-xl font-semibold text-amber-800 dark:text-amber-200">
          {BRL.format(diffReadVsSelected)}
        </p>
        <p className="mt-1 text-xs text-ds-muted">
          Itens desmarcados ou ignorados entram nessa diferenca.
        </p>
      </Card>

      <Card className="border-brand-200/80 dark:border-brand-800/30">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-800 dark:text-brand-300">
          {diffInvoiceVsSelected != null
            ? `Diferenca: ${refTotalLabel} - selecionado`
            : 'Validacao PDF'}
        </p>
        <p className="mt-1 text-2xl font-bold text-brand-800 dark:text-brand-300">
          {diffInvoiceVsSelected != null ? BRL.format(diffInvoiceVsSelected) : '—'}
        </p>
        <p className="mt-1 text-xs text-ds-muted">
          {draft?.totalLancamentosAtuais != null && draft.totalLancamentosAtuais > 0
            ? 'Preferencia: total dos lancamentos atuais (lista principal).'
            : draft?.totalAmount != null
              ? 'Compare com o valor impresso na fatura.'
              : 'Total da fatura nao detectado no texto.'}
        </p>
      </Card>

      {draft?.parseDebug?.reconciliation ? (
        <Card
          className={
            draft.parseDebug.reconciliation.coverage === 'complete'
              ? 'border-emerald-300/90 dark:border-emerald-800/40 sm:col-span-2 lg:col-span-3'
              : draft.parseDebug.reconciliation.coverage === 'partial'
                ? 'border-amber-300/90 dark:border-amber-800/40 sm:col-span-2 lg:col-span-3'
                : 'sm:col-span-2 lg:col-span-3'
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ds-secondary">
              Parser vs total PDF
            </p>
            <span
              className={
                draft.parseDebug.reconciliation.coverage === 'complete'
                  ? 'rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white'
                  : draft.parseDebug.reconciliation.coverage === 'partial'
                    ? 'rounded-full bg-amber-600 px-2 py-0.5 text-[11px] font-semibold text-white'
                    : 'rounded-full bg-slate-500 px-2 py-0.5 text-[11px] font-semibold text-white'
              }
            >
              {draft.parseDebug.reconciliation.coverage === 'complete'
                ? 'Parsing completo'
                : draft.parseDebug.reconciliation.coverage === 'partial'
                  ? 'Parsing parcial'
                  : 'Sem referencia'}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-800 dark:text-slate-200">
            Soma dos lançamentos:{' '}
            <span className="font-semibold">{BRL.format(draft.parseDebug.reconciliation.sumAccepted)}</span>
            {draft.parseDebug.reconciliation.referenceTotal != null ? (
              <>
                {' '}
                · Total no PDF:{' '}
                <span className="font-semibold">
                  {BRL.format(draft.parseDebug.reconciliation.referenceTotal)}
                </span>
                {draft.parseDebug.reconciliation.diffToReference != null ? (
                  <>
                    {' '}
                    · Diferença:{' '}
                    <span className="font-semibold">
                      {BRL.format(draft.parseDebug.reconciliation.diffToReference)}
                    </span>
                    {draft.parseDebug.reconciliation.percentDiff != null ? (
                      <span className="text-ds-secondary">
                        {' '}
                        ({(Math.abs(draft.parseDebug.reconciliation.percentDiff) * 100).toFixed(1)}%)
                      </span>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-ds-muted">
            Tolerância de cobertura: ±5% em relação ao total detectado. Detalhes em Debug (PDF + parser).
          </p>
        </Card>
      ) : null}

      {draft?.parseHint ? (
        <Card
          className={
            draft.parseQuality === 'low'
              ? 'border-amber-300/80 dark:border-amber-700/40 sm:col-span-2 lg:col-span-3'
              : 'sm:col-span-2 lg:col-span-3'
          }
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-ds-secondary">
            Leitura da fatura
          </p>
          <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{draft.parseHint}</p>
        </Card>
      ) : null}
    </div>
  )
}
