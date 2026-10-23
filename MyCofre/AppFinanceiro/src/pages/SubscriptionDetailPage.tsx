import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EditIconButton } from '../components/ui/EditIconButton'
import { useValuesVisibility } from '../contexts/ValuesVisibilityContext'
import { useSubscriptions } from '../contexts/SubscriptionsContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { useToast } from '../contexts/ToastContext'
import { ArrowLeft, Trash2 } from 'lucide-react'

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
}

const periodicityLabels: Record<string, string> = {
  monthly: 'Mensal',
  annual: 'Anual',
}

export function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setTitle } = useHeaderActions()
  const { success } = useToast()
  const { formatCurrency } = useValuesVisibility()
  const { getSubscriptionById, deleteSubscription } = useSubscriptions()
  const subscription = id ? getSubscriptionById(id) : undefined

  useEffect(() => {
    if (!id) setTitle('Assinatura')
    else if (!subscription) setTitle('Assinatura não encontrada', 'A assinatura solicitada não existe.')
    else setTitle('Detalhe da assinatura', subscription.name)
    return () => setTitle('', null)
  }, [id, subscription, setTitle])

  if (!id) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="py-4 text-sm text-ds-muted">
            Identificador não informado.
          </p>
          <Button to="/subscriptions" variant="secondary">
            Voltar às assinaturas
          </Button>
        </Card>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <Card>
          <Button to="/subscriptions" variant="secondary">
            Voltar às assinaturas
          </Button>
        </Card>
      </div>
    )
  }

  const handleDelete = () => {
    if (
      !id ||
      !window.confirm(
        'Excluir esta assinatura? Esta ação não pode ser desfeita.'
      )
    ) {
      return
    }
    void (async () => {
      const ok = await deleteSubscription(id)
      if (!ok) return
      success('Assinatura excluída.')
      navigate('/subscriptions')
    })()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2">
        <EditIconButton
          to={`/subscriptions/${id}/edit`}
          aria-label="Editar assinatura"
          title="Editar assinatura"
        />
        <Button type="button" variant="danger" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
        <Button to="/subscriptions" variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          Voltar às assinaturas
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
            Periodicidade
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
            {periodicityLabels[subscription.periodicity ?? 'monthly']}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
            Valor ({subscription.periodicity === 'annual' ? 'R$/ano' : 'R$/mês'})
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {formatCurrency(subscription.monthly_amount)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-ds-muted">
            Status
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
            {statusLabels[subscription.status] ?? subscription.status}
          </p>
        </Card>
      </div>

      <Card className="max-w-2xl">
        <dl className="space-y-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
              Nome do serviço
            </dt>
            <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
              {subscription.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
              Forma de pagamento
            </dt>
            <dd className="mt-0.5 text-slate-900 dark:text-slate-100">
              {subscription.payment_method ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
              Periodicidade
            </dt>
            <dd className="mt-0.5 text-slate-900 dark:text-slate-100">
              {periodicityLabels[subscription.periodicity ?? 'monthly']}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
              Dia da cobrança
            </dt>
            <dd className="mt-0.5 text-slate-900 dark:text-slate-100">
              {subscription.billing_day}
            </dd>
          </div>
          {subscription.notes && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ds-muted">
                Observações
              </dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                {subscription.notes}
              </dd>
            </div>
          )}
        </dl>
      </Card>
    </div>
  )
}
