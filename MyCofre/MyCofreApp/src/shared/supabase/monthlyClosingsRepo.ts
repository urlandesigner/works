import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  MonthlyClosing,
  MonthlyClosingAccount,
  MonthlyClosingInvestment,
  MonthlyClosingWithDetails,
} from '../types/monthly-closing'

type Numeric = number | string

function parseNum(v: Numeric | null | undefined): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = Number.parseFloat(v)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

export type MonthlyClosingRow = {
  id: string
  user_id: string
  year: number
  month: number
  closed_at: string | null
  created_at?: string | null
  total_accounts: Numeric
  total_investments: Numeric
  patrimony_total: Numeric
  month_income: Numeric
  month_expenses: Numeric
  month_balance: Numeric
  notes: string | null
}

export type MonthlyClosingAccountRow = {
  id: string
  closing_id: string
  user_id: string
  account_id: string | null
  account_name: string
  account_type: string | null
  institution: string | null
  balance: Numeric
  created_at: string
}

export type MonthlyClosingInvestmentRow = {
  id: string
  closing_id: string
  user_id: string
  investment_id: string | null
  investment_name: string
  investment_type: string | null
  institution: string | null
  invested_amount: Numeric
  current_amount: Numeric
  created_at: string
}

function mapRowToClosing(row: MonthlyClosingRow): MonthlyClosing {
  return {
    id: row.id,
    user_id: row.user_id,
    year: row.year,
    month: row.month,
    closed_at: row.closed_at ?? null,
    created_at: row.created_at ?? null,
    total_accounts: parseNum(row.total_accounts),
    total_investments: parseNum(row.total_investments),
    patrimony_total: parseNum(row.patrimony_total),
    month_income: parseNum(row.month_income),
    month_expenses: parseNum(row.month_expenses),
    month_balance: parseNum(row.month_balance),
    notes: row.notes ?? null,
  }
}

function mapRowToAccount(row: MonthlyClosingAccountRow): MonthlyClosingAccount {
  return {
    id: row.id,
    closing_id: row.closing_id,
    user_id: row.user_id,
    account_id: row.account_id ?? null,
    account_name: row.account_name,
    account_type: row.account_type ?? null,
    institution: row.institution ?? null,
    balance: parseNum(row.balance),
    created_at: row.created_at,
  }
}

function mapRowToInvestment(row: MonthlyClosingInvestmentRow): MonthlyClosingInvestment {
  return {
    id: row.id,
    closing_id: row.closing_id,
    user_id: row.user_id,
    investment_id: row.investment_id ?? null,
    investment_name: row.investment_name,
    investment_type: row.investment_type ?? null,
    institution: row.institution ?? null,
    invested_amount: parseNum(row.invested_amount),
    current_amount: parseNum(row.current_amount),
    created_at: row.created_at,
  }
}

type ClosingRowWithNested = MonthlyClosingRow & {
  monthly_closing_accounts?: MonthlyClosingAccountRow[] | null
  monthly_closing_investments?: MonthlyClosingInvestmentRow[] | null
}

function mapClosingRowToWithDetails(row: ClosingRowWithNested): MonthlyClosingWithDetails {
  return {
    ...mapRowToClosing(row),
    monthly_closing_accounts: (row.monthly_closing_accounts ?? []).map(mapRowToAccount),
    monthly_closing_investments: (row.monthly_closing_investments ?? []).map(mapRowToInvestment),
  }
}

export async function fetchMonthlyClosingForUser(
  client: SupabaseClient,
  userId: string,
  year: number,
  month: number
): Promise<{ data: MonthlyClosingWithDetails | null; error: Error | null }> {
  const { data, error } = await client
    .from('monthly_closings')
    .select('*, monthly_closing_accounts(*), monthly_closing_investments(*)')
    .eq('user_id', userId)
    .eq('year', year)
    .eq('month', month)
    .maybeSingle()

  if (error) return { data: null, error: new Error(error.message) }
  if (!data) return { data: null, error: null }

  return {
    data: mapClosingRowToWithDetails(data as ClosingRowWithNested),
    error: null,
  }
}

/**
 * Último fechamento salvo do usuário (maior ano, depois maior mês).
 * Mesmo formato de `fetchMonthlyClosingForUser`, para uso no patrimônio (Home/Wealth).
 */
export async function fetchLatestMonthlyClosingWithDetailsForUser(
  client: SupabaseClient,
  userId: string
): Promise<{ data: MonthlyClosingWithDetails | null; error: Error | null }> {
  const { data, error } = await client
    .from('monthly_closings')
    .select('*, monthly_closing_accounts(*), monthly_closing_investments(*)')
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return { data: null, error: new Error(error.message) }
  if (!data) return { data: null, error: null }

  return {
    data: mapClosingRowToWithDetails(data as ClosingRowWithNested),
    error: null,
  }
}

/**
 * Para cada `investment_id`, retorna o `current_amount` do fechamento mais recente
 * (maior ano/mês). Linhas sem `investment_id` são ignoradas.
 */
