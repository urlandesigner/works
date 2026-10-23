import { useEffect, useMemo, useState } from 'react'
import { useInvestmentsForNetWorth } from '../hooks/useInvestmentsForNetWorth'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { Card } from '../components/ui/Card'
import { MetricCard } from '../components/ui/MetricCard'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { GoalProjectionCard } from '../components/goals/GoalProjectionCard'
import {
  formatDate,
  getAccountBalance,
  getGoalCurrentAmount,
  getTotalCash,
  getTotalInvestmentsValue,
  getNetPatrimony,
  getMonthIncome,
  getMonthTotalExpensesWithCardBills,
} from '../lib'
import {
  computeGoalProjectionView,
  selectGoalForDashboardProjection,
} from '../lib/goalProjection'
import {
  financeExpenseAmountDisplay,
  financeIncomeAmountDisplay,
} from '../lib/financeDisplay'
import { useValuesVisibility } from '../contexts/ValuesVisibilityContext'
import { useTransactions } from '../contexts/TransactionsContext'
import { useAccounts } from '../contexts/AccountsContext'
import { useCreditCards } from '../contexts/CreditCardsContext'
import { useGoals } from '../contexts/GoalsContext'
import { useCategories } from '../contexts/CategoriesContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { TransactionCalendar } from '../components/TransactionCalendar'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { useMediaQuery } from '../hooks/useMediaQuery'
import {
  getDashboardFinancialAlert,
  shouldShowDashboardAlertInHeader,
} from '../lib/dashboardFinancialAlert'
import {
  Plus,
  Wallet,
  TrendingUp,
  PiggyBank,
  ArrowLeftRight,
} from 'lucide-react'
import { AddActionSheet } from '../components/add-transaction/AddActionSheet'
import { TransactionFormSheet } from '../components/add-transaction/TransactionFormSheet'
import { FinancialAssistantSheet } from '../modules/financial-assistant/components/FinancialAssistantSheet'
import { isFeatureEnabled } from '../config/feature-flags'
import { MobileFab } from '../components/ui/MobileFab'

const accountTypeLabels: Record<string, string> = {
  checking: 'Conta corrente',
  savings: 'Poupança',
  investment: 'Investimento',
  other: 'Outra',
}

const investmentTypeLabels: Record<string, string> = {
  fixed_income: 'Renda fixa',
  variable_income: 'Renda variável',
  crypto: 'Cripto',
}

const LAST_TRANSACTIONS = 5
const MOBILE_ACCOUNT_PREVIEW = 3
const MOBILE_INVESTMENT_PREVIEW = 3

type HomeSheet = 'closed' | 'add' | 'assistant' | 'manual'

