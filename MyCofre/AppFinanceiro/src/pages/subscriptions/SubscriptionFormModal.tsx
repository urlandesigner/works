import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clsx } from 'clsx'
import { Button } from '../../components/ui/Button'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import { EmptyState } from '../../components/ui/EmptyState'
import { useSubscriptions } from '../../contexts/SubscriptionsContext'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Repeat } from 'lucide-react'
import type { SubscriptionPeriodicity } from '../../types'

const schema = z
  .object({
    name: z.string().min(1, 'Informe o nome do serviço'),
    periodicity: z.enum(['monthly', 'annual']),
    monthly_amount: z.number().min(0, 'Valor não pode ser negativo'),
    payment_method: z.string().optional(),
    billing_day: z
      .number()
      .min(1, 'Dia deve ser entre 1 e 31')
      .max(31, 'Dia deve ser entre 1 e 31'),
    billing_month: z
      .number()
      .min(1, 'Mês deve ser entre 1 e 12')
      .max(12, 'Mês deve ser entre 1 e 12')
      .optional(),
    status: z.enum(['active', 'inactive']),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.periodicity === 'annual' && !data.billing_month) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecione o mês da cobrança',
        path: ['billing_month'],
      })
    }
  })
type FormData = z.infer<typeof schema>

const monthOptions = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Fev' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Abr' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Ago' },
  { value: 9, label: 'Set' },
  { value: 10, label: 'Out' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dez' },
]

export function SubscriptionFormModal() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getSubscriptionById } = useSubscriptions()
  const subscription = id ? getSubscriptionById(id) : undefined
  const isEdit = Boolean(id)

  const goBack = () => navigate('/subscriptions')

  if (isEdit && id && !subscription) {
    return (
      <EmptyState
        icon={Repeat}
        title="Assinatura não encontrada"
        description="Ela pode ter sido excluída ou o link está incorreto."
      >
        <Button type="button" variant="secondary" onClick={goBack}>
          Voltar às assinaturas
        </Button>
      </EmptyState>
    )
  }

  if (isEdit && subscription && id) {
    return (
      <SubscriptionEditForm subscriptionId={id} subscription={subscription} onClose={goBack} />
    )
  }

  return <SubscriptionNewForm onClose={goBack} />
}

