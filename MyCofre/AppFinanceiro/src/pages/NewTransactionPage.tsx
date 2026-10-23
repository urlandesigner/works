import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useTransactions } from '../contexts/TransactionsContext'
import { useAccounts } from '../contexts/AccountsContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { mockCategories } from '../data'

const schema = z.object({
  account_id: z.string().optional(),
  category_id: z.string().min(1, 'Selecione uma categoria'),
  type: z.enum(['income', 'expense']),
  description: z.string().optional(),
  amount: z.number().positive('Valor deve ser maior que zero'),
  transaction_date: z.string().min(1, 'Informe a data'),
})

type FormData = z.infer<typeof schema>

const incomeCategories = mockCategories.filter((c) => c.type === 'income')
const expenseCategories = mockCategories.filter((c) => c.type === 'expense')

export function NewTransactionPage() {
  const navigate = useNavigate()
  const { addTransaction } = useTransactions()
  const { accounts } = useAccounts()
  const { user } = useAuth()
  const { error: toastError } = useToast()
  const { setTitle } = useHeaderActions()
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'expense', transaction_date: new Date().toISOString().slice(0, 10) },
  })

  useEffect(() => {
    setTitle('Nova transação')
    return () => setTitle('', null)
  }, [setTitle])

  const type = watch('type')
  const categories = type === 'income' ? incomeCategories : expenseCategories

  const onSubmit = async (data: FormData) => {
    const uid = user?.id
    if (!uid) {
      toastError('Sessão inválida. Faça login novamente.')
      return
    }
    const ok = await addTransaction({
      user_id: uid,
      account_id: data.account_id?.trim() || null,
      category_id: data.category_id,
      type: data.type,
      description: data.description || null,
      amount: data.amount,
      transaction_date: data.transaction_date,
      notes: null,
      recurring: false,
      recurrence: 'none',
    })
    if (ok) {
      navigate('/transactions')
    }
  }

  return (
    <div className="space-y-6">
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
              <p className="mt-1 text-sm text-danger-500">{errors.category_id.message}</p>
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
              <p className="mt-1 text-sm text-danger-500">{errors.amount.message}</p>
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
              <p className="mt-1 text-sm text-danger-500">{errors.transaction_date.message}</p>
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
