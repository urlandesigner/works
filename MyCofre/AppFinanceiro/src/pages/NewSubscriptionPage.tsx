import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useSubscriptions } from '../contexts/SubscriptionsContext'
import { useAuth } from '../contexts/AuthContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import type { SubscriptionPeriodicity } from '../types'

const schema = z.object({
  name: z.string().min(1, 'Informe o nome do serviço'),
  periodicity: z.enum(['monthly', 'annual']),
  monthly_amount: z.number().min(0, 'Valor não pode ser negativo'),
  payment_method: z.string().optional(),
  billing_day: z.number().min(1, 'Dia deve ser entre 1 e 31').max(31, 'Dia deve ser entre 1 e 31'),
  status: z.enum(['active', 'inactive']),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function NewSubscriptionPage() {
  const navigate = useNavigate()
  const { addSubscription } = useSubscriptions()
  const { user } = useAuth()
  const { setTitle } = useHeaderActions()
  const {
    register,
    handleSubmit,
    control,
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

  useEffect(() => {
    setTitle('Nova assinatura')
    return () => setTitle('', null)
  }, [setTitle])

  const onSubmit = async (data: FormData) => {
    const row = await addSubscription({
      user_id: user?.id ?? '',
      name: data.name,
      periodicity: data.periodicity,
      monthly_amount: data.monthly_amount,
      payment_method: data.payment_method?.trim() || null,
      billing_day: data.billing_day,
      status: data.status,
      notes: data.notes || null,
    })
    if (!row) return
    navigate('/subscriptions')
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <select
              {...register('periodicity')}
              className="ui-field"
            >
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

          <div>
            <label className="ui-label">Status</label>
            <select
              {...register('status')}
              className="ui-field"
            >
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
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
