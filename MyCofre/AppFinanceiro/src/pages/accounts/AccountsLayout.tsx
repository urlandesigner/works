import { useEffect } from 'react'
import { Link, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  CardChevronLink,
  cardHeaderActionsClass,
} from '../../components/ui/CardChevronLink'
import { EditIconButton } from '../../components/ui/EditIconButton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { MobileFab } from '../../components/ui/MobileFab'
import {
  getAccountBalance,
  getAccountInvestmentsValue,
  getAccountInvestedAmount,
  getAccountPatrimony,
} from '../../lib'
import { useValuesVisibility } from '../../contexts/ValuesVisibilityContext'
import { useTransactions } from '../../contexts/TransactionsContext'
import { useInvestments } from '../../contexts/InvestmentsContext'
import { useAccounts } from '../../contexts/AccountsContext'
import { useHeaderActions } from '../../contexts/HeaderActionsContext'
import { AccountCardSkeleton } from '../../components/ui/skeleton-compositions'
import { Plus, Wallet } from 'lucide-react'

const accountTypeLabels: Record<string, string> = {
  checking: 'Conta corrente',
  savings: 'Poupança',
  investment: 'Investimento',
  other: 'Outra',
}

export function AccountsLayout() {
  const navigate = useNavigate()
  const outlet = useOutlet()
  const { formatCurrency } = useValuesVisibility()
  const { transactions, loading: transactionsLoading } = useTransactions()
  const { investments, loading: investmentsLoading } = useInvestments()
  const { accounts, loading: accountsLoading } = useAccounts()

  const accountsPageLoading =
    accountsLoading || transactionsLoading || investmentsLoading

  const location = useLocation()
  const pathname = location.pathname
  const isNewRoute = pathname === '/accounts/new'
  const isEditRoute = /^\/accounts\/[^/]+\/edit$/.test(pathname)
  const isModalOpen = isNewRoute || isEditRoute
  const modalTitle = isNewRoute ? 'Nova conta' : 'Editar conta'
  const { setActions, setTitle, setMobileFab } = useHeaderActions()

  useEffect(() => {
    setTitle('Contas')
    return () => setTitle('', null)
  }, [setTitle])
  useEffect(() => {
    setActions(
      <Button to="/accounts/new">
        <Plus className="h-4 w-4" />
        Nova conta
      </Button>
    )
    return () => setActions(null)
  }, [setActions])
  useEffect(() => {
    setMobileFab(
      <MobileFab
        to="/accounts/new"
        ariaLabel="Nova conta"
        icon={<Plus className="h-7 w-7" strokeWidth={2.25} aria-hidden />}
      />
    )
    return () => setMobileFab(null)
  }, [setMobileFab])

  return (
    <>
      <div className="space-y-6">
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy={accountsPageLoading}
        >
          {accountsPageLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <AccountCardSkeleton key={i} />
            ))
          ) : accounts.length === 0 ? (
            <Card>
              <EmptyState
                icon={Wallet}
                title="Nenhuma conta cadastrada"
                description="Comece criando uma conta corrente, poupança ou carteira para organizar seu dinheiro."
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
                <Card
                  key={account.id}
                  className="overflow-hidden transition hover:border-slate-300"
                >
                  <div className="card-block-header items-start gap-3">
                    <Link
                      to={`/accounts/${account.id}`}
                      className="min-w-0 flex-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:ring-offset-2"
                    >
                      <p className="card-section-label mb-2">
                        {accountTypeLabels[account.type] || account.type}
                      </p>
                      <h2 className="card-block-title">{account.name}</h2>
                      {account.institution && (
                        <p className="mt-2 text-sm text-ds-muted">
                          {account.institution}
                        </p>
                      )}
                    </Link>
                    <div className={cardHeaderActionsClass}>
                      <EditIconButton
                        size="compact"
                        to={`/accounts/${account.id}/edit`}
                        aria-label={`Editar conta ${account.name}`}
                        title="Editar conta"
                        className="self-start"
                      />
                      <CardChevronLink
                        to={`/accounts/${account.id}`}
                        aria-label={`Abrir conta ${account.name}`}
                        title="Ver detalhes"
                      />
                    </div>
                  </div>
                  <Link
                    to={`/accounts/${account.id}`}
                    className="card-block-body-flush block px-6 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:ring-offset-2"
                  >
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
                  </Link>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {isModalOpen && (
        <Modal
          fullBleedMobile
          title={modalTitle}
          onClose={() => navigate('/accounts')}
        >
          {outlet}
        </Modal>
      )}
    </>
  )
}
