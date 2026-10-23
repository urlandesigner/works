import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import { EmptyState } from '../../components/ui/EmptyState'
import { useAccounts } from '../../contexts/AccountsContext'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import type { AccountType } from '../../types'
import { Trash2, Wallet } from 'lucide-react'

const schemaNew = z.object({
  name: z.string().min(1, 'Informe o nome'),
  type: z.enum(['checking', 'savings', 'investment', 'other'] as const),
  initial_balance: z.number().min(0, 'Saldo inicial não pode ser negativo'),
  include_in_net_worth: z.boolean(),
})
type FormDataNew = z.infer<typeof schemaNew>

const schemaEdit = z.object({
  name: z.string().min(1, 'Informe o nome da conta'),
  institution: z.string().optional(),
  type: z.enum(['checking', 'savings', 'investment', 'other']),
  initial_balance: z.number().min(0, 'Saldo inicial não pode ser negativo'),
  allows_investments: z.boolean(),
  include_in_net_worth: z.boolean(),
  status: z.enum(['active', 'closed']).optional(),
  notes: z.string().optional(),
})
type FormDataEdit = z.infer<typeof schemaEdit>

const accountTypes: { value: AccountType; label: string }[] = [
  { value: 'checking', label: 'Conta corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'investment', label: 'Investimento' },
  { value: 'other', label: 'Outra' },
]

const accountStatusLabels: Record<string, string> = {
  active: 'Ativa',
  closed: 'Encerrada',
}

export function AccountFormModal() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getAccountById, addAccount, updateAccount, deleteAccount } = useAccounts()
  const { user } = useAuth()
  const { success } = useToast()
  const uid = user?.id ?? ''
  const account = id ? getAccountById(id) : undefined
  const isEdit = Boolean(id)

  const goBack = () => navigate('/accounts')

  const formNew = useForm<FormDataNew>({
    resolver: zodResolver(schemaNew),
    defaultValues: {
      type: 'checking',
      initial_balance: 0,
      include_in_net_worth: true,
    },
  })

  const defaultEdit: FormDataEdit = account
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

  const formEdit = useForm<FormDataEdit>({
    resolver: zodResolver(schemaEdit),
    defaultValues: defaultEdit,
  })

  useEffect(() => {
    if (account && isEdit) {
      formEdit.reset({
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
  }, [account, isEdit, formEdit])

  if (isEdit && id && !account) {
    return (
      <EmptyState
        icon={Wallet}
        title="Conta não encontrada"
        description="Ela pode ter sido excluída ou o link está incorreto."
      >
        <Button type="button" variant="secondary" onClick={goBack}>
          Voltar às contas
        </Button>
      </EmptyState>
    )
  }

  if (isEdit && account) {
    const { register, control, formState: { errors } } = formEdit
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
        goBack()
      })()
    }

    return (
      <form onSubmit={formEdit.handleSubmit(async (data) => {
        const ok = await updateAccount(id!, {
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
        success('Conta atualizada.')
        goBack()
      })} className="space-y-4">
        <div>
          <label className="ui-label">Nome da conta</label>
          <input
            type="text"
            {...register('name')}
            className="ui-field"
            placeholder="Ex: Conta Corrente"
          />
          {errors.name && <p className="mt-1 text-sm text-danger-500">{errors.name.message}</p>}
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
          <label className="ui-label">Tipo</label>
          <select
            {...register('type')}
            className="ui-field"
          >
            {accountTypes.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
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
          {errors.initial_balance && <p className="mt-1 text-sm text-danger-500">{errors.initial_balance.message}</p>}
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
                id="include_in_net_worth_edit"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)] dark:focus:ring-brand-400"
              />
            )}
          />
          <label
            htmlFor="include_in_net_worth_edit"
            className="text-sm font-medium text-slate-700 dark:text-[var(--text-secondary)]"
          >
            Incluir saldo desta conta no patrimônio líquido
            <span className="mt-1 block text-xs font-normal text-ds-muted">
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
              <option key={k} value={k}>{accountStatusLabels[k]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="ui-label">Observações (opcional)</label>
          <textarea
            {...register('notes')}
            rows={2}
            className="ui-field"
            placeholder="Notas sobre a conta"
          />
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="danger" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Excluir conta
          </Button>
          <div className="flex flex-wrap items-center justify-end gap-3 sm:ml-auto">
            <Button type="button" variant="secondary" onClick={goBack}>
              Cancelar
            </Button>
            <Button type="submit">Salvar alterações</Button>
          </div>
        </div>
      </form>
    )
  }

  const { register, control, formState: { errors } } = formNew
  return (
    <form onSubmit={formNew.handleSubmit(async (data) => {
      const row = await addAccount({
        user_id: uid,
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
      if (!row) return
      success('Conta criada com sucesso.')
      goBack()
    })} className="space-y-4">
    <div>
      <label className="ui-label">Nome</label>
      <input
        type="text"
        {...register('name')}
        className="ui-field"
        placeholder="Ex: Conta Corrente"
      />
      {errors.name && <p className="mt-1 text-sm text-danger-500">{errors.name.message}</p>}
    </div>
    <div>
      <label className="ui-label">Tipo</label>
      <select
        {...register('type')}
        className="ui-field"
      >
        {accountTypes.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
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
      {errors.initial_balance && <p className="mt-1 text-sm text-danger-500">{errors.initial_balance.message}</p>}
    </div>
    <div className="flex items-start gap-2">
      <Controller
        name="include_in_net_worth"
        control={control}
        render={({ field }) => (
          <input
            type="checkbox"
            id="include_in_net_worth_new"
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)] dark:focus:ring-brand-400"
          />
        )}
      />
      <label
        htmlFor="include_in_net_worth_new"
        className="text-sm font-medium text-slate-700 dark:text-[var(--text-secondary)]"
      >
        Incluir saldo desta conta no patrimônio líquido
        <span className="mt-1 block text-xs font-normal text-ds-muted">
          Desmarque se a conta é só para classificar lançamentos.
        </span>
      </label>
    </div>
    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
      <Button type="button" variant="secondary" onClick={goBack}>
        Cancelar
      </Button>
      <Button type="submit">Salvar</Button>
    </div>
  </form>
  )
}
