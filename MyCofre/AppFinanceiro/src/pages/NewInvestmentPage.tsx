import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useInvestments } from '../contexts/InvestmentsContext'
import { useAccounts } from '../contexts/AccountsContext'
import { useAuth } from '../contexts/AuthContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'

const schema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  account_id: z.string().optional(),
  type: z.enum(['fixed_income', 'variable_income', 'crypto']),
  invested_amount: z.number().min(0, 'Valor não pode ser negativo'),
  current_amount: z.number().min(0, 'Valor não pode ser negativo'),
})

type FormData = z.infer<typeof schema>

const investmentTypeLabels: Record<string, string> = {
  fixed_income: 'Renda fixa',
  variable_income: 'Renda variável',
  crypto: 'Cripto',
}

export function NewInvestmentPage() {
  const navigate = useNavigate()
  const { addInvestment } = useInvestments()
  const { accounts } = useAccounts()
  const { user } = useAuth()
  const { setTitle } = useHeaderActions()
  const accountsWithInvestments = accounts.filter((a) => a.allows_investments)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'fixed_income',
      invested_amount: 0,
      current_amount: 0,
    },
  })

  useEffect(() => {
    setTitle('Novo investimento')
    return () => setTitle('', null)
  }, [setTitle])

  const onSubmit = async (data: FormData) => {
    const accountId =
      data.account_id && data.account_id.trim() !== '' ? data.account_id : null
    const row = await addInvestment({
      user_id: user?.id ?? '',
      account_id: accountId,
      name: data.name,
      type: data.type,
      invested_amount: data.invested_amount,
      current_amount: data.current_amount,
      notes: null,
      institution: null,
      status: 'active',
    })
    if (!row) return
    navigate('/investments')
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="ui-label">Nome</label>
            <input
              type="text"
              {...register('name')}
              className="ui-field"
              placeholder="Ex: Tesouro Direto"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-danger-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="ui-label">Conta vinculada (opcional)</label>
            <select
              {...register('account_id')}
              className="ui-field"
            >
              <option value="">
                Sem conta (opcional) — use para investimentos só de acompanhamento
              </option>
              {accountsWithInvestments.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                  {acc.institution ? ` (${acc.institution})` : ''}
                </option>
              ))}
            </select>
            {errors.account_id && (
              <p className="mt-1 text-sm text-danger-500">
                {errors.account_id.message}
              </p>
            )}
          </div>

          <div>
            <label className="ui-label">Tipo</label>
            <select
              {...register('type')}
              className="ui-field"
            >
              {(Object.keys(investmentTypeLabels) as Array<keyof typeof investmentTypeLabels>).map((k) => (
                <option key={k} value={k}>
                  {investmentTypeLabels[k]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="ui-label">Valor investido</label>
            <Controller
              name="invested_amount"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value ?? 0}
                  onChange={field.onChange}
                  placeholder="R$ 0,00"
                />
              )}
            />
            {errors.invested_amount && (
              <p className="mt-1 text-sm text-danger-500">
                {errors.invested_amount.message}
              </p>
            )}
          </div>

          <div>
            <label className="ui-label">Valor atual</label>
            <Controller
              name="current_amount"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value ?? 0}
                  onChange={field.onChange}
                  placeholder="R$ 0,00"
                />
              )}
            />
            {errors.current_amount && (
              <p className="mt-1 text-sm text-danger-500">
                {errors.current_amount.message}
              </p>
            )}
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
