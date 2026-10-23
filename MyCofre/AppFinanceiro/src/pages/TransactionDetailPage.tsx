import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EditIconButton } from '../components/ui/EditIconButton'
import { formatDate } from '../lib'
import { useValuesVisibility } from '../contexts/ValuesVisibilityContext'
import { useTransactions } from '../contexts/TransactionsContext'
import { useAccounts } from '../contexts/AccountsContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { useCategories } from '../contexts/CategoriesContext'
import { ArrowLeft, Wallet, Tag, Calendar, FileText, RefreshCw } from 'lucide-react'

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { setTitle } = useHeaderActions()
  const { formatCurrency } = useValuesVisibility()
  const { getTransactionById, loading: transactionsLoading } = useTransactions()
  const { getAccountById } = useAccounts()
  const { getCategoryName } = useCategories()
  const transaction = id ? getTransactionById(id) : undefined
  const getAccountLabel = (accountId: string | null) =>
    accountId ? (getAccountById(accountId)?.name ?? '—') : 'Sem conta vinculada'

  useEffect(() => {
    if (!id) setTitle('Transação')
    else if (!transaction) setTitle('Transação não encontrada', 'A transação pode ter sido excluída.')
    else setTitle('Detalhe da transação', `${transaction.description || getCategoryName(transaction.category_id)} · ${formatDate(transaction.transaction_date)}`)
    return () => setTitle('', null)
  }, [id, transaction, setTitle, getCategoryName])

  if (!id) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="py-4 text-sm text-ds-muted">
            Identificador não informado.
          </p>
          <Button to="/transactions" variant="secondary">
            Voltar às transações
          </Button>
        </Card>
      </div>
    )
  }

  if (transactionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600"
          aria-hidden
        />
        <p className="text-sm text-ds-muted">Carregando transação…</p>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="space-y-6">
        <Card>
          <Button to="/transactions" variant="secondary">
            Voltar às transações
          </Button>
        </Card>
      </div>
    )
  }

  const isIncome = transaction.type === 'income'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2">
        <EditIconButton
          to={`/transactions/${id}/edit`}
          aria-label="Editar transação"
          title="Editar transação"
        />
        <Button to="/transactions" variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          Voltar às transações
        </Button>
      </div>

      <Card className="max-w-lg">
        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
              Valor
            </dt>
            <dd
              className={`mt-1 text-2xl font-semibold tabular-nums ${
                isIncome ? 'text-emerald-600' : 'text-danger-600'
              }`}
            >
              {isIncome ? '+' : '−'}
              {formatCurrency(transaction.amount)}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
              Tipo
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              {isIncome ? 'Receita' : 'Despesa'}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
              Descrição
            </dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
              {transaction.description || '—'}
            </dd>
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-8">
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ds-muted">
                <Wallet className="h-3.5 w-3.5" />
                Conta
              </dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                {getAccountLabel(transaction.account_id)}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ds-muted">
                <Tag className="h-3.5 w-3.5" />
                Categoria
              </dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                {getCategoryName(transaction.category_id)}
              </dd>
            </div>
          </div>

          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ds-muted">
              <Calendar className="h-3.5 w-3.5" />
              Data
            </dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
              {formatDate(transaction.transaction_date)}
            </dd>
          </div>

          {transaction.recurring && (
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ds-muted">
                <RefreshCw className="h-3.5 w-3.5" />
                Recorrente
              </dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                Sim
              </dd>
            </div>
          )}

          {transaction.notes && (
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ds-muted">
                <FileText className="h-3.5 w-3.5" />
                Observações
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                {transaction.notes}
              </dd>
            </div>
          )}
        </dl>
      </Card>
    </div>
  )
}
