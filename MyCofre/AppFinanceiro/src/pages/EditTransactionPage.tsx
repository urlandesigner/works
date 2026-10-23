import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useTransactions } from '../contexts/TransactionsContext'
import { useAccounts } from '../contexts/AccountsContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { mockCategories } from '../data'

const schema = z.object({
  type: z.enum(['income', 'expense']),
  description: z.string().optional(),
  amount: z.number().positive('Valor deve ser maior que zero'),
  account_id: z.string().optional(),
  category_id: z.string().min(1, 'Selecione uma categoria'),
  transaction_date: z.string().min(1, 'Informe a data'),
  notes: z.string().optional(),
  recurring: z.boolean(),
})

type FormData = z.infer<typeof schema>

export function EditTransactionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setTitle } = useHeaderActions()
  const {
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    loading: transactionsLoading,
  } = useTransactions()
  const { accounts } = useAccounts()
  const transaction = id ? getTransactionById(id) : undefined

  useEffect(() => {
    if (!id) setTitle('Transação')
    else if (!transaction) setTitle('Transação não encontrada', 'A transação pode ter sido excluída.')
    else setTitle('Editar transação', `${transaction.description || 'Transação'} · ${id}`)
    return () => setTitle('', null)
  }, [id, transaction, setTitle])

  const incomeCategories = mockCategories.filter((c) => c.type === 'income')
  const expenseCategories = mockCategories.filter((c) => c.type === 'expense')

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: transaction
      ? {
          type: transaction.type,
          description: transaction.description ?? '',
          amount: transaction.amount,
          account_id: transaction.account_id ?? '',
          category_id: transaction.category_id,
          transaction_date: transaction.transaction_date,
          notes: transaction.notes ?? '',
          recurring: transaction.recurring ?? false,
        }
      : {
          type: 'expense',
          description: '',
          amount: 0,
          account_id: '',
          category_id: '',
          transaction_date: new Date().toISOString().slice(0, 10),
          notes: '',
          recurring: false,
        },
  })

  const type = watch('type')
  const categories = type === 'income' ? incomeCategories : expenseCategories

  const onSubmit = async (data: FormData) => {
    if (!id) return
    const ok = await updateTransaction(id, {
      type: data.type,
      description: data.description || null,
      amount: data.amount,
      account_id: data.account_id?.trim() || null,
      category_id: data.category_id,
      transaction_date: data.transaction_date,
      notes: data.notes || null,
      recurring: data.recurring,
      recurrence: data.recurring ? 'monthly' : 'none',
    })
    if (ok) {
      navigate(id ? `/transactions/${id}` : '/transactions')
    }
  }

  const onDelete = () => {
    if (!id) return
    if (
      window.confirm('Excluir esta transação? Esta ação não pode ser desfeita.')
    ) {
      void (async () => {
        const ok = await deleteTransaction(id)
        if (ok) {
          navigate('/transactions')
        }
      })()
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button to={id ? `/transactions/${id}` : '/transactions'} variant="secondary">
          Voltar ao detalhe
        </Button>
      </div>

      <Card className="max-w-lg">
        <form onSubmit={handleSubmit((d) => void onSubmit(d))} className="space-y-4">
          <div>
            <label className="ui-label">Tipo</label>
            <select
              {...register('type')}
              className="ui-field"
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </div>

          <div>
            <label className="ui-label">Conta (opcional)</label>
            <select
              {...register('account_id')}
              className="ui-field"
            >
              <option value="">Sem conta vinculada</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="ui-label">Categoria</label>
            <select
              {...register('category_id')}
              className="ui-field"
            >
              <option value="">Selecione</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-sm text-danger-500">
                {errors.category_id.message}
              </p>
            )}
          </div>

          <div>
            <label className="ui-label">Descrição (opcional)</label>
            <input
              type="text"
              {...register('description')}
              className="ui-field"
              placeholder="Ex: Supermercado"
            />
          </div>

          <div>
            <label className="ui-label">Valor</label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value ?? 0}
                  onChange={field.onChange}
                  placeholder="R$ 0,00"
                />
              )}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-danger-500">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <label className="ui-label">Data</label>
            <input
              type="date"
              {...register('transaction_date')}
              className="ui-field"
            />
            {errors.transaction_date && (
              <p className="mt-1 text-sm text-danger-500">
                {errors.transaction_date.message}
              </p>
            )}
          </div>

          <div>
            <label className="ui-label">Observações (opcional)</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="ui-field"
              placeholder="Notas sobre esta transação"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              {...register('recurring')}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)] dark:focus:ring-brand-400"
            />
            <label
              htmlFor="recurring"
              className="text-sm font-medium text-slate-700 dark:text-[var(--text-secondary)]"
            >
              Transação recorrente
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button type="button" variant="danger" onClick={onDelete}>
              Excluir transação
            </Button>
            <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
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
