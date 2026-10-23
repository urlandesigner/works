import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { SegmentedTabList, type SegmentedTabItem } from '../components/ui/SegmentedTabList'
import { MonthlyEvolutionChart } from '../components/reports/MonthlyEvolutionChart'
import { MonthlyInsights } from '../components/reports/MonthlyInsights'
import { computeMonthlyInsights } from '../lib/reports/monthlyInsights'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useValuesVisibility } from '../contexts/ValuesVisibilityContext'
import { useTransactions } from '../contexts/TransactionsContext'
import { useCreditCards } from '../contexts/CreditCardsContext'
import { useAccounts } from '../contexts/AccountsContext'
import { useInvestments } from '../contexts/InvestmentsContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { useCategories } from '../contexts/CategoriesContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { getSupabaseBrowserClient } from '../lib/supabase/client'
import { MONTH_LABELS, transactionMatchesCalendarMonthView } from '../lib/calendar'
import {
  formatDate,
  getAccountBalance,
  getOutstandingCreditCardDebt,
  getMonthCreditCardBillsTotal,
  getMonthExpensesForCompetenceSummary,
  getMonthIncome,
  getMonthTotalExpensesWithCardBills,
  transactionCountsTowardMonthCompetenceExpenses,
} from '../lib'
import { formatMoneyForInput, parseMoneyInputLoose } from '../lib/parseMoneyInput'
import { totalInvestmentsFromClosingDetails } from '../lib/monthlyClosingDisplay'
import { expandTransactionsForDateRange } from '../lib/transactionMonthFilter'
import { insertTransaction } from '../lib/supabase/transactionsRepo'
import { deleteGeneratedClosingAdjustments } from '../lib/supabase/transactionsRepo'
import {
  createMonthlyClosing,
  deleteMonthlyClosingByPeriod,
  fetchMonthlyClosingForUser,
  fetchMonthlyClosingsListForUser,
  updateMonthlyClosing,
} from '../lib/supabase/monthlyClosingsRepo'
import type { MonthlyClosing, MonthlyClosingWithDetails } from '../types'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  CalendarDays,
  ChartPie,
  ChevronLeft,
  ChevronRight,
  FileText,
  PencilLine,
} from 'lucide-react'

const COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
]

type ReportsSection = 'statement' | 'analysis' | 'closing'

const REPORT_SECTION_TABS: SegmentedTabItem<ReportsSection>[] = [
  {
    value: 'statement',
    label: 'Extrato por período',
    icon: FileText,
    tone: 'default',
  },
  {
    value: 'analysis',
    label: 'Despesas por categoria',
    icon: ChartPie,
    tone: 'default',
  },
  {
    value: 'closing',
    label: 'Fechamento mensal',
    icon: CalendarDays,
    tone: 'default',
  },
]

