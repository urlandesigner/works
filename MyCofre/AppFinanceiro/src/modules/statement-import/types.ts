export type StatementImportStatus =
  | 'processing'
  | 'parsed'
  | 'partial'
  | 'parse_error'
  | 'confirmed'

export type StatementImportReviewStatus =
  | 'pending'
  | 'needs_review'
  | 'ignored'
  | 'confirmed'

/** Classificação da linha importada (needs_review = ambíguo, revisar manualmente). */
export type StatementImportTransactionType = 'income' | 'expense' | 'needs_review'

export interface StatementImportItemDraft {
  transactionDate: string
  description: string
  amount: number
  type: StatementImportTransactionType
  suggestedCategory: string | null
  isSelected: boolean
  reviewStatus: StatementImportReviewStatus
  duplicateHint: boolean
  duplicateReason: string | null
}

export interface StatementImportItem extends StatementImportItemDraft {
  id: string
  importId: string
  createdAt: string
}

export interface StatementImport {
  id: string
  userId: string
  fileName: string
  bankName: 'itau'
  fileType: 'pdf'
  rawText: string
  parsingStatus: StatementImportStatus
  createdAt: string
}
