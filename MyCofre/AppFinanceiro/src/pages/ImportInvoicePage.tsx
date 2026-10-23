import { useEffect, useMemo, useState } from 'react'
import { CreditCard, Receipt, ShieldCheck } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { useToast } from '../contexts/ToastContext'
import { InvoiceAssistedValidationPanel } from '../modules/invoice-import/components/InvoiceAssistedValidationPanel'
import { InvoiceImportUploader } from '../modules/invoice-import/components/InvoiceImportUploader'
import { InvoiceParseDebugPanel } from '../modules/invoice-import/components/InvoiceParseDebugPanel'
import { InvoiceReviewTable } from '../modules/invoice-import/components/InvoiceReviewTable'
import { InvoiceSummaryCards } from '../modules/invoice-import/components/InvoiceSummaryCards'
import { computeInvoiceAssistedValidation } from '../modules/invoice-import/invoiceAssistedValidation'
import {
  clearInvoiceDraft,
  loadInvoiceDraft,
  saveConsolidatedEntry,
  saveInvoiceDraft,
  type ConsolidatedInvoiceEntry,
} from '../modules/invoice-import/local/repo'
import { parseGenericInvoicePdfText } from '../modules/invoice-import/parser/genericInvoicePdfParser'
import { extractTextFromPdf } from '../modules/invoice-import/services/pdfTextExtractor'
import type { InvoiceDraft, InvoiceItem } from '../modules/invoice-import/types'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function ImportInvoicePage() {
  const { setTitle, setActions } = useHeaderActions()
  const { success, error, info } = useToast()
  const [processing, setProcessing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [draft, setDraft] = useState<InvoiceDraft | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [lastConsolidated, setLastConsolidated] =
    useState<ConsolidatedInvoiceEntry | null>(null)

  useEffect(() => {
    setTitle('Importar fatura', 'PDF de cartao — modo local')
    return () => setTitle('', null)
  }, [setTitle])

  useEffect(() => {
    setActions(null)
    return () => setActions(null)
  }, [setActions])

  useEffect(() => {
    const saved = loadInvoiceDraft()
    if (!saved) return
    setDraft(saved)
    setItems(saved.items)
  }, [])

  function persist(nextDraft: InvoiceDraft, nextItems: InvoiceItem[]) {
    const full: InvoiceDraft = { ...nextDraft, items: nextItems }
    setDraft(full)
    setItems(nextItems)
    saveInvoiceDraft(full)
  }

  const handleUpload = async (file: File) => {
    setProcessing(true)
    try {
      const { text: rawText, debug: pdfExtractionDebug } = await extractTextFromPdf(file)
      const { draft: parsed } = parseGenericInvoicePdfText(file.name, rawText)
      const fullDraft: InvoiceDraft = {
        id: parsed.id,
        fileName: parsed.fileName,
        rawText: parsed.rawText,
        createdAt: parsed.createdAt,
        issuer: parsed.issuer,
        cardName: parsed.cardName,
        referenceMonth: parsed.referenceMonth,
        dueDate: parsed.dueDate,
        totalAmount: parsed.totalAmount,
        totalLancamentosAtuais: parsed.totalLancamentosAtuais,
        parseHint: parsed.parseHint,
        parseQuality: parsed.parseQuality,
        parseDebug: parsed.parseDebug,
        pdfExtractionDebug,
        items: parsed.items,
      }
      persist(fullDraft, parsed.items)
      success(
        `${parsed.items.length} lançamento(s) sugerido(s). Revise a tabela e a validação antes de consolidar.`
      )
    } catch (e) {
      error(e instanceof Error ? e.message : 'Falha ao processar PDF.')
    } finally {
      setProcessing(false)
    }
  }

  const handleItemsChange = (nextItems: InvoiceItem[]) => {
    if (!draft) {
      setItems(nextItems)
      return
    }
    persist(draft, nextItems)
  }

  const handleClearDraft = () => {
    clearInvoiceDraft()
    setDraft(null)
    setItems([])
    success('Rascunho da fatura removido.')
  }

  const assistedValidation = useMemo(
    () =>
      draft && items.length > 0
        ? computeInvoiceAssistedValidation(draft, items)
        : null,
    [draft, items]
  )

  const handleGenerateConsolidated = () => {
    if (!draft) return
    const validation = computeInvoiceAssistedValidation(draft, items)
    if (!validation.canGenerate) {
      info('Resolva os alertas de validação e confirme a revisão antes de gerar o consolidado.')
      return
    }
    const selected = items.filter(
      (i) => i.selected && i.reviewStatus !== 'ignored'
    )
    if (selected.length === 0) {
      info('Selecione pelo menos um lancamento.')
      return
    }

    setGenerating(true)
    try {
      const totalSelected = selected.reduce((s, i) => s + i.amount, 0)
      const entry: ConsolidatedInvoiceEntry = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        draftId: draft.id,
        fileName: draft.fileName,
        referenceMonth: draft.referenceMonth,
        dueDate: draft.dueDate,
        totalSelected,
        itemCount: selected.length,
        lines: selected.map((i) => ({
          date: i.date,
          description: i.description,
          amount: i.amount,
        })),
      }
      saveConsolidatedEntry(entry)
      setLastConsolidated(entry)

      const nextItems = items.map((i) =>
        selected.some((s) => s.id === i.id)
          ? { ...i, reviewStatus: 'confirmed' as const, selected: false }
          : i
      )
      persist(draft, nextItems)

      success(
        `Lancamento local consolidado: ${BRL.format(totalSelected)} em ${selected.length} item(ns). Salvo apenas no navegador.`
      )
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-violet-50 p-2 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
            <Receipt className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h2 className="card-block-heading mb-0">Fatura de cartao (modo local)</h2>
            <p className="card-prose">
              Importação assistida: o PDF é lido e os lançamentos são sugeridos. A consolidação
              só ocorre depois que você revisar e a validação abaixo estiver liberada — tudo
              permanece apenas neste navegador.
            </p>
            <p className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4" />
              Dados nao saem deste navegador.
            </p>
          </div>
        </div>
      </Card>

      <InvoiceImportUploader processing={processing} onSelectFile={handleUpload} />

      {draft ? (
        <Card>
          <h2 className="card-block-heading mb-3">Dados detectados no PDF</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-ds-muted">Emissor / bandeira</dt>
              <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                {draft.issuer ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-ds-muted">Cartao</dt>
              <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                {draft.cardName ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-ds-muted">Referencia</dt>
              <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                {draft.referenceMonth ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-ds-muted">Vencimento</dt>
              <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                {draft.dueDate ?? '—'}
              </dd>
            </div>
            {draft.totalLancamentosAtuais != null && draft.totalLancamentosAtuais > 0 ? (
              <div>
                <dt className="text-xs font-medium uppercase text-ds-muted">
                  Total lancamentos atuais (PDF)
                </dt>
                <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                  {BRL.format(draft.totalLancamentosAtuais)}
                </dd>
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase text-ds-muted">Arquivo</dt>
              <dd className="mt-0.5 text-slate-700 dark:text-slate-300">{draft.fileName}</dd>
            </div>
          </dl>
        </Card>
      ) : null}

      <InvoiceSummaryCards draft={draft} items={items} />

      {assistedValidation ? (
        <InvoiceAssistedValidationPanel validation={assistedValidation} />
      ) : null}

      {import.meta.env.DEV ? (
        <InvoiceParseDebugPanel
          debug={draft?.parseDebug}
          pdfExtraction={draft?.pdfExtractionDebug}
        />
      ) : null}

      <InvoiceReviewTable items={items} onChange={handleItemsChange} />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          loading={generating}
          disabled={
            !draft ||
            items.length === 0 ||
            processing ||
            !assistedValidation?.canGenerate
          }
          onClick={handleGenerateConsolidated}
        >
          <CreditCard className="h-4 w-4" />
          Gerar lançamento consolidado
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={processing || generating || (!draft && items.length === 0)}
          onClick={handleClearDraft}
        >
          Limpar rascunho
        </Button>
      </div>

      {lastConsolidated ? (
        <Card>
          <h3 className="card-block-heading mb-2">Ultimo consolidado (local)</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Total: {BRL.format(lastConsolidated.totalSelected)} — {lastConsolidated.itemCount}{' '}
            item(ns). Id: {lastConsolidated.id.slice(0, 8)}…
          </p>
        </Card>
      ) : null}
    </div>
  )
}