export function ReportsPage() {
  const { formatCurrency } = useValuesVisibility()
  const { transactions, refetchTransactions } = useTransactions()
  const { categories } = useCategories()
  const { creditCards, getBillsByCardId } = useCreditCards()
  const { accounts } = useAccounts()
  const { investments } = useInvestments()
  const { setActions, setTitle } = useHeaderActions()
  const { user } = useAuth()
  const toast = useToast()
  const chartLabelsOk = useMediaQuery('(min-width: 640px)')
  const now = new Date()
  const [viewedYear, setViewedYear] = useState(now.getFullYear())
  const [viewedMonth, setViewedMonth] = useState(now.getMonth() + 1)
  const [rangeStart, setRangeStart] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  )
  const [rangeEnd, setRangeEnd] = useState(
    new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  )
  const [activeSection, setActiveSection] = useState<ReportsSection>('statement')

  const [closings, setClosings] = useState<MonthlyClosing[]>([])
  const [closingDetails, setClosingDetails] =
    useState<MonthlyClosingWithDetails | null>(null)
  const [previousClosingDetails, setPreviousClosingDetails] =
    useState<MonthlyClosingWithDetails | null>(null)
  const [loadingClosings, setLoadingClosings] = useState(false)
  const [closingSubmitting, setClosingSubmitting] = useState(false)
  const [closingWizardOpen, setClosingWizardOpen] = useState(false)
  const [closingEditMode, setClosingEditMode] = useState(false)
  const [accountActuals, setAccountActuals] = useState<Record<string, string>>(
    {}
  )
  const [investmentActuals, setInvestmentActuals] = useState<
    Record<string, string>
  >({})

  const allBills = useMemo(
    () => creditCards.flatMap((c) => getBillsByCardId(c.id)),
    [creditCards, getBillsByCardId]
  )

  const cardBillsInMonth = getMonthCreditCardBillsTotal(
    allBills,
    viewedYear,
    viewedMonth
  )

  const expenseTransactions = useMemo(
    () =>
      transactions.filter(
        (t) =>
          t.type === 'expense' &&
          transactionMatchesCalendarMonthView(t, viewedYear, viewedMonth) &&
          transactionCountsTowardMonthCompetenceExpenses(t)
      ),
    [transactions, viewedYear, viewedMonth]
  )

  const byCategory = useMemo(
    () =>
      categories
        .filter((c) => c.type === 'expense')
        .map((cat) => ({
          name: cat.name,
          value: expenseTransactions
            .filter((t) => t.category_id === cat.id)
            .reduce((s, t) => s + t.amount, 0),
        }))
        .filter((d) => d.value > 0),
    [expenseTransactions, categories]
  )

  const pieData = useMemo(() => {
    const rows = [...byCategory]
    if (cardBillsInMonth > 0) {
      rows.push({
        name: 'Faturas de cartão (competência do mês)',
        value: cardBillsInMonth,
      })
    }
    return rows
  }, [byCategory, cardBillsInMonth])

  const monthIncome = getMonthIncome(transactions, viewedYear, viewedMonth)
  const monthExpensesTx = getMonthExpensesForCompetenceSummary(
    transactions,
    viewedYear,
    viewedMonth
  )
  const monthExpensesTotal = getMonthTotalExpensesWithCardBills(
    transactions,
    allBills,
    viewedYear,
    viewedMonth
  )

  const statementRows = useMemo(() => {
    const start = rangeStart?.trim()
    const end = rangeEnd?.trim()
    if (!start || !end) return []
    if (start > end) return []

    return expandTransactionsForDateRange(transactions, start, end)
  }, [transactions, rangeStart, rangeEnd])

  const statementTotals = useMemo(() => {
    const income = statementRows
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
    const expenses = statementRows
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
    return { income, expenses, balance: income - expenses }
  }, [statementRows])

  const patrimonyEvolutionData = useMemo(
    () =>
      closings
        .slice()
        .sort((a, b) =>
          a.year === b.year ? a.month - b.month : a.year - b.year
        )
        .map((c) => ({
          label: `${MONTH_LABELS[c.month - 1].slice(0, 3)}/${c.year}`,
          value: c.patrimony_total,
        })),
    [closings]
  )

  const monthlyInsightsRows = useMemo(
    () =>
      computeMonthlyInsights(closings, viewedYear, viewedMonth, {
        currency: formatCurrency,
        percent: (n) =>
          `${new Intl.NumberFormat('pt-BR', {
            maximumFractionDigits: 1,
            minimumFractionDigits: 1,
          }).format(n)}%`,
        monthShortLabel: (year, month) =>
          `${MONTH_LABELS[month - 1].slice(0, 3)}/${year}`,
      }),
    [closings, viewedYear, viewedMonth, formatCurrency]
  )

  const viewedMonthClosingLabel = `${MONTH_LABELS[viewedMonth - 1]} ${viewedYear}`

  useEffect(() => {
    const userId = user?.id
    if (!userId) {
      setClosings([])
      setClosingDetails(null)
      setPreviousClosingDetails(null)
      return
    }

    const client = getSupabaseBrowserClient()
    if (!client) return

    let cancelled = false
    async function run(
      supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
      uid: string
    ) {
      setLoadingClosings(true)
      const [list, current, prev] = await Promise.all([
        fetchMonthlyClosingsListForUser(supabase, uid),
        fetchMonthlyClosingForUser(supabase, uid, viewedYear, viewedMonth),
        fetchMonthlyClosingForUser(
          supabase,
          uid,
          viewedMonth === 1 ? viewedYear - 1 : viewedYear,
          viewedMonth === 1 ? 12 : viewedMonth - 1
        ),
      ])
      if (cancelled) return

      if (list.error) {
        toast.error(list.error.message)
      } else {
        setClosings(list.data)
      }
      if (current.error) toast.error(current.error.message)
      setClosingDetails(current.data)

      if (prev.error) toast.error(prev.error.message)
      setPreviousClosingDetails(prev.data)

      setLoadingClosings(false)
    }
    void run(client, userId)
    return () => {
      cancelled = true
    }
  }, [user?.id, viewedYear, viewedMonth, toast])

  useEffect(() => {
    setTitle('Relatórios')
    return () => setTitle('', null)
  }, [setTitle])
  useEffect(() => {
    setActions(null)
    return () => setActions(null)
  }, [setActions])

  const goPrev = () => {
    if (viewedMonth === 1) {
      setViewedMonth(12)
      setViewedYear((y) => y - 1)
    } else {
      setViewedMonth((m) => m - 1)
    }
  }

  const goNext = () => {
    if (viewedMonth === 12) {
      setViewedMonth(1)
      setViewedYear((y) => y + 1)
    } else {
      setViewedMonth((m) => m + 1)
    }
  }

  const monthLabel = `${MONTH_LABELS[viewedMonth - 1]} ${viewedYear}`

  const comparison = useMemo(() => {
    if (!closingDetails || !previousClosingDetails) return null
    return {
      patrimonyDelta:
        closingDetails.patrimony_total - previousClosingDetails.patrimony_total,
      accountsDelta:
        closingDetails.total_accounts - previousClosingDetails.total_accounts,
      investmentsDelta:
        totalInvestmentsFromClosingDetails(closingDetails) -
        totalInvestmentsFromClosingDetails(previousClosingDetails),
      monthBalanceDelta:
        closingDetails.month_balance - previousClosingDetails.month_balance,
    }
  }, [closingDetails, previousClosingDetails])
  const closingDisplayDate = resolveClosingDisplayDate(closingDetails)

  function resolveClosingDisplayDate(
    closing: MonthlyClosing | MonthlyClosingWithDetails | null
  ): string | null {
    if (!closing) return null
    const raw = closing.closed_at ?? closing.created_at ?? null
    if (!raw) return null
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return null
    return raw
  }

  function monthKey(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`
  }

  function firstDayOfNextMonthISO(year: number, month1to12: number): string {
    const d = new Date(year, month1to12, 1)
    return d.toISOString().slice(0, 10)
  }

  const computedAccountBalances = useMemo(() => {
    return accounts.map((a) => ({
      id: a.id,
      name: a.name,
      institution: a.institution ?? null,
      computed: getAccountBalance(a, transactions),
      type: a.type,
    }))
  }, [accounts, transactions])

  const computedInvestmentValues = useMemo(() => {
    return investments.map((i) => ({
      id: i.id,
      name: i.name,
      institution: i.institution ?? null,
      invested_amount: i.invested_amount,
      computed_current: i.current_amount,
      type: i.type,
    }))
  }, [investments])

  const computedAccountBalancesRef = useRef(computedAccountBalances)
  const computedInvestmentValuesRef = useRef(computedInvestmentValues)
  computedAccountBalancesRef.current = computedAccountBalances
  computedInvestmentValuesRef.current = computedInvestmentValues

  const closingDetailsMatchesView = useMemo(() => {
    if (!closingDetails) return false
    return (
      closingDetails.year === viewedYear && closingDetails.month === viewedMonth
    )
  }, [closingDetails, viewedYear, viewedMonth])

  useEffect(() => {
    setClosingWizardOpen(false)
    setClosingEditMode(false)
  }, [viewedYear, viewedMonth])

  const accountClosingDraftRows = useMemo(
    () =>
      computedAccountBalances
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        .map((a) => {
          const actual =
            parseMoneyInputLoose(accountActuals[a.id] ?? '') ?? a.computed
          return {
            ...a,
            actual,
            delta: actual - a.computed,
          }
        }),
    [computedAccountBalances, accountActuals]
  )

  const investmentClosingDraftRows = useMemo(
    () =>
      computedInvestmentValues
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        .map((i) => {
          const actual_current =
            parseMoneyInputLoose(investmentActuals[i.id] ?? '') ??
            i.computed_current
          return {
            ...i,
            actual_current,
            delta: actual_current - i.computed_current,
          }
        }),
    [computedInvestmentValues, investmentActuals]
  )

  const closingDraftTotals = useMemo(() => {
    const accountComputed = accountClosingDraftRows.reduce(
      (sum, row) => sum + row.computed,
      0
    )
    const accountActual = accountClosingDraftRows.reduce(
      (sum, row) => sum + row.actual,
      0
    )
    const investmentComputed = investmentClosingDraftRows.reduce(
      (sum, row) => sum + row.computed_current,
      0
    )
    const investmentActual = investmentClosingDraftRows.reduce(
      (sum, row) => sum + row.actual_current,
      0
    )
    return {
      accountComputed,
      accountActual,
      accountDelta: accountActual - accountComputed,
      investmentComputed,
      investmentActual,
      investmentDelta: investmentActual - investmentComputed,
      patrimonyActual:
        accountActual + investmentActual - getOutstandingCreditCardDebt(allBills),
    }
  }, [accountClosingDraftRows, investmentClosingDraftRows, allBills])

  useLayoutEffect(() => {
    if (!closingWizardOpen) return

    const accounts = computedAccountBalancesRef.current
    const invs = computedInvestmentValuesRef.current
    const fromClosing =
      closingDetailsMatchesView && closingDetails ? closingDetails : null

    setAccountActuals(() => {
      const next: Record<string, string> = {}
      for (const a of accounts) {
        let amount: number | null = null
        if (fromClosing) {
          const row = fromClosing.monthly_closing_accounts.find(
            (x) => x.account_id === a.id
          )
          const rowByName =
            row ??
            fromClosing.monthly_closing_accounts.find(
              (x) => x.account_id == null && x.account_name === a.name
            )
          if (rowByName) amount = rowByName.balance
        }
        if (amount === null || !Number.isFinite(amount)) {
          amount = a.computed
        }
        next[a.id] = formatMoneyForInput(amount)
      }
      return next
    })

    setInvestmentActuals(() => {
      const next: Record<string, string> = {}
      for (const i of invs) {
        let current: number | null = null
        if (fromClosing) {
          const row = fromClosing.monthly_closing_investments.find(
            (x) => x.investment_id === i.id
          )
          const rowByName =
            row ??
            fromClosing.monthly_closing_investments.find(
              (x) => x.investment_id == null && x.investment_name === i.name
            )
          if (rowByName) current = rowByName.current_amount
        }
        if (current === null || !Number.isFinite(current)) {
          current = i.computed_current
        }
        next[i.id] = formatMoneyForInput(current)
      }
      return next
    })
  }, [
    closingWizardOpen,
    closingDetails,
    closingDetailsMatchesView,
    viewedYear,
    viewedMonth,
  ])

  function pickCategoryId(kind: 'income' | 'expense'): string | null {
    const byType = categories.find((c) => c.type === kind)?.id
    if (byType) return byType
    return categories[0]?.id ?? null
  }

  async function handleCloseMonthAssisted() {
    const userId = user?.id
    if (!userId) {
      toast.error('Sessão inválida. Faça login novamente.')
      return
    }
    const client = getSupabaseBrowserClient()
    if (!client) {
      toast.error('Supabase não configurado.')
      return
    }

    setClosingSubmitting(true)
    try {
      if (closingDetailsMatchesView && closingDetails) {
        const actualAccountSnapshots = accountClosingDraftRows.map((a) => ({
          ...a,
          actual: a.actual,
        }))

        const actualInvestmentSnapshots = investmentClosingDraftRows.map((i) => ({
          ...i,
          actual_current: i.actual_current,
        }))

        const totalAccounts = actualAccountSnapshots.reduce(
          (s, a) => s + a.actual,
          0
        )
        const totalInvestments = actualInvestmentSnapshots.reduce(
          (s, i) => s + i.actual_current,
          0
        )
        const patrimonyTotal =
          totalAccounts +
          totalInvestments -
          getOutstandingCreditCardDebt(allBills)

        const { data, error } = await updateMonthlyClosing(
          client,
          userId,
          closingDetails.id,
          {
            year: closingDetails.year,
            month: closingDetails.month,
            total_accounts: totalAccounts,
            total_investments: totalInvestments,
            patrimony_total: patrimonyTotal,
            month_income: closingDetails.month_income,
            month_expenses: closingDetails.month_expenses,
            month_balance: closingDetails.month_balance,
            notes: closingDetails.notes,
            accounts: actualAccountSnapshots.map((a) => ({
              account_id: a.id,
              account_name: a.name,
              account_type: a.type ?? null,
              institution: a.institution ?? null,
              balance: a.actual,
            })),
            investments: actualInvestmentSnapshots.map((i) => ({
              investment_id: i.id,
              investment_name: i.name,
              investment_type: i.type ?? null,
              institution: i.institution ?? null,
              invested_amount: i.invested_amount,
              current_amount: i.actual_current,
            })),
          }
        )

        if (error) {
          toast.error(error.message)
          return
        }

        toast.success(`Fechamento atualizado: ${viewedMonthClosingLabel}`)
        setClosingDetails(data)
        setClosingWizardOpen(false)
        setClosingEditMode(false)

        const list = await fetchMonthlyClosingsListForUser(client, userId)
        if (!list.error) setClosings(list.data)
        return
      }

      const incomeCategoryId = pickCategoryId('income')
      const expenseCategoryId = pickCategoryId('expense')
      if (!incomeCategoryId || !expenseCategoryId) {
        toast.error(
          'Crie ao menos uma categoria de receita e uma de despesa para registrar ajustes.'
        )
        return
      }

      const actualAccountSnapshots = accountClosingDraftRows.map((a) => ({
        ...a,
        actual: a.actual,
      }))

      const actualInvestmentSnapshots = investmentClosingDraftRows.map((i) => ({
        ...i,
        actual_current: i.actual_current,
      }))

      const adjustments = actualAccountSnapshots
        .map((a) => ({
          account_id: a.id,
          account_name: a.name,
          delta: a.actual - a.computed,
        }))
        .filter((x) => Math.abs(x.delta) >= 0.005)

      const adjustmentDate = firstDayOfNextMonthISO(viewedYear, viewedMonth)
      const closingTag = monthKey(viewedYear, viewedMonth)

      for (const adj of adjustments) {
        const isPositive = adj.delta > 0
        const amount = Math.abs(adj.delta)
        const type = isPositive ? 'income' : 'expense'
        const categoryId = isPositive ? incomeCategoryId : expenseCategoryId
        const description = `Ajuste de saldo (${closingTag}) · ${adj.account_name}`

        const { error } = await insertTransaction(client, userId, {
          user_id: userId,
          account_id: adj.account_id,
          category_id: categoryId,
          type,
          description,
          amount,
          transaction_date: adjustmentDate,
          notes:
            'Gerado automaticamente no fechamento mensal para conciliar saldo calculado com saldo real.',
          recurrence: 'none',
          recurring: false,
          credit_card_id: null,
          exclude_from_month_expense_summary: type === 'expense',
        })

        if (error) {
          toast.error(`Falha ao criar ajuste: ${error.message}`)
          return
        }
      }

      const totalAccounts = actualAccountSnapshots.reduce(
        (s, a) => s + a.actual,
        0
      )
      const totalInvestments = actualInvestmentSnapshots.reduce(
        (s, i) => s + i.actual_current,
        0
      )
      const patrimonyTotal =
        totalAccounts +
        totalInvestments -
        getOutstandingCreditCardDebt(allBills)

      const income = getMonthIncome(transactions, viewedYear, viewedMonth)
      const expenses = getMonthTotalExpensesWithCardBills(
        transactions,
        allBills,
        viewedYear,
        viewedMonth
      )

      const { data, error } = await createMonthlyClosing(client, userId, {
        year: viewedYear,
        month: viewedMonth,
        total_accounts: totalAccounts,
        total_investments: totalInvestments,
        patrimony_total: patrimonyTotal,
        month_income: income,
        month_expenses: expenses,
        month_balance: income - expenses,
        notes: null,
        accounts: actualAccountSnapshots.map((a) => ({
          account_id: a.id,
          account_name: a.name,
          account_type: a.type ?? null,
          institution: a.institution ?? null,
          balance: a.actual,
        })),
        investments: actualInvestmentSnapshots.map((i) => ({
          investment_id: i.id,
          investment_name: i.name,
          investment_type: i.type ?? null,
          institution: i.institution ?? null,
          invested_amount: i.invested_amount,
          current_amount: i.actual_current,
        })),
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success(`Mês fechado: ${viewedMonthClosingLabel}`)
      setClosingDetails(data)
      setClosingWizardOpen(false)
      setClosingEditMode(false)

      const list = await fetchMonthlyClosingsListForUser(client, userId)
      if (!list.error) setClosings(list.data)
      if (adjustments.length > 0) {
        await refetchTransactions()
      }
    } finally {
      setClosingSubmitting(false)
    }
  }

  async function handleReopenMonth() {
    const userId = user?.id
    if (!userId) {
      toast.error('Sessão inválida. Faça login novamente.')
      return
    }
    const client = getSupabaseBrowserClient()
    if (!client) {
      toast.error('Supabase não configurado.')
      return
    }

    const closingTag = monthKey(viewedYear, viewedMonth)
    const adjustmentDate = firstDayOfNextMonthISO(viewedYear, viewedMonth)
    const ok = window.confirm(
      `Reabrir ${viewedMonthClosingLabel}?\n\nIsso vai remover o fechamento mensal e excluir ajustes automáticos com a tag ${closingTag}.`
    )
    if (!ok) return

    setClosingSubmitting(true)
    try {
      const { error: delAdjustmentsErr } = await deleteGeneratedClosingAdjustments(
        client,
        userId,
        closingTag,
        adjustmentDate
      )
      if (delAdjustmentsErr) {
        toast.error(delAdjustmentsErr.message)
        return
      }

      const { error: delClosingErr } = await deleteMonthlyClosingByPeriod(
        client,
        userId,
        viewedYear,
        viewedMonth
      )
      if (delClosingErr) {
        toast.error(delClosingErr.message)
        return
      }

      toast.success(`Fechamento removido: ${viewedMonthClosingLabel}`)
      setClosingDetails(null)

      const [list, prev] = await Promise.all([
        fetchMonthlyClosingsListForUser(client, userId),
        fetchMonthlyClosingForUser(
          client,
          userId,
          viewedMonth === 1 ? viewedYear - 1 : viewedYear,
          viewedMonth === 1 ? 12 : viewedMonth - 1
        ),
      ])
      if (!list.error) setClosings(list.data)
      if (!prev.error) setPreviousClosingDetails(prev.data)
      await refetchTransactions()
    } finally {
      setClosingSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <MonthlyEvolutionChart
        data={patrimonyEvolutionData}
        loading={loadingClosings}
        formatCurrency={formatCurrency}
      />

      <MonthlyInsights
        insights={monthlyInsightsRows}
        loading={loadingClosings}
      />

      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="card-block-heading mb-0">Resumo rápido</h2>
          <span className="text-xs font-medium text-ds-muted">{monthLabel}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5 dark:border-white/[0.08] dark:bg-zinc-800/40">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ds-muted">
              Receitas do período
            </p>
            <p className="mt-1 font-semibold tabular-nums text-emerald-600">
              {formatCurrency(statementTotals.income)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5 dark:border-white/[0.08] dark:bg-zinc-800/40">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ds-muted">
              Despesas do período
            </p>
            <p className="mt-1 font-semibold tabular-nums text-danger-600">
              {formatCurrency(statementTotals.expenses)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5 dark:border-white/[0.08] dark:bg-zinc-800/40">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ds-muted">
              Saldo do mês
            </p>
            <p className="mt-1 font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {formatCurrency(monthIncome - monthExpensesTotal)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5 dark:border-white/[0.08] dark:bg-zinc-800/40">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ds-muted">
              Status do fechamento
            </p>
            <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
              {closingDetails ? 'Mês fechado' : 'Mês aberto'}
            </p>
          </div>
        </div>
      </Card>

      <SegmentedTabList
        items={REPORT_SECTION_TABS}
        value={activeSection}
        onChange={setActiveSection}
        ariaLabel="Seções de relatórios"
        idPrefix="reports-section"
      />

      {activeSection === 'statement' ? (
      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="card-block-heading mb-0">Extrato por período</h2>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-ds-muted">
          Selecione um intervalo para listar movimentações e consolidar receitas,
          despesas e saldo do período.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="ui-label" htmlFor="report-start">
              Data inicial
            </label>
            <input
              id="report-start"
              type="date"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="ui-field"
            />
          </div>
          <div>
            <label className="ui-label" htmlFor="report-end">
              Data final
            </label>
            <input
              id="report-end"
              type="date"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="ui-field"
            />
          </div>
        </div>

        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-ds-muted">Total de receitas</dt>
            <dd className="font-semibold tabular-nums text-emerald-600">
              {formatCurrency(statementTotals.income)}
            </dd>
          </div>
          <div>
            <dt className="text-ds-muted">Total de despesas</dt>
            <dd className="font-semibold tabular-nums text-danger-600">
              {formatCurrency(statementTotals.expenses)}
            </dd>
          </div>
          <div>
            <dt className="text-ds-muted">Saldo do período</dt>
            <dd className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {formatCurrency(statementTotals.balance)}
            </dd>
          </div>
        </dl>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-xs text-ds-muted">
              <tr className="border-b border-slate-100 dark:border-white/[0.08]">
                <th className="py-2 pr-3 font-semibold">Data</th>
                <th className="py-2 pr-3 font-semibold">Descrição</th>
                <th className="py-2 pr-3 font-semibold">Tipo</th>
                <th className="py-2 text-right font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody>
              {statementRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-ds-muted"
                  >
                    Nenhuma movimentação no período.
                  </td>
                </tr>
              ) : (
                statementRows.slice(0, 80).map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-slate-50 dark:border-white/[0.06]"
                  >
                    <td className="py-2 pr-3 tabular-nums text-ds-secondary">
                      {t.transaction_date}
                    </td>
                    <td className="py-2 pr-3 text-slate-900 dark:text-slate-100">
                      {t.description || '—'}
                    </td>
                    <td className="py-2 pr-3 text-ds-secondary">
                      {t.type === 'income' ? 'Receita' : 'Despesa'}
                    </td>
                    <td
                      className={`py-2 text-right font-semibold tabular-nums ${
                        t.type === 'income'
                          ? 'text-emerald-600'
                          : 'text-danger-600'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '−'}
                      {formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {statementRows.length > 80 ? (
            <p className="mt-3 text-xs text-ds-muted">
              Mostrando as 80 movimentações mais recentes do período.
            </p>
          ) : null}
        </div>
      </Card>
      ) : null}

      {activeSection === 'analysis' ? (
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="card-block-heading mb-0">Despesas por categoria</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrev}
              className="card-icon-button"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <span className="min-w-[10rem] text-center text-sm font-medium text-slate-700 dark:text-slate-300">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={goNext}
              className="card-icon-button"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-ds-muted">
          Mesma base da visão geral: receitas no mês civil; despesas consolidadas =
          transações de saída que entram no resumo (sem duplicar compras no cartão
          marcadas para a fatura) + faturas com competência neste mês, independente
          de estarem pagas.
        </p>
        <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-ds-muted">Receitas no mês</dt>
            <dd className="font-semibold tabular-nums text-emerald-600">
              {formatCurrency(monthIncome)}
            </dd>
          </div>
          <div>
            <dt className="text-ds-muted">Despesas (transações no resumo)</dt>
            <dd className="font-semibold tabular-nums text-danger-600">
              {formatCurrency(monthExpensesTx)}
            </dd>
          </div>
          <div>
            <dt className="text-ds-muted">Despesas consolidadas</dt>
            <dd className="font-semibold tabular-nums text-danger-600">
              {formatCurrency(monthExpensesTotal)}
            </dd>
          </div>
        </dl>
        {pieData.length > 0 ? (
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={chartLabelsOk ? 0 : '32%'}
                  outerRadius={chartLabelsOk ? '70%' : '78%'}
                  label={
                    chartLabelsOk
                      ? ({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      : false
                  }
                >
                  {pieData.map((row, i) => (
                    <Cell
                      key={row.name}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown) =>
                    typeof value === 'number' ? formatCurrency(value) : ''
                  }
                />
                <Legend
                  wrapperStyle={{ fontSize: chartLabelsOk ? 14 : 12 }}
                  className="text-xs sm:text-sm"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-ds-muted">
            Nenhuma despesa neste mês (transações ou faturas de cartão).
          </p>
        )}
      </Card>
      ) : null}

      {activeSection === 'closing' ? (
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="card-block-heading mb-0">Fechamento mensal</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrev}
              className="card-icon-button"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <span className="min-w-[10rem] text-center text-sm font-medium text-slate-700 dark:text-slate-300">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={goNext}
              className="card-icon-button"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-ds-muted">
          Ao fechar, o sistema salva um snapshot com saldos de contas (calculados),
          valor atual de investimentos e o resultado do mês (receitas − despesas
          consolidadas, incluindo faturas do cartão com competência no mês).
        </p>

        {closingDetails ? (
          <div className="mb-4 rounded-xl border border-emerald-200/70 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-100">
            <p className="font-semibold">Mês já fechado</p>
            {closingDisplayDate ? (
              <p className="mt-1 text-xs opacity-90">
                Fechado em{' '}
                <span className="tabular-nums">
                  {formatDate(closingDisplayDate)}
                </span>
                .
              </p>
            ) : (
              <p className="mt-1 text-xs opacity-90">
                Fechamento registrado.
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleReopenMonth}
                disabled={closingSubmitting}
              >
                Reabrir mês
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setClosingEditMode((prev) => !prev)
                  setClosingWizardOpen((prev) => !prev)
                }}
                disabled={closingSubmitting || loadingClosings}
              >
                <PencilLine className="h-4 w-4" aria-hidden />
                {closingWizardOpen && closingEditMode
                  ? 'Cancelar edição'
                  : 'Editar fechamento'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => setClosingWizardOpen((v) => !v)}
              disabled={closingSubmitting}
            >
              {closingWizardOpen
                ? 'Ocultar fechamento assistido'
                : `Fechar mês (${viewedMonthClosingLabel})`}
            </Button>
            {loadingClosings ? (
              <span className="text-xs text-ds-muted">Carregando histórico…</span>
            ) : null}
          </div>
        )}

        {closingWizardOpen ? (
          <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-4 text-sm dark:border-white/[0.08] dark:bg-zinc-800/40">
            <p className="text-xs leading-relaxed text-ds-secondary">
              {closingDetailsMatchesView ? (
                <>
                  Ajuste os valores salvos neste fechamento e grave novamente.
                  Isso atualiza o snapshot do mês sem reabrir o fechamento.
                </>
              ) : (
                <>
                  Informe o saldo real (no banco) e o valor atual dos investimentos.
                  Se houver diferença, o sistema cria uma transação de ajuste em{' '}
                  <span className="font-semibold tabular-nums">
                    {firstDayOfNextMonthISO(viewedYear, viewedMonth)}
                  </span>{' '}
                  para não alterar o resultado do mês fechado.
                </>
              )}
            </p>

            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Contas
                </h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="text-left text-xs text-ds-muted">
                      <tr className="border-b border-slate-200/70 dark:border-white/[0.08]">
                        <th className="py-2 pr-3 font-semibold">Conta</th>
                        <th className="py-2 pr-3 text-right font-semibold">
                          Calculado
                        </th>
                        <th className="py-2 pr-3 text-right font-semibold">
                          Saldo real
                        </th>
                        <th className="py-2 text-right font-semibold">Dif.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {computedAccountBalances.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-ds-muted">
                            Nenhuma conta cadastrada.
                          </td>
                        </tr>
                      ) : (
                        accountClosingDraftRows.map((a) => {
                            const delta = a.delta
                            return (
                              <tr
                                key={a.id}
                                className="border-b border-slate-200/40 dark:border-white/[0.06]"
                              >
                                <td className="py-2 pr-3 text-slate-900 dark:text-slate-100">
                                  {a.name}
                                </td>
                                <td className="py-2 pr-3 text-right font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                                  {formatCurrency(a.computed)}
                                </td>
                                <td className="py-2 pr-3 text-right">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={accountActuals[a.id] ?? ''}
                                    onChange={(e) =>
                                      setAccountActuals((prev) => ({
                                        ...prev,
                                        [a.id]: e.target.value,
                                      }))
                                    }
                                    className="ui-field w-40 text-right tabular-nums"
                                    aria-label={`Saldo real da conta ${a.name}`}
                                  />
                                </td>
                                <td
                                  className={`py-2 text-right font-semibold tabular-nums ${
                                    Math.abs(delta) < 0.005
                                      ? 'text-ds-secondary'
                                      : delta > 0
                                        ? 'text-emerald-700 dark:text-emerald-300'
                                        : 'text-danger-600 dark:text-red-400'
                                  }`}
                                >
                                  {formatCurrency(delta)}
                                </td>
                              </tr>
                            )
                          })
                      )}
                    </tbody>
                    {accountClosingDraftRows.length > 0 ? (
                      <tfoot>
                        <tr className="border-t border-slate-300/70 dark:border-white/[0.12]">
                          <td className="py-2 pr-3 font-semibold text-slate-900 dark:text-slate-100">
                            Total lançado
                          </td>
                          <td className="py-2 pr-3 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                            {formatCurrency(closingDraftTotals.accountComputed)}
                          </td>
                          <td className="py-2 pr-3 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                            {formatCurrency(closingDraftTotals.accountActual)}
                          </td>
                          <td
                            className={`py-2 text-right font-semibold tabular-nums ${
                              Math.abs(closingDraftTotals.accountDelta) < 0.005
                                ? 'text-ds-secondary'
                                : closingDraftTotals.accountDelta > 0
                                  ? 'text-emerald-700 dark:text-emerald-300'
                                  : 'text-danger-600 dark:text-red-400'
                            }`}
                          >
                            {formatCurrency(closingDraftTotals.accountDelta)}
                          </td>
                        </tr>
                      </tfoot>
                    ) : null}
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Investimentos
                </h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="text-left text-xs text-ds-muted">
                      <tr className="border-b border-slate-200/70 dark:border-white/[0.08]">
                        <th className="py-2 pr-3 font-semibold">Investimento</th>
                        <th className="py-2 pr-3 text-right font-semibold">
                          Atual (cadastro)
                        </th>
                        <th className="py-2 pr-3 text-right font-semibold">
                          Atual (real)
                        </th>
                        <th className="py-2 text-right font-semibold">Dif.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {computedInvestmentValues.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-ds-muted">
                            Nenhum investimento cadastrado.
                          </td>
                        </tr>
                      ) : (
                        investmentClosingDraftRows.map((i) => {
                            const delta = i.delta
                            return (
                              <tr
                                key={i.id}
                                className="border-b border-slate-200/40 dark:border-white/[0.06]"
                              >
                                <td className="py-2 pr-3 text-slate-900 dark:text-slate-100">
                                  {i.name}
                                </td>
                                <td className="py-2 pr-3 text-right font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                                  {formatCurrency(i.computed_current)}
                                </td>
                                <td className="py-2 pr-3 text-right">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={investmentActuals[i.id] ?? ''}
                                    onChange={(e) =>
                                      setInvestmentActuals((prev) => ({
                                        ...prev,
                                        [i.id]: e.target.value,
                                      }))
                                    }
                                    className="ui-field w-40 text-right tabular-nums"
                                    aria-label={`Valor real do investimento ${i.name}`}
                                  />
                                </td>
                                <td
                                  className={`py-2 text-right font-semibold tabular-nums ${
                                    Math.abs(delta) < 0.005
                                      ? 'text-ds-secondary'
                                      : delta > 0
                                        ? 'text-emerald-700 dark:text-emerald-300'
                                        : 'text-danger-600 dark:text-red-400'
                                  }`}
                                >
                                  {formatCurrency(delta)}
                                </td>
                              </tr>
                            )
                          })
                      )}
                    </tbody>
                    {investmentClosingDraftRows.length > 0 ? (
                      <tfoot>
                        <tr className="border-t border-slate-300/70 dark:border-white/[0.12]">
                          <td className="py-2 pr-3 font-semibold text-slate-900 dark:text-slate-100">
                            Total lançado
                          </td>
                          <td className="py-2 pr-3 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                            {formatCurrency(closingDraftTotals.investmentComputed)}
                          </td>
                          <td className="py-2 pr-3 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                            {formatCurrency(closingDraftTotals.investmentActual)}
                          </td>
                          <td
                            className={`py-2 text-right font-semibold tabular-nums ${
                              Math.abs(closingDraftTotals.investmentDelta) < 0.005
                                ? 'text-ds-secondary'
                                : closingDraftTotals.investmentDelta > 0
                                  ? 'text-emerald-700 dark:text-emerald-300'
                                  : 'text-danger-600 dark:text-red-400'
                            }`}
                          >
                            {formatCurrency(closingDraftTotals.investmentDelta)}
                          </td>
                        </tr>
                      </tfoot>
                    ) : null}
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2 dark:border-white/[0.08] dark:bg-zinc-900/30">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ds-muted">
                  Total lançado em contas
                </p>
                <p className="mt-1 font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatCurrency(closingDraftTotals.accountActual)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2 dark:border-white/[0.08] dark:bg-zinc-900/30">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ds-muted">
                  Total lançado em investimentos
                </p>
                <p className="mt-1 font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatCurrency(closingDraftTotals.investmentActual)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-white/80 px-3 py-2 dark:border-white/[0.08] dark:bg-zinc-900/30">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ds-muted">
                  Patrimônio conferido
                </p>
                <p className="mt-1 font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatCurrency(closingDraftTotals.patrimonyActual)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setClosingWizardOpen(false)
                  setClosingEditMode(false)
                }}
                disabled={closingSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleCloseMonthAssisted}
                loading={closingSubmitting}
              >
                {closingDetailsMatchesView
                  ? 'Salvar alterações do fechamento'
                  : 'Confirmar fechamento'}
              </Button>
            </div>
          </div>
        ) : null}

        {closingDetails ? (
          <>
            <dl className="grid gap-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-ds-muted">Total em contas</dt>
                <dd className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatCurrency(closingDetails.total_accounts)}
                </dd>
              </div>
              <div>
                <dt className="text-ds-muted">Total em investimentos</dt>
                <dd className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatCurrency(
                    totalInvestmentsFromClosingDetails(closingDetails)
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-ds-muted">Patrimônio total</dt>
                <dd className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatCurrency(closingDetails.patrimony_total)}
                </dd>
              </div>
              <div>
                <dt className="text-ds-muted">Receitas do mês</dt>
                <dd className="font-semibold tabular-nums text-emerald-600">
                  {formatCurrency(closingDetails.month_income)}
                </dd>
              </div>
              <div>
                <dt className="text-ds-muted">Despesas do mês</dt>
                <dd className="font-semibold tabular-nums text-danger-600">
                  {formatCurrency(closingDetails.month_expenses)}
                </dd>
              </div>
              <div>
                <dt className="text-ds-muted">Saldo do mês</dt>
                <dd className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatCurrency(closingDetails.month_balance)}
                </dd>
              </div>
            </dl>

            {comparison ? (
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm dark:border-white/[0.08] dark:bg-zinc-800/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-ds-muted">
                  Comparação com o mês anterior
                </p>
                <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-ds-muted">Patrimônio</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatCurrency(comparison.patrimonyDelta)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ds-muted">Contas</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatCurrency(comparison.accountsDelta)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ds-muted">Investimentos</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatCurrency(comparison.investmentsDelta)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ds-muted">Saldo do mês</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatCurrency(comparison.monthBalanceDelta)}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="mt-4 text-xs text-ds-muted">
                {previousClosingDetails
                  ? 'Sem dados de comparação.'
                  : 'Feche o mês anterior para habilitar a comparação.'}
              </p>
            )}

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Contas (snapshot)
                </h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[420px] text-sm">
                    <thead className="text-left text-xs text-ds-muted">
                      <tr className="border-b border-slate-100 dark:border-white/[0.08]">
                        <th className="py-2 pr-3 font-semibold">Conta</th>
                        <th className="py-2 text-right font-semibold">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {closingDetails.monthly_closing_accounts
                        .slice()
                        .sort((a, b) => a.account_name.localeCompare(b.account_name, 'pt-BR'))
                        .map((a) => (
                          <tr
                            key={a.id}
                            className="border-b border-slate-50 dark:border-white/[0.06]"
                          >
                            <td className="py-2 pr-3 text-slate-900 dark:text-slate-100">
                              {a.account_name}
                            </td>
                            <td className="py-2 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                              {formatCurrency(a.balance)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    {closingDetails.monthly_closing_accounts.length > 0 ? (
                      <tfoot>
                        <tr className="border-t border-slate-200/80 dark:border-white/[0.12]">
                          <td className="py-2 pr-3 font-semibold text-slate-900 dark:text-slate-100">
                            Total lançado
                          </td>
                          <td className="py-2 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                            {formatCurrency(closingDetails.total_accounts)}
                          </td>
                        </tr>
                      </tfoot>
                    ) : null}
                  </table>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Investimentos (snapshot)
                </h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="text-left text-xs text-ds-muted">
                      <tr className="border-b border-slate-100 dark:border-white/[0.08]">
                        <th className="py-2 pr-3 font-semibold">Investimento</th>
                        <th className="py-2 pr-3 text-right font-semibold">Aplicado</th>
                        <th className="py-2 text-right font-semibold">Atual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {closingDetails.monthly_closing_investments
                        .slice()
                        .sort((a, b) =>
                          a.investment_name.localeCompare(b.investment_name, 'pt-BR')
                        )
                        .map((i) => (
                          <tr
                            key={i.id}
                            className="border-b border-slate-50 dark:border-white/[0.06]"
                          >
                            <td className="py-2 pr-3 text-slate-900 dark:text-slate-100">
                              {i.investment_name}
                            </td>
                            <td className="py-2 pr-3 text-right font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                              {formatCurrency(i.invested_amount)}
                            </td>
                            <td className="py-2 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                              {formatCurrency(i.current_amount)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    {closingDetails.monthly_closing_investments.length > 0 ? (
                      <tfoot>
                        <tr className="border-t border-slate-200/80 dark:border-white/[0.12]">
                          <td className="py-2 pr-3 font-semibold text-slate-900 dark:text-slate-100">
                            Total lançado
                          </td>
                          <td className="py-2 pr-3 text-right font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                            {formatCurrency(
                              closingDetails.monthly_closing_investments.reduce(
                                (sum, row) => sum + row.invested_amount,
                                0
                              )
                            )}
                          </td>
                          <td className="py-2 text-right font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                            {formatCurrency(
                              totalInvestmentsFromClosingDetails(closingDetails)
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    ) : null}
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-ds-muted">
            Nenhum fechamento registrado para {monthLabel}.
          </p>
        )}

        <div className="mt-6 border-t border-slate-100 pt-5 text-sm dark:border-white/[0.08]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ds-muted">
            Histórico de fechamentos
          </p>
          {closings.length === 0 ? (
            <p className="text-sm text-ds-muted">
              Você ainda não fechou nenhum mês.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {closings.slice(0, 12).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setViewedYear(c.year)
                      setViewedMonth(c.month)
                      setClosingWizardOpen(false)
                      setClosingEditMode(false)
                    }}
                    className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-left text-sm shadow-card-sm transition hover:border-slate-300 hover:bg-slate-50/70 dark:border-white/[0.08] dark:bg-zinc-900/40 dark:hover:border-white/[0.16] dark:hover:bg-zinc-900/70"
                  >
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {MONTH_LABELS[c.month - 1]} {c.year}
                  </p>
                  <p className="mt-1 text-xs text-ds-muted">
                    Patrimônio: <span className="tabular-nums">{formatCurrency(c.patrimony_total)}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-ds-muted">
                    Saldo do mês: <span className="tabular-nums">{formatCurrency(c.month_balance)}</span>
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-ds-muted">
                    Abrir fechamento
                  </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
      ) : null}
    </div>
  )
}
