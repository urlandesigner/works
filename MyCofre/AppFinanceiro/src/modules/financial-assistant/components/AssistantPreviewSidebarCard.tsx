import { clsx } from 'clsx'
import { Card } from '../../../components/ui/Card'
import type { TransactionDraft } from '../types'
import { formatPreviewSummaryLine } from '../utils/previewFormatting'

interface AssistantPreviewSidebarCardProps {
  draft: TransactionDraft | null
  /** Lista compacta para bottom sheet. */
  compact?: boolean
}

export function AssistantPreviewSidebarCard({
  draft,
  compact = false,
}: AssistantPreviewSidebarCardProps) {
  return (
    <Card className={compact ? 'py-3' : undefined}>
      <h3
        className={
          compact
            ? 'text-xs font-semibold text-slate-900 dark:text-slate-100'
            : 'text-sm font-semibold text-slate-900 dark:text-slate-100'
        }
      >
        Prévia de lançamento
      </h3>
      {draft ? (
        <>
          <p className="mt-1 text-xs text-ds-muted">
            Esse lançamento ainda não foi salvo no app.
          </p>
          <p
            className={clsx(
              'mt-2 font-medium tabular-nums text-slate-800 dark:text-slate-200',
              compact ? 'text-xs' : 'text-sm'
            )}
          >
            {formatPreviewSummaryLine(draft)}
          </p>
          <p className="mt-2 text-xs text-ds-muted">
            Use <span className="font-medium text-slate-700 dark:text-slate-300">Confirmar lançamento</span>{' '}
            no card da conversa para gravar em Transações e na visão geral.
          </p>
        </>
      ) : (
        <p className="mt-1 text-xs text-ds-muted">
          Envie uma mensagem na conversa para gerar uma prévia. Só depois de confirmar o lançamento
          entra no app.
        </p>
      )}
    </Card>
  )
}