function SubscriptionNewForm({ onClose }: { onClose: () => void }) {
  const { addSubscription } = useSubscriptions()
  const { user } = useAuth()
  const { success } = useToast()
  const uid = user?.id ?? ''
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      periodicity: 'monthly' as SubscriptionPeriodicity,
      status: 'active',
      monthly_amount: 0,
      billing_day: 1,
    },
  })
  const periodicity = watch('periodicity')

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const row = await addSubscription({
          user_id: uid,
          name: data.name,
          periodicity: data.periodicity,
          monthly_amount: data.monthly_amount,
          payment_method: data.payment_method?.trim() || null,
          billing_day: data.billing_day,
          billing_month: data.periodicity === 'annual' ? data.billing_month ?? null : null,
          status: data.status,
          notes: data.notes || null,
        })
        if (!row) return
        success('Assinatura cadastrada.')
        onClose()
      })}
      className="space-y-4"
    >
      <div>
        <label className="ui-label">
          Nome do serviço
        </label>
        <input
          type="text"
          {...register('name')}
          className="ui-field"
          placeholder="Ex: Spotify, YouTube Premium"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-danger-500">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="ui-label">
          Periodicidade
        </label>
        <select
          {...register('periodicity')}
          className="ui-field"
        >
          <option value="monthly">Mensal</option>
          <option value="annual">Anual</option>
        </select>
      </div>
      <div>
        <label className="ui-label">
          Valor (R$) — conforme periodicidade
        </label>
        <Controller
          name="monthly_amount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              value={field.value ?? 0}
              onChange={field.onChange}
              placeholder="R$ 0,00"
            />
          )}
        />
        {errors.monthly_amount && (
          <p className="mt-1 text-sm text-danger-500">
            {errors.monthly_amount.message}
          </p>
        )}
      </div>
      <div>
        <label className="ui-label">
          Forma de pagamento (opcional)
        </label>
        <input
          type="text"
          {...register('payment_method')}
          className="ui-field"
          placeholder="Ex: Nubank, Itaú, Cartão Caixa, PicPay, Débito automático"
        />
      </div>
      <div>
        <div className={clsx('grid gap-4', periodicity === 'annual' ? 'sm:grid-cols-2' : '')}>
          <div>
            <label className="ui-label">
              Dia da cobrança (1–31)
            </label>
            <input
              type="number"
              min={1}
              max={31}
              {...register('billing_day', { valueAsNumber: true })}
              className="ui-field tabular-nums"
            />
            {errors.billing_day && (
              <p className="mt-1 text-sm text-danger-500">
                {errors.billing_day.message}
              </p>
            )}
          </div>
          {periodicity === 'annual' && (
            <div>
              <label className="ui-label">
                Mês da cobrança
              </label>
              <select
                {...register('billing_month', { valueAsNumber: true })}
                className="ui-field"
                defaultValue=""
              >
                <option value="" disabled>
                  Selecione
                </option>
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              {errors.billing_month && (
                <p className="mt-1 text-sm text-danger-500">
                  {errors.billing_month.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="ui-label">Status</label>
        <select {...register('status')} className="ui-field">
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>
      <div>
        <label className="ui-label">Observações (opcional)</label>
        <textarea
          {...register('notes')}
          rows={2}
          className="ui-field"
          placeholder="Notas sobre a assinatura"
        />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  )
}

function SubscriptionEditForm({
  subscriptionId,
  subscription,
  onClose,
}: {
  subscriptionId: string
  subscription: {
    name: string
    periodicity?: string | null
    monthly_amount: number
    payment_method?: string | null
    billing_day: number
    billing_month?: number | null
    status: string
    notes?: string | null
  }
  onClose: () => void
}) {
  const { updateSubscription } = useSubscriptions()
  const { success } = useToast()
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: subscription.name,
      periodicity: (subscription.periodicity ?? 'monthly') as 'monthly' | 'annual',
      monthly_amount: subscription.monthly_amount,
      payment_method: subscription.payment_method ?? '',
      billing_day: subscription.billing_day,
      billing_month: subscription.billing_month ?? undefined,
      status: subscription.status as 'active' | 'inactive',
      notes: subscription.notes ?? '',
    },
  })
  const periodicity = watch('periodicity')

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const ok = await updateSubscription(subscriptionId, {
          name: data.name,
          periodicity: data.periodicity,
          monthly_amount: data.monthly_amount,
          payment_method: data.payment_method?.trim() || null,
          billing_day: data.billing_day,
          billing_month: data.periodicity === 'annual' ? data.billing_month ?? null : null,
          status: data.status,
          notes: data.notes || null,
        })
        if (!ok) return
        success('Assinatura atualizada.')
        onClose()
      })}
      className="space-y-4"
    >
      <div>
        <label className="ui-label">Nome do serviço</label>
        <input
          type="text"
          {...register('name')}
          className="ui-field"
          placeholder="Ex: Spotify, YouTube Premium"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-danger-500">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="ui-label">Periodicidade</label>
        <select {...register('periodicity')} className="ui-field">
          <option value="monthly">Mensal</option>
          <option value="annual">Anual</option>
        </select>
      </div>
      <div>
        <label className="ui-label">Valor (R$) — conforme periodicidade</label>
        <Controller
          name="monthly_amount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              value={field.value ?? 0}
              onChange={field.onChange}
              placeholder="R$ 0,00"
            />
          )}
        />
        {errors.monthly_amount && (
          <p className="mt-1 text-sm text-danger-500">
            {errors.monthly_amount.message}
          </p>
        )}
      </div>
      <div>
        <label className="ui-label">Forma de pagamento (opcional)</label>
        <input
          type="text"
          {...register('payment_method')}
          className="ui-field"
          placeholder="Ex: Nubank, Itaú, Cartão Caixa, PicPay, Débito automático"
        />
      </div>
      <div>
        <div className={clsx('grid gap-4', periodicity === 'annual' ? 'sm:grid-cols-2' : '')}>
          <div>
            <label className="ui-label">Dia da cobrança (1–31)</label>
            <input
              type="number"
              min={1}
              max={31}
              {...register('billing_day', { valueAsNumber: true })}
              className="ui-field tabular-nums"
            />
            {errors.billing_day && (
              <p className="mt-1 text-sm text-danger-500">
                {errors.billing_day.message}
              </p>
            )}
          </div>
          {periodicity === 'annual' && (
            <div>
              <label className="ui-label">Mês da cobrança</label>
              <select
                {...register('billing_month', { valueAsNumber: true })}
                className="ui-field"
                defaultValue={subscription.billing_month ?? ''}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              {errors.billing_month && (
                <p className="mt-1 text-sm text-danger-500">
                  {errors.billing_month.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="ui-label">Status</label>
        <select {...register('status')} className="ui-field">
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>
      <div>
        <label className="ui-label">Observações (opcional)</label>
        <textarea
          {...register('notes')}
          rows={2}
          className="ui-field"
          placeholder="Notas sobre a assinatura"
        />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Salvar alterações</Button>
      </div>
    </form>
  )
}
