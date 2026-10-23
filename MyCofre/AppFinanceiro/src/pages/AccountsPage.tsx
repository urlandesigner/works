import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import {
  getAccountBalance,
  getAccountInvestmentsValue,
  getAccountInvestedAmount,
  getAccountPatrimony,
} from '../lib'
import { useValuesVisibility } from '../contexts/ValuesVisibilityContext'
import { useTransactions } from '../contexts/TransactionsContext'
import { useInvestments } from '../contexts/InvestmentsContext'
import { useAccounts } from '../contexts/AccountsContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { CardChevronIcon } from '../components/ui/CardChevronLink'
import { Plus, Wallet } from 'lucide-react'

const accountTypeLabels: Record<string, string> = {
  checking: 'Conta corrente',
  savings: 'Poupança',
  investment: 'Investimento',
  other: 'Outra',
}

export function AccountsPage() {
  const { formatCurrency } = useValuesVisibility()
  const { transactions } = useTransactions()
  const { investments } = useInvestments()
  const { accounts } = useAccounts()
  const { setTitle } = useHeaderActions()

  useEffect(() => {
    setTitle('Contas')
    return () => setTitle('', null)
  }, [setTitle])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <Button to="/accounts/new">
          <Plus className="h-4 w-4" />
          Nova conta
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.length === 0 ? (
          <Card>
            <EmptyState
              icon={Wallet}
              title="Nenhuma conta por aqui"
              description="Cadastre contas correntes, poupança ou investimentos para ver saldos e patrimônio por conta."
            >
              <Button to="/accounts/new">
                <Plus className="h-4 w-4" />
                Nova conta
              </Button>
            </EmptyState>
          </Card>
        ) : (
          accounts.map((account) => {
          const balance = getAccountBalance(account, transactions)
          const investmentsValue = getAccountInvestmentsValue(
            account.id,
            investments
          )
          const investedAmount = getAccountInvestedAmount(
            account.id,
            investments
          )
          const patrimony = getAccountPatrimony(
            account,
            transactions,
            investments
          )
          const hasInvestments = account.allows_investments && investmentsValue > 0

          return (
            <Link key={account.id} to={`/accounts/${account.id}`}>
              <Card className="overflow-hidden transition hover:border-slate-300">
                <div className="card-block-header items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="card-section-label mb-2">
                      {accountTypeLabels[account.type] || account.type}
                    </p>
                    <h2 className="card-block-title">{account.name}</h2>
                    {account.institution && (
                      <p className="mt-2 text-sm text-ds-muted">
                        {account.institution}
                      </p>
                    )}
                  </div>
                  <CardChevronIcon className="shrink-0 self-start" />
                </div>
                <div className="card-block-body-flush px-6 py-4">
                  <dl className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <dt className="text-ds-muted">
                        Saldo disponível
                      </dt>
                      <dd className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {formatCurrency(balance)}
                      </dd>
                    </div>
                    {hasInvestments && (
                      <div className="flex justify-between text-sm">
                        <dt className="text-ds-muted">
                          Total investido
                        </dt>
                        <dd className="font-medium tabular-nums text-slate-600 dark:text-slate-300">
                          {formatCurrency(investedAmount)}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <dt className="text-ds-muted">
                        Patrimônio da conta
                      </dt>
                      <dd className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {formatCurrency(patrimony)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </Card>
            </Link>
          )
        })
        )}
      </div>
    </div>
  )
}
