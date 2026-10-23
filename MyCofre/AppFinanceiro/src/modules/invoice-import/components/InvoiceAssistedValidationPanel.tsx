import { AlertTriangle, CheckCircle2, CircleAlert } from 'lucide-react'
import { clsx } from 'clsx'
import { Card } from '../../../components/ui/Card'
import type { InvoiceAssistedValidationResult } from '../invoiceAssistedValidation'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface InvoiceAssistedValidationPanelProps {
  validation: InvoiceAssistedValidationResult
}

export function InvoiceAssistedValidationPanel({
  validation: v,
}: InvoiceAssistedValidationPanelProps) {
  const statusUi = {
    confiavel: {
      label: 'Confiável',
      className:
        'border-emerald-400/90 bg-emerald-50 text-emerald-950 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-100',
      icon: CheckCircle2,
    },
    parcial: {
      label: 'Parcial',
      className:
        'border-amber-400/90 bg-amber-50 text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-100',
      icon: AlertTriangle,
    },
    inconsistente: {
      label: 'Inconsistente',
      className:
        'border-rose-400/90 bg-rose-50 text-rose-950 dark:border-rose-700/50 dark:bg-rose-950/40 dark:text-rose-100',
      icon: CircleAlert,
    },
  }[v.importStatus]

  const Icon = statusUi.icon

  return (
    <Card
      className={clsx(
        'border-2',
        v.importStatus === 'confiavel' && 'border-emerald-300/70 dark:border-emerald-800/40',
        v.importStatus === 'parcial' && 'border-amber-300/70 dark:border-amber-800/40',
        v.importStatus === 'inconsistente' && 'border-rose-300/70 dark:border-rose-800/40'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="card-block-heading mb-1">Validação da importação</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Revisão assistida: o consolidado só pode ser gerado quando não houver bloqueios
            críticos abaixo.
          </p>
        </div>
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
            statusUi.className
          )}
        >
          <Icon className="h-4 w-4" />
          Status: {statusUi.label}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs font-medium uppercase text-ds-muted">
            Total da fatura (PDF)
          </dt>
          <dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
            {v.referenceTotal != null ? BRL.format(v.referenceTotal) : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-ds-muted">
            Soma selecionada
          </dt>
          <dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
            {BRL.format(v.selectedSum)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-ds-muted">
            Diferença
          </dt>
          <dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
            {v.diffToReference != null ? BRL.format(v.diffToReference) : '—'}
            {v.percentDiff != null ? (
              <span className="ml-1 text-xs font-normal text-ds-muted">
                ({(Math.abs(v.percentDiff) * 100).toFixed(2)}%)
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-ds-muted">
            Confiança (sugestões)
          </dt>
          <dd className="mt-0.5 text-slate-800 dark:text-slate-200">
            Alta {v.countsHigh} · Média {v.countsMedium} · Baixa {v.countsLow}
          </dd>
        </div>
      </dl>

      <div className="mt-4 rounded-lg border border-slate-200/90 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-zinc-900/40">
        <p className="text-xs font-semibold uppercase text-ds-secondary">
          Classificação das sugestões
        </p>
        <ul className="mt-2 grid gap-1 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-3">
          <li>
            <span className="font-medium text-emerald-800 dark:text-emerald-200">Aceitos</span>:{' '}
            {v.countAcceptedSuggest} (alta confiança)
          </li>
          <li>
            <span className="font-medium text-amber-800 dark:text-amber-200">Suspeitos</span>:{' '}
            {v.countSuspiciousSuggest}
          </li>
          <li>
            <span className="font-medium text-ds-secondary">Descartados / não selec.</span>:{' '}
            {v.countDiscardedSuggest}
          </li>
        </ul>
      </div>

      {v.criticalAlerts.length > 0 ? (
        <div className="mt-4 rounded-lg border border-rose-200/90 bg-rose-50/70 p-3 dark:border-rose-900/40 dark:bg-rose-950/25">
          <p className="text-xs font-semibold uppercase text-rose-900 dark:text-rose-200">
            Alertas críticos (bloqueiam a geração)
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-rose-950 dark:text-rose-100">
            {v.criticalAlerts.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-emerald-800 dark:text-emerald-200/90">
          Nenhum bloqueio crítico pendente para os itens selecionados.
        </p>
      )}

      <p className="mt-3 text-xs text-ds-muted">
        Tolerância de fechamento com o PDF: ±5% em relação ao total detectado (quando existir).
      </p>
    </Card>
  )
}
