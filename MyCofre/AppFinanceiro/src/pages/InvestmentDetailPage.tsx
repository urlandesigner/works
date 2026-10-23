import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EditIconButton } from '../components/ui/EditIconButton'
import { formatDate } from '../lib'
import { useValuesVisibility } from '../contexts/ValuesVisibilityContext'
import { useInvestments } from '../contexts/InvestmentsContext'
import { useAccounts } from '../contexts/AccountsContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { useToast } from '../contexts/ToastContext'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { financeGainText, financeLossText } from '../lib/financeDisplay'

const investmentTypeLabels: Record<string, string> = {
  fixed_income: 'Renda fixa',
  variable_income: 'Renda variável',
  crypto: 'Cripto',
}

const investmentStatusLabels: Record<string, string> = {
  active: 'Ativo',
  sold: 'Vendido',
  closed: 'Encerrado',
}


function getReturnPercent(invested: number, current: number): number | null {
  if (invested === 0) return null
  return ((current - invested) / invested) * 100
}

export function InvestmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setTitle } = useHeaderActions()
  const { success } = useToast()
  const { formatCurrency } = useValuesVisibility()
  const { getInvestmentById, deleteInvestment } = useInvestments()
  const { getAccountById } = useAccounts()
  const investment = id ? getInvestmentById(id) : undefined

  const getAccountName = (accountId: string | null) =>
    accountId ? getAccountById(accountId)?.name ?? '—' : 'Sem conta vinculada'
  const getAccountInstitution = (accountId: string | null) =>
    accountId ? getAccountById(accountId)?.institution ?? null : null

  useEffect(() => {
    if (!id) setTitle('Investimento')
    else if (!investment) setTitle('Investimento não encontrado', 'O investimento solicitado não existe.')
    else {
      const inst =
        investment.institution ??
        (investment.account_id
          ? getAccountById(investment.account_id)?.institution ?? null
          : null)
      setTitle('Detalhe do investimento', `${investment.name}${inst ? ` · ${inst}` : ''}`)
    }
    return () => setTitle('', null)
  }, [id, investment, getAccountById, setTitle])

  if (!id) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="py-4 text-sm text-ds-muted">
            Identificador não informado.
          </p>
          <Button to="/investments" variant="secondary">
            Voltar aos investimentos
          </Button>
        </Card>
      </div>
    )
  }

  if (!investment) {
    return (
      <div className="space-y-6">
        <Card>
          <Button to="/investments" variant="secondary">
            Voltar aos investimentos
          </Button>
        </Card>
      </div>
    )
  }

  const returnAmount = investment.current_amount - investment.invested_amount
  const returnPercent = getReturnPercent(
    investment.invested_amount,
    investment.current_amount
  )
  const institution =
    investment.institution ?? getAccountInstitution(investment.account_id)

  const handleDelete = () => {
    if (
      !id ||
      !window.confirm(
        'Tem certeza que deseja excluir este investimento? Essa ação não poderá ser desfeita.'
      )
    ) {
      return
    }
    void (async () => {
      const ok = await deleteInvestment(id)
      if (!ok) return
      success('Investimento excluído.')
      navigate('/investments')
    })()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2">
        <EditIconButton
          to={`/investments/${id}/edit`}
          aria-label="Editar investimento"
          title="Editar investimento"
        />
        <Button type="button" variant="danger" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
        <Button to="/investments" variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          Voltar aos investimentos
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
            Valor investido
          </p>
          <p className="mt-1 text-xl font-medium tabular-nums text-slate-600 dark:text-slate-300">
            {formatCurrency(investment.invested_amount)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
            Valor atual
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {formatCurrency(investment.current_amount)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
            Rentabilidade
          </p>
          <p
            className={`mt-1 text-xl font-medium tabular-nums ${
              returnAmount >= 0 ? financeGainText : financeLossText
            }`}
          >
            {returnAmount >= 0 ? '+' : ''}
            {formatCurrency(returnAmount)}
            {returnPercent !== null && (
              <span className="mt-0.5 block">
                {returnPercent >= 0 ? '+' : ''}
                {returnPercent.toFixed(2)}%
              </span>
            )}
          </p>
        </Card>
      </div>

      <Card className="max-w-2xl">
        <dl className="space-y-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
              Nome do ativo
            </dt>
            <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
              {investment.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
              Conta vinculada
            </dt>
            <dd className="mt-0.5 text-slate-900 dark:text-slate-100">
              {getAccountName(investment.account_id)}
            </dd>
          </div>
          {institution && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
                Instituição
              </dt>
              <dd className="mt-0.5 text-slate-900 dark:text-slate-100">
                {institution}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
              Tipo do ativo
            </dt>
            <dd className="mt-0.5 text-slate-900 dark:text-slate-100">
              {investmentTypeLabels[investment.type] ?? investment.type}
            </dd>
          </div>
          {investment.status && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
                Status
              </dt>
              <dd className="mt-0.5 text-slate-900 dark:text-slate-100">
                {investmentStatusLabels[investment.status] ?? investment.status}
              </dd>
            </div>
          )}
          {investment.created_at && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
                Data de início
              </dt>
              <dd className="mt-0.5 text-slate-900 dark:text-slate-100">
                {formatDate(investment.created_at)}
              </dd>
            </div>
          )}
          {investment.notes && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
                Observações
              </dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                {investment.notes}
              </dd>
            </div>
          )}
        </dl>
      </Card>
    </div>
  )
}
