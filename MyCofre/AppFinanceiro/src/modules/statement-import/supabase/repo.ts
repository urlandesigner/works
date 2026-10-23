import type { SupabaseClient } from '@supabase/supabase-js'
import type { Category } from '../../../types/category'
import type {
  StatementImport,
  StatementImportItem,
  StatementImportItemDraft,
  StatementImportStatus,
  StatementImportTransactionType,
} from '../types'

type StatementImportRow = {
  id: string
  user_id: string
  file_name: string
  bank_name: 'itau'
  file_type: 'pdf'
  raw_text: string
  parsing_status: StatementImportStatus
  created_at: string
}

type StatementImportItemRow = {
  id: string
  import_id: string
  transaction_date: string | null
  description: string
  amount: number | string
  type: StatementImportTransactionType
  suggested_category: string | null
  is_selected: boolean
  review_status: StatementImportItem['reviewStatus']
  duplicate_hint: boolean
  duplicate_reason: string | null
  created_at: string
}

type ExistingTransactionProbe = {
  transaction_date: string
  amount: number
  description: string | null
}

function parseAmount(value: number | string): number {
  if (typeof value === 'number') return value
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function mapImport(row: StatementImportRow): StatementImport {
  return {
    id: row.id,
    userId: row.user_id,
    fileName: row.file_name,
    bankName: row.bank_name,
    fileType: row.file_type,
    rawText: row.raw_text,
    parsingStatus: row.parsing_status,
    createdAt: row.created_at,
  }
}

function mapImportItem(row: StatementImportItemRow): StatementImportItem {
  return {
    id: row.id,
    importId: row.import_id,
    transactionDate: row.transaction_date ?? '',
    description: row.description,
    amount: parseAmount(row.amount),
    type: row.type,
    suggestedCategory: row.suggested_category,
    isSelected: row.is_selected,
    reviewStatus: row.review_status,
    duplicateHint: row.duplicate_hint,
    duplicateReason: row.duplicate_reason,
    createdAt: row.created_at,
  }
}

export async function createStatementImport(
  client: SupabaseClient,
  userId: string,
  payload: {
    fileName: string
    rawText: string
    status: StatementImportStatus
  }
): Promise<{ data: StatementImport | null; error: Error | null }> {
  const { data, error } = await client
    .from('statement_imports')
    .insert({
      user_id: userId,
      file_name: payload.fileName,
      bank_name: 'itau',
      file_type: 'pdf',
      raw_text: payload.rawText,
      parsing_status: payload.status,
    })
    .select('*')
    .single()

  if (error) return { data: null, error: new Error(error.message) }
  return { data: mapImport(data as StatementImportRow), error: null }
}

export async function replaceStatementImportItems(
  client: SupabaseClient,
  importId: string,
  items: StatementImportItemDraft[]
): Promise<{ data: StatementImportItem[]; error: Error | null }> {
  await client.from('statement_import_items').delete().eq('import_id', importId)
  if (items.length === 0) return { data: [], error: null }

  const payload = items.map((item) => ({
    import_id: importId,
    transaction_date: item.transactionDate || null,
    description: item.description,
    amount: item.amount,
    type: item.type,
    suggested_category: item.suggestedCategory,
    is_selected: item.isSelected,
    review_status: item.reviewStatus,
    duplicate_hint: item.duplicateHint,
    duplicate_reason: item.duplicateReason,
  }))

  const { data, error } = await client
    .from('statement_import_items')
    .insert(payload)
    .select('*')

  if (error) return { data: [], error: new Error(error.message) }
  return { data: (data as StatementImportItemRow[]).map(mapImportItem), error: null }
}

export async function updateStatementImportItems(
  client: SupabaseClient,
  items: StatementImportItem[]
): Promise<{ error: Error | null }> {
  for (const item of items) {
    const { error } = await client
      .from('statement_import_items')
      .update({
        transaction_date: item.transactionDate || null,
        description: item.description,
        amount: item.amount,
        type: item.type,
        suggested_category: item.suggestedCategory,
        is_selected: item.isSelected,
        review_status: item.reviewStatus,
        duplicate_hint: item.duplicateHint,
        duplicate_reason: item.duplicateReason,
      })
      .eq('id', item.id)
    if (error) return { error: new Error(error.message) }
  }
  return { error: null }
}

export async function probePotentialDuplicates(
  client: SupabaseClient,
  userId: string,
  minDate: string,
  maxDate: string
): Promise<{ data: ExistingTransactionProbe[]; error: Error | null }> {
  const { data, error } = await client
    .from('transactions')
    .select('date, amount, description')
    .eq('user_id', userId)
    .gte('date', minDate)
    .lte('date', maxDate)
    .limit(500)

  if (error) return { data: [], error: new Error(error.message) }

  const mapped = (data as { date: string; amount: number | string; description: string | null }[]).map(
    (row) => ({
      transaction_date: row.date,
      amount: parseAmount(row.amount),
      description: row.description,
    })
  )
  return { data: mapped, error: null }
}

function resolveCategoryId(
  categories: Category[],
  type: Extract<StatementImportTransactionType, 'income' | 'expense'>,
  suggestedName: string | null
): string | null {
  const typedCategories = categories.filter((category) => category.type === type)
  if (typedCategories.length === 0) return null
  if (!suggestedName) return typedCategories[0].id

  const byName = typedCategories.find(
    (category) => category.name.toLowerCase() === suggestedName.toLowerCase()
  )
  return byName?.id ?? typedCategories[0].id
}

export async function confirmStatementImportItems(
  client: SupabaseClient,
  params: {
    userId: string
    importId: string
    items: StatementImportItem[]
    categories: Category[]
  }
): Promise<{ inserted: number; error: Error | null }> {
  const toInsert = params.items.filter(
    (item) =>
      item.isSelected &&
      item.reviewStatus !== 'ignored' &&
      item.type !== 'needs_review' &&
      Boolean(item.transactionDate) &&
      item.amount !== 0
  )

  if (toInsert.length === 0) return { inserted: 0, error: null }

  const rows: Record<string, unknown>[] = []
  for (const item of toInsert) {
    if (item.type !== 'income' && item.type !== 'expense') continue
    const categoryId = resolveCategoryId(
      params.categories,
      item.type,
      item.suggestedCategory
    )
    if (!categoryId) {
      return {
        inserted: 0,
        error: new Error(
          `Sem categoria cadastrada para o tipo ${item.type === 'income' ? 'receita' : 'despesa'}.`
        ),
      }
    }
    rows.push({
      user_id: params.userId,
      account_id: null,
      category_id: categoryId,
      type: item.type,
      description: item.description,
      amount: Math.abs(item.amount),
      date: item.transactionDate,
      notes: 'Importado de extrato PDF (revisado manualmente).',
      recurrence: 'none',
      source: 'statement_import',
      source_bank: 'itau_pdf',
      import_batch_id: params.importId,
    })
  }

  const { error } = await client.from('transactions').insert(rows)
  if (error) return { inserted: 0, error: new Error(error.message) }

  const selectedIds = toInsert.map((item) => item.id)
  if (selectedIds.length > 0) {
    await client
      .from('statement_import_items')
      .update({ review_status: 'confirmed', is_selected: false })
      .in('id', selectedIds)
  }

  await client
    .from('statement_imports')
    .update({ parsing_status: 'confirmed' })
    .eq('id', params.importId)

  return { inserted: rows.length, error: null }
}
