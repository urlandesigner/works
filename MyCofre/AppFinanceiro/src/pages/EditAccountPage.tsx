import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useAccounts } from '../contexts/AccountsContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { useToast } from '../contexts/ToastContext'
import { Trash2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Informe o nome da conta'),
  institution: z.string().optional(),
  type: z.enum(['checking', 'savings', 'investment', 'other']),
  initial_balance: z.number().min(0, 'Saldo inicial não pode ser negativo'),
  allows_investments: z.boolean(),
  include_in_net_worth: z.boolean(),
  status: z.enum(['active', 'closed']).optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

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

export function EditAccountPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getAccountById, updateAccount, deleteAccount } = useAccounts()
  const { success } = useToast()
  const account = id ? getAccountById(id) : undefined

  const defaultValues: FormData = account
    ? {
        name: account.name,
        institution: account.institution ?? '',
        type: account.type,
        initial_balance: account.initial_balance,
        allows_investments: account.allows_investments,
        include_in_net_worth: account.include_in_net_worth !== false,
        status: account.status ?? 'active',
        notes: account.notes ?? '',
      }
    : {
        name: '',
        institution: '',
        type: 'checking',
        initial_balance: 0,
        allows_investments: false,
        include_in_net_worth: true,
        status: 'active',
        notes: '',
      }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { setTitle } = useHeaderActions()
  useEffect(() => {
    if (account) {
      reset({
        name: account.name,
        institution: account.institution ?? '',
        type: account.type,
        initial_balance: account.initial_balance,
        allows_investments: account.allows_investments,
        include_in_net_worth: account.include_in_net_worth !== false,
        status: account.status ?? 'active',
        notes: account.notes ?? '',
      })
    }
  }, [account, reset])
  useEffect(() => {
    if (!id) setTitle('Editar conta')
    else if (!account) setTitle('Conta não encontrada', 'A conta solicitada não existe.')
    else setTitle('Editar conta', `${account.name} · ${id}`)
    return () => setTitle('', null)
  }, [id, account, setTitle])

  const onSubmit = async (data: FormData) => {
    if (!id) return
    const ok = await updateAccount(id, {
      name: data.name,
      institution: data.institution || null,
      type: data.type,
      initial_balance: data.initial_balance,
      allows_investments: data.allows_investments,
      include_in_net_worth: data.include_in_net_worth,
      status: data.status ?? null,
      notes: data.notes || null,
    })
    if (!ok) return
    navigate(`/accounts/${id}`)
  }

  const onCancel = () => {
    navigate(id ? `/accounts/${id}` : '/accounts')
  }

  const onDelete = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button to={`/accounts/${id}`} variant="secondary">
          Voltar ao detalhe
        </Button>
      </div>

      <Card className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="ui-label">Nome da conta</label>
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
            <label className="ui-label">Instituição (opcional)</label>
            <input
              type="text"
              {...register('institution')}
              className="ui-field"
              placeholder="Ex: Banco do Brasil"
            />
          </div>

          <div>
            <label className="ui-label">Tipo da conta</label>
            <select
              {...register('type')}
              className="ui-field"
            >
              {(Object.keys(accountTypeLabels) as Array<keyof typeof accountTypeLabels>).map((k) => (
                <option key={k} value={k}>
                  {accountTypeLabels[k]}
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allows_investments"
              {...register('allows_investments')}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)] dark:focus:ring-brand-400"
            />
            <label
              htmlFor="allows_investments"
              className="text-sm font-medium text-slate-700 dark:text-[var(--text-secondary)]"
            >
              Conta permite investimentos vinculados
            </label>
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
                Desmarque se você não controla o saldo em caixa desta conta.
                Investimentos vinculados continuam contando no patrimônio líquido.
              </span>
            </label>
          </div>

          <div>
            <label className="ui-label">Status</label>
            <select
              {...register('status')}
              className="ui-field"
            >
              {(Object.keys(accountStatusLabels) as Array<keyof typeof accountStatusLabels>).map((k) => (
                <option key={k} value={k}>
                  {accountStatusLabels[k]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="ui-label">Observações (opcional)</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="ui-field"
              placeholder="Notas sobre a conta"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button type="button" variant="danger" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Excluir conta
            </Button>
            <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">Salvar alterações</Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}
