import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useAccounts } from '../contexts/AccountsContext'
import { useAuth } from '../contexts/AuthContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import type { AccountType } from '../types'

const schema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  type: z.enum(['checking', 'savings', 'investment', 'other'] as const),
  initial_balance: z.number().min(0, 'Saldo inicial não pode ser negativo'),
  include_in_net_worth: z.boolean(),
})

type FormData = z.infer<typeof schema>

const accountTypes: { value: AccountType; label: string }[] = [
  { value: 'checking', label: 'Conta corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'investment', label: 'Investimento' },
  { value: 'other', label: 'Outra' },
]

export function NewAccountPage() {
  const navigate = useNavigate()
  const { addAccount } = useAccounts()
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
      type: 'checking',
      initial_balance: 0,
      include_in_net_worth: true,
    },
  })

  useEffect(() => {
    setTitle('Nova conta')
    return () => setTitle('', null)
  }, [setTitle])

  const onSubmit = async (data: FormData) => {
    const created = await addAccount({
      user_id: user?.id ?? '',
      name: data.name.trim(),
      institution: null,
      type: data.type,
      initial_balance: data.initial_balance,
      allows_investments: data.type === 'investment',
      created_at: new Date().toISOString(),
      status: 'active',
      notes: null,
      include_in_net_worth: data.include_in_net_worth,
    })
    if (!created) return
    navigate(`/accounts/${created.id}`)
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
              placeholder="Ex: Conta Corrente"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-danger-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="ui-label">Tipo</label>
            <select
              {...register('type')}
              className="ui-field"
            >
              {accountTypes.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="ui-label">Saldo inicial</label>
            <Controller
              name="initial_balance"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value ?? 0}
                  onChange={field.onChange}
                  placeholder="R$ 0,00"
                />
              )}
            />
            {errors.initial_balance && (
              <p className="mt-1 text-sm text-danger-500">
                {errors.initial_balance.message}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <Controller
              name="include_in_net_worth"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  id="include_in_net_worth"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)] dark:focus:ring-brand-400"
                />
              )}
            />
            <label
              htmlFor="include_in_net_worth"
              className="text-sm font-medium text-slate-700 dark:text-[var(--text-secondary)]"
            >
              Incluir saldo desta conta no patrimônio líquido
              <span className="mt-1 block text-xs font-normal text-ds-muted">
                Desmarque se você usa a conta só para classificar lançamentos e
                não quer que o saldo em caixa afete a visão geral.
              </span>
            </label>
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
