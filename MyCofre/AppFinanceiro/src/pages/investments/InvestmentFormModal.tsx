import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import { EmptyState } from '../../components/ui/EmptyState'
import { useInvestments } from '../../contexts/InvestmentsContext'
import { useAccounts } from '../../contexts/AccountsContext'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Trash2, TrendingUp } from 'lucide-react'

const schemaNew = z.object({
  name: z.string().min(1, 'Informe o nome'),
  account_id: z.string().optional(),
  type: z.enum(['fixed_income', 'variable_income', 'crypto']),
  invested_amount: z.number().min(0, 'Valor não pode ser negativo'),
  current_amount: z.number().min(0, 'Valor não pode ser negativo'),
})
type FormDataNew = z.infer<typeof schemaNew>

const schemaEdit = z.object({
  name: z.string().min(1, 'Informe o nome do ativo'),
  account_id: z.string().optional(),
  institution: z.string().optional(),
  type: z.enum(['fixed_income', 'variable_income', 'crypto']),
  invested_amount: z.number().min(0, 'Valor não pode ser negativo'),
  current_amount: z.number().min(0, 'Valor não pode ser negativo'),
  created_at: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'sold', 'closed']).optional(),
})
type FormDataEdit = z.infer<typeof schemaEdit>

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

function toDateInputValue(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toISOString().slice(0, 10)
}

export function InvestmentFormModal() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getInvestmentById } = useInvestments()
  const investment = id ? getInvestmentById(id) : undefined
  const isEdit = Boolean(id)

  const goBack = () => navigate('/investments')

  if (isEdit && id && !investment) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Investimento não encontrado"
        description="O ativo pode ter sido removido ou o link está incorreto."
      >
        <Button type="button" variant="secondary" onClick={goBack}>
          Voltar aos investimentos
        </Button>
      </EmptyState>
    )
  }

  if (isEdit && investment && id) {
    return (
      <InvestmentEditForm investmentId={id} investment={investment} onClose={goBack} />
    )
  }

  return <InvestmentNewForm onClose={goBack} />
}

function InvestmentNewForm({ onClose }: { onClose: () => void }) {
  const { addInvestment } = useInvestments()
  const { accounts } = useAccounts()
  const { user } = useAuth()
  const { success } = useToast()
  const accountsWithInvestments = accounts.filter((a) => a.allows_investments)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormDataNew>({
    resolver: zodResolver(schemaNew),
    defaultValues: {
      type: 'fixed_income',
      invested_amount: 0,
      current_amount: 0,
    },
  })

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const accountId =
          data.account_id && data.account_id.trim() !== ''
            ? data.account_id
            : null
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
        success('Investimento adicionado.')
        onClose()
      })}
      className="space-y-4"
    >
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
        <label className="ui-label">
          Conta vinculada (opcional)
        </label>
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
          <p className="mt-1 text-sm text-danger-500">{errors.account_id.message}</p>
        )}
      </div>
      <div>
        <label className="ui-label">Tipo</label>
        <select
          {...register('type')}
          className="ui-field"
        >
          {(Object.keys(investmentTypeLabels) as Array<keyof typeof investmentTypeLabels>).map(
            (k) => (
              <option key={k} value={k}>
                {investmentTypeLabels[k]}
              </option>
            )
          )}
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
          <p className="mt-1 text-sm text-danger-500">{errors.invested_amount.message}</p>
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
          <p className="mt-1 text-sm text-danger-500">{errors.current_amount.message}</p>
        )}
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

function InvestmentEditForm({
  investmentId,
  investment,
  onClose,
}: {
  investmentId: string
  investment: {
    name: string
    account_id: string | null
    institution?: string | null
    type: 'fixed_income' | 'variable_income' | 'crypto'
    invested_amount: number
    current_amount: number
    created_at?: string | null
    notes?: string | null
    status?: string | null
  }
  onClose: () => void
}) {
  const { updateInvestment, deleteInvestment } = useInvestments()
  const { accounts } = useAccounts()
  const { success } = useToast()
  const accountsWithInvestments = accounts.filter((a) => a.allows_investments)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormDataEdit>({
    resolver: zodResolver(schemaEdit),
    defaultValues: {
      name: investment.name,
      account_id: investment.account_id ?? '',
      institution: investment.institution ?? '',
      type: investment.type,
      invested_amount: investment.invested_amount,
      current_amount: investment.current_amount,
      created_at: toDateInputValue(investment.created_at),
      notes: investment.notes ?? '',
      status: (investment.status as 'active' | 'sold' | 'closed') ?? 'active',
    },
  })

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const accountId =
          data.account_id && data.account_id.trim() !== ''
            ? data.account_id
            : null
        const ok = await updateInvestment(investmentId, {
          name: data.name,
          account_id: accountId,
          institution: data.institution || null,
          type: data.type,
          invested_amount: data.invested_amount,
          current_amount: data.current_amount,
          created_at: data.created_at
            ? new Date(data.created_at + 'T12:00:00').toISOString()
            : undefined,
          notes: data.notes || null,
          status: data.status ?? null,
        })
        if (!ok) return
        success('Investimento atualizado.')
        onClose()
      })}
      className="space-y-4"
    >
      <div>
        <label className="ui-label">Nome do ativo</label>
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
        <select {...register('account_id')} className="ui-field">
          <option value="">
            Sem conta (opcional) — use para investimentos só de acompanhamento
          </option>
          {accountsWithInvestments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
              {a.institution ? ` (${a.institution})` : ''}
            </option>
          ))}
        </select>
        {errors.account_id && (
          <p className="mt-1 text-sm text-danger-500">{errors.account_id.message}</p>
        )}
      </div>
      <div>
        <label className="ui-label">Instituição (opcional)</label>
        <input
          type="text"
          {...register('institution')}
          className="ui-field"
          placeholder="Ex: Corretora XYZ"
        />
      </div>
      <div>
        <label className="ui-label">Tipo do ativo</label>
        <select {...register('type')} className="ui-field">
          {(Object.keys(investmentTypeLabels) as Array<keyof typeof investmentTypeLabels>).map(
            (k) => (
              <option key={k} value={k}>
                {investmentTypeLabels[k]}
              </option>
            )
          )}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>
      <div>
        <label className="ui-label">Data de início (opcional)</label>
        <input type="date" {...register('created_at')} className="ui-field" />
      </div>
      <div>
        <label className="ui-label">Observações (opcional)</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="ui-field"
          placeholder="Notas sobre o investimento"
        />
      </div>
      <div>
        <label className="ui-label">Status</label>
        <select {...register('status')} className="ui-field">
          {(Object.keys(investmentStatusLabels) as Array<keyof typeof investmentStatusLabels>).map(
            (k) => (
              <option key={k} value={k}>
                {investmentStatusLabels[k]}
              </option>
            )
          )}
        </select>
      </div>
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="danger"
          onClick={() => {
            if (
              !window.confirm(
                'Tem certeza que deseja excluir este investimento? Essa ação não poderá ser desfeita.'
              )
            ) {
              return
            }
            void (async () => {
              const ok = await deleteInvestment(investmentId)
              if (!ok) return
              success('Investimento excluído.')
              onClose()
            })()
          }}
        >
          <Trash2 className="h-4 w-4" />
          Excluir investimento
        </Button>
        <div className="flex flex-wrap items-center justify-end gap-3 sm:ml-auto">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar alterações</Button>
        </div>
      </div>
    </form>
  )
}