export function DashboardPage() {
  const [homeSheet, setHomeSheet] = useState<HomeSheet>('closed')
  const isLg = useMediaQuery('(min-width: 1024px)')
  const { setActions, setTitle, setDashboardAlert, setMobileFab } = useHeaderActions()
  const { formatCurrency } = useValuesVisibility()
  const { transactions, loading: transactionsLoading } = useTransactions()
  const {
    investmentsForNetWorth,
    investmentsLoading,
    closingInvSnapshotLoading,
  } = useInvestmentsForNetWorth()
  const { accounts, loading: accountsLoading } = useAccounts()
  const { creditCards, getBillsByCardId, loading: creditCardsLoading } =
    useCreditCards()
  const { goals, loading: goalsLoading } = useGoals()
  const { getCategoryName, loading: categoriesLoading } = useCategories()

  const dashboardLoading =
    transactionsLoading ||
    accountsLoading ||
    investmentsLoading ||
    closingInvSnapshotLoading ||
    creditCardsLoading ||
    goalsLoading ||
    categoriesLoading
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const allCreditCardBills = useMemo(
    () => creditCards.flatMap((card) => getBillsByCardId(card.id)),
    [creditCards, getBillsByCardId]
  )

  useEffect(() => {
    setTitle(
      'Visão geral',
      'Patrimônio líquido, contas, investimentos e movimentações do mês'
    )
    return () => setTitle('', null)
  }, [setTitle])
  useEffect(() => {
    setActions(
      <div className="hidden lg:block">
        <Button to="/transactions/new">
          <Plus className="h-4 w-4" />
          Nova transação
        </Button>
      </div>
    )
    return () => setActions(null)
  }, [setActions])
  useEffect(() => {
    if (homeSheet !== 'closed') {
      setMobileFab(null)
      return
    }
    setMobileFab(
      <MobileFab
        ariaLabel="Adicionar"
        onClick={() =>
          setHomeSheet(isFeatureEnabled('assistant') ? 'add' : 'manual')
        }
        icon={<Plus className="h-7 w-7" strokeWidth={2.25} aria-hidden />}
      />
    )
    return () => setMobileFab(null)
  }, [homeSheet, setMobileFab])

  const totalCash = getTotalCash(accounts, transactions)
  const totalInvestmentsValue = getTotalInvestmentsValue(investmentsForNetWorth)
  const patrimony = getNetPatrimony(
    accounts,
    transactions,
    investmentsForNetWorth,
    allCreditCardBills
  )
  const monthIncome = getMonthIncome(transactions, currentYear, currentMonth)
  const monthExpenses = getMonthTotalExpensesWithCardBills(
    transactions,
    allCreditCardBills,
    currentYear,
    currentMonth
  )

  const financialAlert = useMemo(
    () =>
      getDashboardFinancialAlert({
        monthIncome,
        monthExpenses,
      }),
    [monthIncome, monthExpenses]
  )

  useEffect(() => {
    setDashboardAlert(
      shouldShowDashboardAlertInHeader(financialAlert) ? financialAlert : null
    )
    return () => setDashboardAlert(null)
  }, [financialAlert, setDashboardAlert])

  const lastTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.transaction_date).getTime() -
        new Date(a.transaction_date).getTime()
    )
    .slice(0, LAST_TRANSACTIONS)

  const maxIncomeExpense = Math.max(monthIncome, monthExpenses) || 1
  const incomePct = monthIncome / maxIncomeExpense
  const expensePct = monthExpenses / maxIncomeExpense
  const monthBalance = monthIncome - monthExpenses

  const goalProjection = useMemo(() => {
    const getCurrent = (g: (typeof goals)[number]) =>
      getGoalCurrentAmount(
        g,
        accounts,
        transactions,
        investmentsForNetWorth,
        allCreditCardBills
      )
    const goal = selectGoalForDashboardProjection(goals, getCurrent)
    const current = goal ? getCurrent(goal) : 0
    return computeGoalProjectionView(goal, current, monthBalance)
  }, [
    goals,
    accounts,
    transactions,
    investmentsForNetWorth,
    allCreditCardBills,
    monthBalance,
  ])

  const monthFlowCard = (
    <Card>
      <h2 className="card-block-heading">Receitas e despesas do mês</h2>
      <p className="mb-3 hidden text-xs font-normal leading-relaxed text-gray-500 dark:text-slate-400 lg:mb-6 lg:block">
        Despesas = transações de saída no mês + faturas de cartão com
        competência neste mês. Evite registrar a mesma compra como transação e
        no valor total da fatura.
      </p>
      <p className="mb-4 text-xs leading-snug text-gray-500 dark:text-slate-400 lg:hidden">
        Despesas incluem faturas de cartão com competência neste mês.
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:gap-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Receitas
          </p>
          <p className="mt-1.5 font-display text-xl font-bold tabular-nums leading-tight tracking-tight text-emerald-600 lg:mt-2 lg:text-2xl">
            {formatCurrency(monthIncome)}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-700 lg:mt-4 lg:h-[10px]">
            <div
              className="h-full w-full origin-left rounded-full bg-emerald-500 transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{
                transform: `scaleX(${Math.min(1, Math.max(0, incomePct))})`,
              }}
            />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Despesas
          </p>
          <p className="mt-1.5 font-display text-xl font-bold tabular-nums leading-tight tracking-tight text-danger-600 lg:mt-2 lg:text-2xl">
            {formatCurrency(monthExpenses)}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-700 lg:mt-4 lg:h-[10px]">
            <div
              className="h-full w-full origin-left rounded-full bg-red-500 transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{
                transform: `scaleX(${Math.min(1, Math.max(0, expensePct))})`,
              }}
            />
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 sm:px-5 lg:mt-8 lg:py-4 dark:border-white/[0.08] dark:bg-zinc-800/50">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
          Saldo do mês
        </p>
        <p
          className={`mt-0.5 font-display text-xl font-bold tabular-nums tracking-tight lg:mt-1 lg:text-2xl ${
            monthBalance >= 0 ? 'text-gray-900 dark:text-slate-100' : 'text-danger-600 dark:text-red-400'
          }`}
        >
          {formatCurrency(monthBalance)}
        </p>
      </div>
    </Card>
  )

  const lastTxCard = (
    <Card>
      <div className="card-block-header">
        <h2 className="card-block-title">Últimas transações</h2>
        <Link to="/transactions" className="card-action-link">
          Ver todas
        </Link>
      </div>
      {lastTransactions.length === 0 ? (
        <EmptyState
          variant="compact"
          icon={ArrowLeftRight}
          title="Nenhuma transação"
          description="Registre movimentações para ver as últimas aqui."
        >
          <Button to="/transactions/new" variant="secondary" className="text-xs">
            Nova transação
          </Button>
        </EmptyState>
      ) : (
        <ul className="card-list">
          {lastTransactions.map((t, i) => (
            <li
              key={t.id}
              className={clsx(i >= 4 && 'hidden lg:list-item')}
            >
              <Link to={`/transactions/${t.id}`} className="card-list-link">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">
                    {t.description || getCategoryName(t.category_id)}
                  </p>
                  <p className="text-xs text-ds-muted">
                    {formatDate(t.transaction_date)}
                  </p>
                </div>
                <p
                  className={`ml-2 shrink-0 ${
                    t.type === 'income'
                      ? financeIncomeAmountDisplay
                      : financeExpenseAmountDisplay
                  }`}
                >
                  {t.type === 'income' ? '+' : '−'}
                  {formatCurrency(t.amount)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )

  const accountsCard = (
    <Card>
      <div className="card-block-header">
        <h2 className="card-block-title">Contas</h2>
        <Link to="/accounts" className="card-action-link">
          Ver todas
        </Link>
      </div>
      {accounts.length === 0 ? (
        <EmptyState
          variant="compact"
          icon={Wallet}
          title="Nenhuma conta cadastrada"
          description="Adicione uma conta para ver saldos aqui."
        >
          <Button to="/accounts/new" variant="secondary" className="text-xs">
            Nova conta
          </Button>
        </EmptyState>
      ) : (
        <ul className="card-list">
          {accounts.map((account, idx) => {
            const balance = getAccountBalance(account, transactions)
            return (
              <li
                key={account.id}
                className={clsx(
                  idx >= MOBILE_ACCOUNT_PREVIEW && 'hidden lg:list-item'
                )}
              >
                <Link to={`/accounts/${account.id}`} className="card-list-link">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900/[0.04] text-slate-700 ring-1 ring-slate-900/[0.05] dark:bg-white/[0.06] dark:text-slate-200 dark:ring-white/[0.10]">
                      <Wallet className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">
                        {account.name}
                      </p>
                      <p className="text-xs text-ds-muted">
                        {accountTypeLabels[account.type] ?? account.type}
                      </p>
                    </div>
                  </div>
                  <p className="ml-2 shrink-0 text-sm font-semibold tabular-nums text-slate-950 dark:text-slate-100">
                    {formatCurrency(balance)}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )

  const investmentsCard = (
    <Card>
      <div className="card-block-header">
        <h2 className="card-block-title">Investimentos</h2>
        <Link to="/investments" className="card-action-link">
          Ver todos
        </Link>
      </div>
      {investmentsForNetWorth.length === 0 ? (
        <EmptyState
          variant="compact"
          icon={TrendingUp}
          title="Nenhum investimento"
          description="Cadastre ativos para acompanhar valor atual e rentabilidade."
        >
          <Button to="/investments/new" variant="secondary" className="text-xs">
            Novo investimento
          </Button>
        </EmptyState>
      ) : (
        <ul className="card-list">
          {investmentsForNetWorth.map((inv, idx) => (
            <li
              key={inv.id}
              className={clsx(
                idx >= MOBILE_INVESTMENT_PREVIEW && 'hidden lg:list-item'
              )}
            >
              <Link to={`/investments/${inv.id}`} className="card-list-link">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50/90 text-emerald-800 ring-1 ring-emerald-900/10 dark:bg-emerald-950/45 dark:text-emerald-200 dark:ring-emerald-400/20">
                    <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">
                      {inv.name}
                    </p>
                    <p className="text-xs text-ds-muted">
                      {investmentTypeLabels[inv.type] ?? inv.type}
                    </p>
                  </div>
                </div>
                <p className="ml-2 shrink-0 text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatCurrency(inv.current_amount)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )

  return (
    <div className="relative pb-20 lg:pb-0">
      {dashboardLoading ? (
        <div aria-busy="true">
          <DashboardSkeleton isLg={isLg} />
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr),320px] lg:items-stretch lg:gap-x-8 lg:gap-y-0">
        {/* 1 — Hero patrimônio (só mobile) */}
        <section
          className="col-span-1 order-1 lg:hidden"
          aria-labelledby="dash-mobile-patrimony"
        >
          <Card className="border-emerald-100/90 bg-gradient-to-br from-emerald-50/50 via-white to-white ring-1 ring-emerald-900/[0.05] dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-zinc-900/90 dark:to-zinc-900/90 dark:ring-emerald-900/20">
            <div className="flex items-start gap-3">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50/90 text-emerald-700 ring-1 ring-emerald-900/[0.07] dark:bg-emerald-950/45 dark:text-emerald-200 dark:ring-emerald-400/20"
                aria-hidden
              >
                <Wallet className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/75 dark:text-emerald-400/90">
                  Patrimônio líquido
                </p>
                <p
                  id="dash-mobile-patrimony"
                  className="mt-1 font-display text-3xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100"
                >
                  {formatCurrency(patrimony)}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-snug text-gray-500 dark:text-slate-400">
                  Contas + investimentos, menos faturas de cartão em aberto.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 dark:border-white/[0.08]">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Disponível em contas
                </p>
                <p className="mt-0.5 truncate font-display text-base font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatCurrency(totalCash)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Investimentos
                </p>
                <p className="mt-0.5 truncate font-display text-base font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatCurrency(totalInvestmentsValue)}
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Coluna principal: mobile = contents (filhos entram no grid); desktop = flex-col */}
        <div className="contents lg:col-start-1 lg:row-span-full lg:flex lg:min-w-0 lg:max-w-full lg:flex-col lg:gap-6">
        {/* 2 — Três métricas (só desktop) */}
        <section className="col-span-1 hidden lg:block">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Patrimônio líquido"
              icon={<Wallet className="h-4 w-4" />}
              iconBoxClassName="h-10 w-10"
              iconWrapperClassName="bg-emerald-50/90 text-emerald-700 ring-emerald-900/[0.07] dark:bg-emerald-950/45 dark:text-emerald-200 dark:ring-emerald-400/20"
              value={formatCurrency(patrimony)}
            />
            <MetricCard
              title="Disponível em contas"
              icon={<PiggyBank className="h-4 w-4" />}
              iconBoxClassName="h-10 w-10"
              iconWrapperClassName="bg-sky-50/90 text-sky-700 ring-sky-900/[0.07] dark:bg-sky-950/45 dark:text-sky-200 dark:ring-sky-400/20"
              value={formatCurrency(totalCash)}
            />
            <MetricCard
              title="Valor atual em investimentos"
              icon={<TrendingUp className="h-4 w-4" />}
              iconBoxClassName="h-10 w-10"
              iconWrapperClassName="bg-teal-50/90 text-teal-700 ring-teal-900/[0.07] dark:bg-teal-950/45 dark:text-teal-200 dark:ring-teal-400/20"
              value={formatCurrency(totalInvestmentsValue)}
            />
          </div>
        </section>

        {/* 3 — Fluxo do mês */}
        <section className="col-span-1 order-2 lg:order-none">
          {monthFlowCard}
        </section>

        {/* 5 — Projeção de metas */}
        <section className="col-span-1 order-4 lg:order-none">
          <GoalProjectionCard
            goalProjection={goalProjection}
            formatCurrency={formatCurrency}
            compact={!isLg}
          />
        </section>

        {/* 6 — Contas */}
        <section className="col-span-1 order-5 lg:order-none">
          {accountsCard}
        </section>

        {/* 7 — Investimentos */}
        <section className="col-span-1 order-6 lg:order-none">
          {investmentsCard}
        </section>
        </div>

        {/* Sidebar: desktop = calendário → transações | mobile = transações → calendário (order-3 / order-7) */}
        <div className="contents lg:col-start-2 lg:row-span-full lg:flex lg:min-w-0 lg:w-full lg:max-w-[320px] lg:flex-col lg:gap-6">
        <section className="col-span-1 order-7 lg:order-none">
          <TransactionCalendar
            compact={!isLg}
            collapsibleOnNarrow={!isLg}
          />
        </section>
        <section className="col-span-1 order-3 lg:order-none">
          {lastTxCard}
        </section>
        </div>
      </div>
      )}

      <AddActionSheet
        open={homeSheet === 'add'}
        onClose={() => setHomeSheet('closed')}
        onSelectAssistant={() => setHomeSheet('assistant')}
        onSelectManual={() => setHomeSheet('manual')}
        showAssistant={isFeatureEnabled('assistant')}
      />
      <FinancialAssistantSheet
        open={isFeatureEnabled('assistant') && homeSheet === 'assistant'}
        onClose={() => setHomeSheet('closed')}
      />
      <TransactionFormSheet
        open={homeSheet === 'manual'}
        onClose={() => setHomeSheet('closed')}
      />
    </div>
  )
}

