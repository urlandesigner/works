import { useEffect, useState } from 'react'
import { FileText, ShieldCheck } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { useToast } from '../contexts/ToastContext'
import { parseItauStatementText } from '../modules/statement-import/parser/itauPdfParser'
import { StatementImportSummary } from '../modules/statement-import/components/StatementImportSummary'
import { StatementImportUploader } from '../modules/statement-import/components/StatementImportUploader'
import { StatementImportReviewTable } from '../modules/statement-import/components/StatementImportReviewTable'
import { extractTextFromPdf } from '../modules/statement-import/services/pdfTextExtractor'
import { detectDuplicate } from '../modules/statement-import/services/duplicateDetection'
import {
  clearLocalDraft,
  createLocalDraft,
  loadLocalDraft,
  saveLocalDraft,
} from '../modules/statement-import/local/repo'
import type { StatementImportItem } from '../modules/statement-import/types'

export function ImportStatementPage() {
  const { setTitle, setActions } = useHeaderActions()
  const { success, error, info } = useToast()
  const [processing, setProcessing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [importId, setImportId] = useState<string | null>(null)
  const [items, setItems] = useState<StatementImportItem[]>([])

  useEffect(() => {
    setTitle('Importar extrato', 'Upload de PDF com revisao manual')
    return () => setTitle('', null)
  }, [setTitle])

  useEffect(() => {
    setActions(null)
    return () => setActions(null)
  }, [setActions])

  useEffect(() => {
    const draft = loadLocalDraft()
    if (!draft) return
    setImportId(draft.id)
    setItems(
      draft.items.map((item) => ({
        id: crypto.randomUUID(),
        importId: draft.id,
        createdAt: draft.createdAt,
        ...item,
      }))
    )
  }, [])

  function applyInternalDuplicateHints(nextItems: StatementImportItem[]): StatementImportItem[] {
    return nextItems.map((item, index) => {
      const previous = nextItems
        .slice(0, index)
        .map((candidate) => ({
          transaction_date: candidate.transactionDate,
          amount: candidate.amount,
          description: candidate.description,
        }))
      const duplicate = detectDuplicate(item, previous)
      return {
        ...item,
        duplicateHint: duplicate.duplicate,
        duplicateReason: duplicate.reason,
        reviewStatus:
          duplicate.duplicate && item.reviewStatus !== 'ignored'
            ? 'needs_review'
            : item.reviewStatus,
      }
    })
  }

  function persistDraft(nextImportId: string, nextItems: StatementImportItem[]) {
    const draft = createLocalDraft(
      `import-${nextImportId}.pdf`,
      '',
      nextItems.map((item) => ({
        transactionDate: item.transactionDate,
        description: item.description,
        amount: item.amount,
        type: item.type,
        suggestedCategory: item.suggestedCategory,
        isSelected: item.isSelected,
        reviewStatus: item.reviewStatus,
        duplicateHint: item.duplicateHint,
        duplicateReason: item.duplicateReason,
      }))
    )
    saveLocalDraft({ ...draft, id: nextImportId })
  }

  const handleUpload = async (file: File) => {
    setProcessing(true)
    setItems([])
    try {
      const { text: rawText } = await extractTextFromPdf(file)
      const parsedDrafts = parseItauStatementText(rawText)
      const localImportId = crypto.randomUUID()
      setImportId(localImportId)

      const localItems = parsedDrafts.map((item) => ({
        id: crypto.randomUUID(),
        importId: localImportId,
        createdAt: new Date().toISOString(),
        ...item,
      }))
      const withDuplicateHints = applyInternalDuplicateHints(localItems)
      setItems(withDuplicateHints)
      saveLocalDraft(
        createLocalDraft(
          file.name,
          rawText,
          withDuplicateHints.map((item) => ({
            transactionDate: item.transactionDate,
            description: item.description,
            amount: item.amount,
            type: item.type,
            suggestedCategory: item.suggestedCategory,
            isSelected: item.isSelected,
            reviewStatus: item.reviewStatus,
            duplicateHint: item.duplicateHint,
            duplicateReason: item.duplicateReason,
          }))
        )
      )

      if (withDuplicateHints.length === 0) {
        info('Nenhuma linha foi reconhecida automaticamente. Revise o PDF e tente outro arquivo.')
      } else {
        success(`${withDuplicateHints.length} transacoes detectadas para revisao local.`)
      }
    } catch (err) {
      error(err instanceof Error ? err.message : 'Falha ao processar PDF.')
    } finally {
      setProcessing(false)
    }
  }

  const handleConfirm = async () => {
    if (!importId) return

    const selectedActive = items.filter(
      (item) => item.isSelected && item.reviewStatus !== 'ignored'
    )
    const hasUnresolvedType = selectedActive.some((item) => item.type === 'needs_review')
    if (hasUnresolvedType) {
      error('Classifique os itens em Revisar como Entrada ou Saida antes de confirmar.')
      return
    }

    setConfirming(true)
    try {
      const selected = selectedActive.length
      const nextItems: StatementImportItem[] = items.map((item) =>
        item.isSelected && item.reviewStatus !== 'ignored'
          ? { ...item, reviewStatus: 'confirmed' as const, isSelected: false }
          : item
      )
      setItems(nextItems)
      persistDraft(importId, nextItems)
      success(
        `${selected} transacoes revisadas com sucesso (modo local). Nenhum dado foi enviado ao banco.`
      )
    } finally {
      setConfirming(false)
    }
  }

  const selectedCount = items.filter(
    (item) => item.isSelected && item.reviewStatus !== 'ignored'
  ).length

  const hasBlockingNeedsReview = items.some(
    (item) =>
      item.isSelected &&
      item.reviewStatus !== 'ignored' &&
      item.type === 'needs_review'
  )

  const handleReviewChange = (nextItems: StatementImportItem[]) => {
    const updated = applyInternalDuplicateHints(nextItems)
    setItems(updated)
    if (importId) persistDraft(importId, updated)
  }

  const handleClearDraft = () => {
    clearLocalDraft()
    setImportId(null)
    setItems([])
    success('Rascunho local removido.')
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-brand-50 p-2 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300">
            <FileText className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h2 className="card-block-heading mb-0">Area isolada de importacao de extrato</h2>
            <p className="card-prose">
              Fluxo seguro local: upload, leitura do PDF, revisao manual e confirmacao final.
              Nenhuma linha e lancada automaticamente e nada e salvo no banco.
            </p>
            <p className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4" />
              Esta tela nao altera dashboard, saldos, patrimonio nem transacoes existentes.
            </p>
          </div>
        </div>
      </Card>

      <StatementImportUploader processing={processing} onSelectFile={handleUpload} />

      <StatementImportSummary items={items} />

      <StatementImportReviewTable items={items} onChange={handleReviewChange} />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          loading={confirming}
          disabled={selectedCount === 0 || processing || hasBlockingNeedsReview}
          onClick={() => void handleConfirm()}
        >
          Confirmar revisao local ({selectedCount})
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={processing || confirming || items.length === 0}
          onClick={handleClearDraft}
        >
          Limpar rascunho local
        </Button>
        <p className="text-xs text-ds-muted">
          Rascunho salvo localmente. Sem `statement_imports`, `statement_import_items` ou insert
          em `transactions`.
        </p>
      </div>
    </div>
  )
}
