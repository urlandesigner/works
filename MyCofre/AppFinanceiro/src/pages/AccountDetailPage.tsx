import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EditIconButton } from '../components/ui/EditIconButton'
import {
  formatDate,
  getAccountBalance,
  getAccountInvestedAmount,
  getAccountPatrimony,
} from '../lib'
import { useValuesVisibility } from '../contexts/ValuesVisibilityContext'
import { useTransactions } from '../contexts/TransactionsContext'
import { useInvestments } from '../contexts/InvestmentsContext'
import { useAccounts } from '../contexts/AccountsContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { useToast } from '../contexts/ToastContext'
import { useCategories } from '../contexts/CategoriesContext'
import { financeExpenseAmountSm, financeIncomeAmountSm } from '../lib/financeDisplay'
import { ArrowLeft, Trash2 } from 'lucide-react'

const accountTypeLabels: Record<string, string> = {
  checking: 'Conta corrente',
  savings: 'Poupança',
  investment: 'Investimento',
  other: 'Outra',
}

const accountStatusLabels: Record<string, string> = {
  active: 'Ativa',
  closed: 'Encerrada',
}

const investmentTypeLabels: Record<string, string> = {
  fixed_income: 'Renda fixa',
  variable_income: 'Renda variável',
  crypto: 'Cripto',
}

const LAST_TRANSACTIONS_LIMIT = 10

export function AccountDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setTitle } = useHeaderActions()
  const { success } = useToast()
  const { formatCurrency } = useValuesVisibility()
  const { transactions } = useTransactions()
  const { investments } = useInvestments()
  const { getAccountById, deleteAccount } = useAccounts()
  const { getCategoryName } = useCategories()
  const account = id ? getAccountById(id) : undefined

  useEffect(() => {
    if (!id) setTitle('Conta')
    else if (!account) setTitle('Conta não encontrada', 'A conta solicitada não existe.')
    else setTitle('Detalhe da conta', `${account.name}${account.institution ? ` · ${account.institution}` : ''}`)
    return () => setTitle('', null)
  }, [id, account, setTitle])

  if (!id) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="py-4 text-sm text-ds-muted">
            Identificador não informado.
          </p>
          <Button to="/accounts" variant="secondary">
            Voltar às contas
          </Button>
        </Card>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="space-y-6">
        <Card>
          <Button to="/accounts" variant="secondary">
            Voltar às contas
          </Button>
        </Card>
      </div>
    )
  }

  const balance = getAccountBalance(account, transactions)
  const investedAmount = getAccountInvestedAmount(account.id, investments)
  const patrimony = getAccountPatrimony(account, transactions, investments)
  const accountInvestments = investments.filter(
    (i) => i.account_id === account.id
  )
  const accountTransactions = [...transactions]
    .filter((t) => t.account_id === account.id)
    .sort(
      (a, b) =>
        new Date(b.transaction_date).getTime() -
        new Date(a.transaction_date).getTime()
    )
    .slice(0, LAST_TRANSACTIONS_LIMIT)

  const handleDelete = () => {
    if (
      !id ||
      !window.confirm(
        'Tem certeza que deseja excluir esta conta? Essa ação não poderá ser desfeita.'
      )
    ) {
      return
    }
    void (async () => {
      const ok = await deleteAccount(id)
      if (!ok) return
      success('Conta excluída.')
      navigate('/accounts')
    })()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2">
        <EditIconButton
          to={`/accounts/${id}/edit`}
          aria-label="Editar conta"
          title="Editar conta"
        />
        <Button type="button" variant="danger" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
        <Button to="/accounts" variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          Voltar às contas
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
            Saldo disponível
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {formatCurrency(balance)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
            Total investido
          </p>
          <p className="mt-1 text-xl font-medium tabular-nums text-slate-600 dark:text-slate-300">
            {formatCurrency(investedAmount)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
            Patrimônio total da conta
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {formatCurrency(patrimony)}
          </p>
        </Card>
      </div>

      {account.include_in_net_worth === false ? (
        <p className="text-sm text-ds-muted">
          O saldo em caixa desta conta não entra no patrimônio líquido da visão
          geral. Investimentos vinculados a ela continuam contando no total.
        </p>
      ) : null}

      <Card className="max-w-2xl">
        <dl className="space-y-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
              Nome
            </dt>
            <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
              {account.name}
            </dd>
          </div>
          {account.institution && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
                Instituição
              </dt>
              <dd className="mt-0.5 text-slate-900 dark:text-slate-100">
                {account.institution}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
              Tipo
            </dt>
            <dd className="mt-0.5 text-slate-900 dark:text-slate-100">
              {accountTypeLabels[account.type] ?? account.type}
            </dd>
          </div>
          {account.status && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
                Status
              </dt>
              <dd className="mt-0.5 text-slate-900 dark:text-slate-100">
                {accountStatusLabels[account.status] ?? account.status}
              </dd>
            </div>
          )}
          {account.notes && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
                Observações
              </dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                {account.notes}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {accountInvestments.length > 0 && (
        <section>
          <Card>
            <h2 className="card-block-heading">Investimentos vinculados</h2>
            <ul className="card-list">
              {accountInvestments.map((inv) => (
                <li key={inv.id}>
                  <div className="card-list-row">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {inv.name}
                    </p>
                    <p className="text-xs text-ds-muted">
                      {investmentTypeLabels[inv.type] ?? inv.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {formatCurrency(inv.current_amount)}
                    </p>
                    <p className="text-xs font-medium tabular-nums text-ds-muted">
                      Aplicado: {formatCurrency(inv.invested_amount)}
                    </p>
                  </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      <section>
        {accountTransactions.length === 0 ? (
          <Card>
            <h2 className="card-block-heading">Últimas transações</h2>
            <p className="card-prose py-6 text-center">Nenhuma transação nesta conta.</p>
          </Card>
        ) : (
          <Card>
            <h2 className="card-block-heading">Últimas transações</h2>
            <ul className="card-list">
              {accountTransactions.map((t) => (
                <li key={t.id}>
                  <div className="card-list-row">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {t.description || getCategoryName(t.category_id)}
                    </p>
                    <p className="text-xs text-ds-muted">
                      {formatDate(t.transaction_date)}
                    </p>
                  </div>
                  <p
                    className={
                      t.type === 'income'
                        ? financeIncomeAmountSm
                        : financeExpenseAmountSm
                    }
                  >
                    {t.type === 'income' ? '+' : '−'}
                    {formatCurrency(t.amount)}
                  </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  )
}
