import type { PdfTextExtractionDebug } from '../statement-import/services/pdfTextExtractor'

export type { PdfTextExtractionDebug }

export type InvoiceItemReviewStatus =
  | 'pending'
  | 'needs_review'
  | 'ignored'
  | 'confirmed'

export type InvoiceConfidenceLevel = 'high' | 'medium' | 'low'

export interface InvoiceItem {
  id: string
  date: string
  description: string
  amount: number
  installments: string | null
  suggestedCategory: string | null
  selected: boolean
  reviewStatus: InvoiceItemReviewStatus
  /** Parser reconheceu a linha na seção correta e a soma bateu com o total de referência. */
  parserTrusted?: boolean
  /** Confiança heurística do parser (modo local). */
  confidenceScore?: number
  confidenceLevel?: InvoiceConfidenceLevel
  confidenceReasons?: string[]
  /** Linha original tinha mais de um valor monetário (revisar valor). */
  hadMultipleMoneyValues?: boolean
  /** Usuário confirmou revisão manual (obrigatório para confiança média/baixa). */
  reviewConfirmedByUser?: boolean
}

export interface InvoiceReconciliationDebug {
  referenceTotal: number | null
  sumAccepted: number
  sumDiscardedMonetary: number
  diffToReference: number | null
  percentDiff: number | null
  acceptedValues: number[]
  discardedWithMoney: Array<{
    raw: string
    normalized: string
    lastAmount: number
    reason?: string
  }>
  sumAcceptedPlusDiscarded: number
  coverage: 'complete' | 'partial' | 'unknown'
}

/** Debug temporário do parser (local) — candidatos, rejeições e totais detectados. */
export interface InvoiceParseDebug {
  linesScanned: number
  acceptedCount: number
  totalDetected: number | null
  totalLancamentosAtuais: number | null
  lines: Array<{
    raw: string
    normalized: string
    outcome: 'accepted' | 'rejected'
    reason?: string
    /** Valor numérico quando aceito. */
    extractedAmount?: number
    /** Mais de um valor monetário na linha (após truncar resumo). */
    hadMultipleMoneyValues?: boolean
    /** Aceito na segunda passagem (filtro relaxado). */
    recoveredFromFallback?: boolean
    confidenceScore?: number
    confidenceLevel?: InvoiceConfidenceLevel
    confidenceReasons?: string[]
  }>
  /** Reconciliação soma vs total + linhas descartadas com valor. */
  reconciliation?: InvoiceReconciliationDebug
}

export interface InvoiceDraft {
  id: string
  fileName: string
  rawText: string
  createdAt: string
  issuer: string | null
  cardName: string | null
  referenceMonth: string | null
  dueDate: string | null
  /** Valor total informado no PDF (quando detectado). */
  totalAmount: number | null
  /** Total "lançamentos atuais" no PDF, quando existir (validação da lista principal). */
  totalLancamentosAtuais?: number | null
  /** Mensagem quando a seção não foi encontrada ou a soma diverge do total. */
  parseHint?: string | null
  /** Qualidade do parse após validar soma vs total de referência. */
  parseQuality?: 'high' | 'low' | 'unknown'
  /** Detalhes do último parse (para ajuste fino). */
  parseDebug?: InvoiceParseDebug | null
  /** Estatísticas da leitura do PDF (itens pdf.js + linhas reconstruídas). */
  pdfExtractionDebug?: PdfTextExtractionDebug | null
  items: InvoiceItem[]
}

/** Resultado do parser antes de atribuir ids. */
export interface ParsedInvoiceLine {
  date: string
  description: string
  amount: number
  installments: string | null
  suggestedCategory: string | null
  reviewStatus: InvoiceItemReviewStatus
  confidenceScore: number
  confidenceLevel: InvoiceConfidenceLevel
  confidenceReasons: string[]
  hadMultipleMoneyValues: boolean
}
