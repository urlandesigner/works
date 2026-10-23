import { suggestCategoryByDescription } from '../services/categorySuggestion'
import type { StatementImportItemDraft } from '../types'
import { isNonTransactionLine } from './balanceLineDetection'
import { inferTransactionType } from './transactionTypeInference'

const DATE_TOKEN = '(\\d{2}\\/\\d{2}(?:\\/\\d{2,4})?)'
const AMOUNT_TOKEN = '(-?\\s*\\+?\\s*\\d{1,3}(?:\\.\\d{3})*,\\d{2})'

const ITAU_LINE_REGEX = new RegExp(
  `(?:^|\\s)${DATE_TOKEN}\\s+(.+?)\\s+${AMOUNT_TOKEN}(?:\\s|$)`,
  'g'
)

function parseDate(value: string): string {
  const [day, month, yearRaw] = value.split('/')
  const year = yearRaw
    ? yearRaw.length === 2
      ? `20${yearRaw}`
      : yearRaw
    : String(new Date().getFullYear())
  return `${year}-${month}-${day}`
}

function parseAmount(value: string): number {
  const normalized = value.replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? Math.abs(parsed) : 0
}

function normalizeDescription(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function signedAmount(
  type: StatementImportItemDraft['type'],
  absoluteAmount: number
): number {
  if (absoluteAmount <= 0) return 0
  if (type === 'expense') return -absoluteAmount
  if (type === 'income') return absoluteAmount
  return absoluteAmount
}

export function parseItauStatementText(rawText: string): StatementImportItemDraft[] {
  const items: StatementImportItemDraft[] = []
  const matches = rawText.matchAll(ITAU_LINE_REGEX)

  for (const match of matches) {
    const [, dateToken, descriptionToken, amountToken] = match
    if (!dateToken || !descriptionToken || !amountToken) continue

    const description = normalizeDescription(descriptionToken)
    if (!description) continue

    if (isNonTransactionLine(description)) continue

    const absoluteAmount = parseAmount(amountToken)
    if (absoluteAmount <= 0) continue

    const type = inferTransactionType(description, amountToken)
    const amount = signedAmount(type, absoluteAmount)

    const reviewStatus =
      type === 'needs_review' ? ('needs_review' as const) : ('pending' as const)

    items.push({
      transactionDate: parseDate(dateToken),
      description,
      amount,
      type,
      suggestedCategory: suggestCategoryByDescription(description),
      isSelected: true,
      reviewStatus,
      duplicateHint: false,
      duplicateReason: null,
    })
  }

  return items
}