export async function fetchLatestClosingCurrentByInvestmentId(
  client: SupabaseClient,
  userId: string
): Promise<{ data: Map<string, number>; error: Error | null }> {
  const { data: closings, error: closingsErr } = await client
    .from('monthly_closings')
    .select('id')
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (closingsErr) {
    return { data: new Map(), error: new Error(closingsErr.message) }
  }
  if (!closings?.length) {
    return { data: new Map(), error: null }
  }

  const closingIds = closings.map((c) => c.id as string)
  const closingIndex = new Map(closingIds.map((id, i) => [id, i]))

  const { data: rows, error: rowsErr } = await client
    .from('monthly_closing_investments')
    .select('investment_id, current_amount, closing_id')
    .eq('user_id', userId)
    .not('investment_id', 'is', null)
    .in('closing_id', closingIds)

  if (rowsErr) {
    return { data: new Map(), error: new Error(rowsErr.message) }
  }

  const best = new Map<string, { idx: number; current: number }>()
  for (const row of rows ?? []) {
    const invId = row.investment_id as string | null
    if (!invId) continue
    const cid = row.closing_id as string
    const idx = closingIndex.get(cid)
    if (idx === undefined) continue
    const current = parseNum(row.current_amount as Numeric)
    const prev = best.get(invId)
    if (!prev || idx < prev.idx) {
      best.set(invId, { idx, current })
    }
  }

  const out = new Map<string, number>()
  for (const [id, v] of best) {
    out.set(id, v.current)
  }
  return { data: out, error: null }
}

export async function fetchMonthlyClosingsListForUser(
  client: SupabaseClient,
  userId: string
): Promise<{ data: MonthlyClosing[]; error: Error | null }> {
  const { data, error } = await client
    .from('monthly_closings')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) return { data: [], error: new Error(error.message) }
  return { data: (data as MonthlyClosingRow[]).map(mapRowToClosing), error: null }
}

export async function createMonthlyClosing(
  client: SupabaseClient,
  userId: string,
  payload: Omit<MonthlyClosing, 'id' | 'user_id' | 'closed_at'> & {
    accounts: Array<
      Pick<
        MonthlyClosingAccount,
        'account_id' | 'account_name' | 'account_type' | 'institution' | 'balance'
      >
    >
    investments: Array<
      Pick<
        MonthlyClosingInvestment,
        | 'investment_id'
        | 'investment_name'
        | 'investment_type'
        | 'institution'
        | 'invested_amount'
        | 'current_amount'
      >
    >
  }
): Promise<{ data: MonthlyClosingWithDetails | null; error: Error | null }> {
  const { accounts, investments, ...closing } = payload

  const { data: inserted, error } = await client
    .from('monthly_closings')
    .insert({
      user_id: userId,
      year: closing.year,
      month: closing.month,
      closed_at: new Date().toISOString(),
      total_accounts: closing.total_accounts,
      total_investments: closing.total_investments,
      patrimony_total: closing.patrimony_total,
      month_income: closing.month_income,
      month_expenses: closing.month_expenses,
      month_balance: closing.month_balance,
      notes: closing.notes ?? null,
    })
    .select()
    .single()

  if (error) return { data: null, error: new Error(error.message) }

  const insertedClosing = mapRowToClosing(inserted as MonthlyClosingRow)
  const closingId = insertedClosing.id

  const { error: accErr } =
    accounts.length > 0
      ? await client.from('monthly_closing_accounts').insert(
          accounts.map((a) => ({
            closing_id: closingId,
            user_id: userId,
            account_id: a.account_id,
            account_name: a.account_name,
            account_type: a.account_type ?? null,
            institution: a.institution ?? null,
            balance: a.balance,
          }))
        )
      : { error: null as unknown }

  if ((accErr as { message?: string } | null)?.message) {
    await client.from('monthly_closings').delete().eq('id', closingId).eq('user_id', userId)
    return { data: null, error: new Error((accErr as { message: string }).message) }
  }

  const { error: invErr } =
    investments.length > 0
      ? await client.from('monthly_closing_investments').insert(
          investments.map((i) => ({
            closing_id: closingId,
            user_id: userId,
            investment_id: i.investment_id,
            investment_name: i.investment_name,
            investment_type: i.investment_type ?? null,
            institution: i.institution ?? null,
            invested_amount: i.invested_amount,
            current_amount: i.current_amount,
          }))
        )
      : { error: null as unknown }

  if ((invErr as { message?: string } | null)?.message) {
    await client.from('monthly_closings').delete().eq('id', closingId).eq('user_id', userId)
    return { data: null, error: new Error((invErr as { message: string }).message) }
  }

  const { data: full, error: fetchErr } = await fetchMonthlyClosingForUser(client, userId, closing.year, closing.month)
  if (fetchErr) return { data: null, error: fetchErr }
  return { data: full, error: null }
}

export async function deleteMonthlyClosingByPeriod(
  client: SupabaseClient,
  userId: string,
  year: number,
  month: number
): Promise<{ error: Error | null }> {
  const { error } = await client
    .from('monthly_closings')
    .delete()
    .eq('user_id', userId)
    .eq('year', year)
    .eq('month', month)

  if (error) return { error: new Error(error.message) }
  return { error: null }
}

