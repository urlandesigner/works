import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clsx } from 'clsx'
import { Button } from '../../components/ui/Button'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import { EmptyState } from '../../components/ui/EmptyState'
import { useTransactions } from '../../contexts/TransactionsContext'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import { useAccounts } from '../../contexts/AccountsContext'
import { useCreditCards } from '../../contexts/CreditCardsContext'
import type { Transaction } from '../../types'
import { useCategories } from '../../contexts/CategoriesContext'
import {
  getMostUsedAccountId,
  suggestCategoryIdFromDescription,
} from '../../lib/transactionFormIntelligence'
import { getTodayIsoLocal } from '../../lib/format'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  FileQuestion,
} from 'lucide-react'

const recurrenceOptions: { value: 'none' | 'monthly' | 'yearly'; label: string }[] = [
  { value: 'none', label: 'Nenhuma (data única)' },
  { value: 'monthly', label: 'Mensal (mesmo dia do mês)' },
  { value: 'yearly', label: 'Anual (mesmo dia e mês)' },
]

const schemaNew = z.object({
  account_id: z.string().optional(),
  category_id: z.string().min(1, 'Selecione uma categoria'),
  type: z.enum(['income', 'expense']),
  description: z.string().optional(),
  amount: z.number().positive('Valor deve ser maior que zero'),
  transaction_date: z.string().min(1, 'Informe a data'),
  recurrence: z.enum(['none', 'monthly', 'yearly']),
  notes: z.string().optional(),
  credit_card_id: z.string().optional(),
  exclude_from_month_expense_summary: z.boolean().optional(),
})
type FormDataNew = z.infer<typeof schemaNew>

const schemaEdit = z.object({
  type: z.enum(['income', 'expense']),
  description: z.string().optional(),
  amount: z.number().positive('Valor deve ser maior que zero'),
  account_id: z.string().optional(),
  category_id: z.string().min(1, 'Selecione uma categoria'),
  transaction_date: z.string().min(1, 'Informe a data'),
  notes: z.string().optional(),
  recurrence: z.enum(['none', 'monthly', 'yearly']),
  credit_card_id: z.string().optional(),
  exclude_from_month_expense_summary: z.boolean().optional(),
})
type FormDataEdit = z.infer<typeof schemaEdit>

export function TransactionFormModal() {
  const mdUp = useMediaQuery('(min-width: 768px)')
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTransactionById, loading: transactionsLoading } = useTransactions()
  const transaction = id ? getTransactionById(id) : undefined
  const isEdit = Boolean(id)

  const goBack = () => navigate('/transactions')

  if (isEdit && id && transactionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600"
          aria-hidden
        />
        <p className="text-sm text-ds-muted">Carregando transação…</p>
      </div>
    )
  }

  if (isEdit && id && !transaction) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Transação não encontrada"
        description="Ela pode ter sido excluída ou o link está incorreto."
      >
        <Button type="button" variant="secondary" onClick={goBack}>
          Voltar às transações
        </Button>
      </EmptyState>
    )
  }

  if (isEdit && transaction && id) {
    return (
      <TransactionEditForm transactionId={id} transaction={transaction} onClose={goBack} />
    )
  }

  return (
    <TransactionNewForm
      onClose={goBack}
      variant={mdUp ? 'default' : 'sheet'}
    />
  )
}

/** Formulário de nova transação — reutilizável em modal ou bottom sheet. */
export function TransactionNewForm({
  onClose,
  variant = 'default',
}: {
  onClose: () => void
  /** `sheet`: layout mais denso para bottom sheet full-width no mobile. */
  variant?: 'default' | 'sheet'
}) {
  const { addTransaction, transactions } = useTransactions()
  const { accounts } = useAccounts()
  const { creditCards } = useCreditCards()
  const { user } = useAuth()
  const { error: toastError } = useToast()
  const { categories: allCategories } = useCategories()
  const incomeCategories = useMemo(
    () => allCategories.filter((c) => c.type === 'income'),
    [allCategories]
  )
  const expenseCategories = useMemo(
    () => allCategories.filter((c) => c.type === 'expense'),
    [allCategories]
  )
  const [showAdvanced, setShowAdvanced] = useState(false)

  const todayStr = useMemo(() => getTodayIsoLocal(), [])
  const defaultAccountId = useMemo(() => {
    const ids = new Set(accounts.map((a) => a.id))
    return getMostUsedAccountId(transactions, ids)
  }, [transactions, accounts])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setFocus,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormDataNew>({
    resolver: zodResolver(schemaNew),
    defaultValues: {
      type: 'expense',
      transaction_date: todayStr,
      recurrence: 'none',
      account_id: defaultAccountId,
      category_id: '',
      amount: 0,
      notes: '',
      credit_card_id: '',
      exclude_from_month_expense_summary: false,
    },
  })

  const type = watch('type')
  const categories = type === 'income' ? incomeCategories : expenseCategories
  const categoryId = watch('category_id')

  useEffect(() => {
    const valid = categories.some((c) => c.id === categoryId)
    if (!valid) {
      setValue('category_id', categories[0]?.id ?? '', { shouldValidate: true })
    }
  }, [type, categories, categoryId, setValue])

  const onDescriptionBlur = () => {
    const desc = getValues('description')?.trim() ?? ''
    if (!desc) return
    const currentType = getValues('type')
    const suggested = suggestCategoryIdFromDescription(desc, currentType)
    const list = currentType === 'income' ? incomeCategories : expenseCategories
    if (suggested && list.some((c) => c.id === suggested)) {
      setValue('category_id', suggested, { shouldValidate: true })
    }
  }

  const isToday = watch('transaction_date') === todayStr

  const onSubmitValid = async (data: FormDataNew) => {
    const uid = user?.id
    if (!uid) {
      toastError('Sessão inválida. Faça login novamente.')
      return
    }
    try {
      const ok = await addTransaction({
        user_id: uid,
        account_id: data.account_id?.trim() || null,
        category_id: data.category_id,
        type: data.type,
        description: data.description?.trim() || null,
        amount: data.amount,
        transaction_date: data.transaction_date,
        notes: data.notes?.trim() || null,
        recurring: data.recurrence !== 'none',
        recurrence: data.recurrence,
        credit_card_id:
          data.type === 'expense' && data.credit_card_id?.trim()
            ? data.credit_card_id.trim()
            : null,
        exclude_from_month_expense_summary:
          data.type === 'expense' &&
          data.exclude_from_month_expense_summary === true,
      })
      if (ok) {
        queueMicrotask(() => {
          onClose()
        })
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Não foi possível salvar a transação.'
      toastError(msg)
    }
  }

  const firstInvalidFieldOrder: (keyof FormDataNew)[] = [
    'amount',
    'category_id',
    'type',
    'transaction_date',
    'account_id',
    'description',
    'recurrence',
    'notes',
    'credit_card_id',
  ]

  const onSubmitInvalid = (fieldErrors: FieldErrors<FormDataNew>) => {
    const pick =
      firstInvalidFieldOrder.find((k) => fieldErrors[k]) ??
      (Object.keys(fieldErrors)[0] as keyof FormDataNew | undefined)

    if (pick) {
      setFocus(pick)
    }

    const messages = Object.values(fieldErrors)
      .map((e) =>
        e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string'
          ? (e as { message: string }).message
          : ''
      )
      .filter(Boolean)

    const summary =
      messages.length > 0
        ? messages.slice(0, 3).join(' · ')
        : 'Corrija os campos destacados antes de salvar.'
    toastError(summary)
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmitValid, onSubmitInvalid)}
      className={clsx(
        'min-w-0',
        variant === 'sheet'
          ? 'w-full max-w-full space-y-4 overflow-x-hidden'
          : 'space-y-5'
      )}
    >
      {variant === 'default' ? (
        <p className="text-sm text-ds-muted">
          Registre em poucos passos. Você pode ajustar tudo antes de salvar.
        </p>
      ) : null}

      {/* 1. Valor — destaque principal */}
      <div className="w-full max-w-full min-w-0 overflow-x-hidden rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/[0.10] dark:bg-zinc-900/40">
        <label
          htmlFor="new-tx-amount"
          className="mb-2 block text-xs font-medium uppercase tracking-wide text-ds-muted"
        >
          Quanto
        </label>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              id="new-tx-amount"
              value={field.value ?? 0}
              onChange={field.onChange}
              aria-describedby="new-tx-amount-hint"
              autoFocus
              className="w-full min-w-0 border-0 bg-transparent px-0 py-0 !text-3xl font-semibold tabular-nums text-slate-900 focus:border-transparent focus:ring-0 sm:!text-4xl dark:text-slate-100"
            />
          )}
        />
        <p
          id="new-tx-amount-hint"
          className="mt-2 text-xs text-ds-muted"
        >
          Digite apenas números: 1 = R$ 0,01; 1234 = R$ 12,34.
        </p>
        {errors.amount && (
          <p className="mt-1 text-sm text-danger-500" role="alert">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* 2. Tipo — segmentado */}
      <div>
        <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-ds-muted">
          Tipo
        </span>
        <div className="grid min-w-0 grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setValue('type', 'expense', { shouldValidate: true })}
            className={clsx(
              'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3.5 text-sm font-semibold transition',
              type === 'expense'
                ? 'border-danger-500/40 bg-red-50 text-danger-600 shadow-sm dark:border-red-400/35 dark:bg-red-950/40 dark:text-red-200 dark:shadow-none'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.10] dark:bg-zinc-900/50 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-slate-100'
            )}
          >
            <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden />
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setValue('type', 'income', { shouldValidate: true })}
            className={clsx(
              'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3.5 text-sm font-semibold transition',
              type === 'income'
                ? 'border-emerald-600/40 bg-emerald-50 text-emerald-800 shadow-sm dark:border-emerald-400/35 dark:bg-emerald-950/40 dark:text-emerald-200 dark:shadow-none'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.10] dark:bg-zinc-900/50 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-slate-100'
            )}
          >
            <ArrowDownLeft className="h-5 w-5 shrink-0" aria-hidden />
            Receita
          </button>
        </div>
        <input type="hidden" {...register('type')} />
      </div>

      {/* 3. Categoria */}
      <div className="min-w-0">
        <label htmlFor="new-tx-category" className="ui-label">
          Categoria
        </label>
        <select
          id="new-tx-category"
          {...register('category_id')}
          className="ui-field w-full max-w-full min-w-0"
        >
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

      {/* 4. Conta */}
      <div className="min-w-0">
        <label htmlFor="new-tx-account" className="ui-label">
          Conta
        </label>
        <select
          id="new-tx-account"
          {...register('account_id')}
          className="ui-field w-full max-w-full min-w-0"
        >
          <option value="">Sem conta vinculada</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-ds-muted">
          Pré-selecionamos a conta que você mais usa nas movimentações.
        </p>
      </div>

      {/* 5. Data — shell flex + input flex-1 alinha com selects e evita estouro WebKit */}
      <div className="min-w-0 w-full max-w-full">
        <label htmlFor="new-tx-date" className="ui-label">
          Data
        </label>
        <div className="flex w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-300 bg-white dark:border-[var(--border-default)] dark:bg-[rgba(39,39,42,0.55)]">
          <input
            id="new-tx-date"
            type="date"
            {...register('transaction_date')}
            className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-base text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm dark:text-[var(--text-primary)] dark:focus:ring-brand-400"
          />
        </div>
        {isToday ? (
          <p className="mt-1 text-xs text-ds-muted">
            Padrão: hoje
          </p>
        ) : null}
        {errors.transaction_date && (
          <p className="mt-1 text-sm text-danger-500">{errors.transaction_date.message}</p>
        )}
      </div>

      {/* 6. Descrição */}
      <div className="min-w-0">
        <label htmlFor="new-tx-desc" className="ui-label">
          Onde ou o quê{' '}
          <span className="font-normal text-ds-muted">
            (opcional)
          </span>
        </label>
        <input
          id="new-tx-desc"
          type="text"
          {...register('description')}
          onBlur={onDescriptionBlur}
          className="ui-field w-full max-w-full min-w-0"
          placeholder="Ex.: iFood, Uber, supermercado…"
        />
        <p className="mt-1 text-xs text-ds-muted">
          Ao sair do campo, sugerimos categoria quando reconhecemos o texto (ex.: iFood →
          Alimentação).
        </p>
      </div>

      {/* Transferência: modelo atual só income/expense — não exibida */}
      <div className="border-t border-slate-100 pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-[var(--text-secondary)] dark:hover:bg-white/[0.04]"
        >
          Mais opções
          {showAdvanced ? (
            <ChevronUp className="h-4 w-4 text-ds-muted dark:text-[var(--icon-default)]" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4 text-ds-muted dark:text-[var(--icon-default)]" aria-hidden />
          )}
        </button>
        {showAdvanced ? (
          <div className="mt-3 min-w-0 space-y-4 border-t border-slate-100 pt-4">
            <div className="min-w-0">
              <label className="ui-label">
                Recorrência
              </label>
              <select
                {...register('recurrence')}
                className="ui-field w-full max-w-full min-w-0"
              >
                {recurrenceOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className="ui-label">
                Observações{' '}
                <span className="font-normal text-ds-muted">
                  (opcional)
                </span>
              </label>
              <textarea
                {...register('notes')}
                rows={2}
                className="ui-field w-full max-w-full min-w-0"
                placeholder="Anotações só para você"
              />
            </div>
            {type === 'expense' ? (
              <>
                <div className="min-w-0">
                  <label htmlFor="new-tx-credit-card" className="ui-label">
                    Compra neste cartão{' '}
                    <span className="font-normal text-ds-muted">
                      (opcional)
                    </span>
                  </label>
                  <select
                    id="new-tx-credit-card"
                    {...register('credit_card_id')}
                    className="ui-field w-full max-w-full min-w-0"
                  >
                    <option value="">
                      Não — conta no total do mês como despesa normal
                    </option>
                    {creditCards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-ds-muted">
                    Se escolher um cartão, o valor não soma de novo no resumo do mês: use a
                    fatura com competência neste mês.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <input
                    id="new-tx-exclude-month"
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)] dark:focus:ring-brand-400"
                    {...register('exclude_from_month_expense_summary')}
                  />
                  <label
                    htmlFor="new-tx-exclude-month"
                    className="text-sm leading-snug text-slate-700 dark:text-[var(--text-secondary)]"
                  >
                    Excluir do total de despesas do mês (ex.: pagamento de fatura — afeta
                    o saldo da conta)
                  </label>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <div
        className={clsx(
          'flex min-w-0 flex-wrap items-center justify-end gap-3 pt-1',
          variant === 'sheet' && 'w-full max-w-full'
        )}
      >
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Salvar transação
        </Button>
      </div>
    </form>
  )
}

function TransactionEditForm({
  transactionId,
  transaction,
  onClose,
}: {
  transactionId: string
  transaction: Transaction
  onClose: () => void
}) {
  const { updateTransaction, deleteTransaction } = useTransactions()
  const { accounts } = useAccounts()
  const { creditCards } = useCreditCards()
  const { success, error: toastError } = useToast()
  const { categories } = useCategories()
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === 'income'),
    [categories]
  )
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense'),
    [categories]
  )
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormDataEdit>({
    resolver: zodResolver(schemaEdit),
    defaultValues: {
      type: transaction.type,
      description: transaction.description ?? '',
      amount: transaction.amount,
      account_id: transaction.account_id ?? '',
      category_id: transaction.category_id,
      transaction_date: transaction.transaction_date,
      notes: transaction.notes ?? '',
      recurrence:
        transaction.recurrence ??
        (transaction.recurring ? 'monthly' : 'none'),
      credit_card_id: transaction.credit_card_id ?? '',
      exclude_from_month_expense_summary:
        transaction.exclude_from_month_expense_summary === true,
    },
  })

  const type = watch('type')
  const categoriesForSelect =
    type === 'income' ? incomeCategories : expenseCategories

  const onDelete = () => {
    if (
      window.confirm('Excluir esta transação? Esta ação não pode ser desfeita.')
    ) {
      void (async () => {
        const ok = await deleteTransaction(transactionId)
        if (ok) {
          onClose()
          success('Transação excluída.')
        }
      })()
    }
  }

  const onEditSubmitValid = async (data: FormDataEdit) => {
    try {
      const ok = await updateTransaction(transactionId, {
        type: data.type,
        description: data.description || null,
        amount: data.amount,
        account_id: data.account_id?.trim() || null,
        category_id: data.category_id,
        transaction_date: data.transaction_date,
        notes: data.notes || null,
        recurring: data.recurrence !== 'none',
        recurrence: data.recurrence,
        credit_card_id:
          data.type === 'expense' && data.credit_card_id?.trim()
            ? data.credit_card_id.trim()
            : null,
        exclude_from_month_expense_summary:
          data.type === 'expense' &&
          data.exclude_from_month_expense_summary === true,
      })
      if (ok) {
        onClose()
        success('Transação atualizada.')
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Não foi possível atualizar a transação.'
      toastError(msg)
    }
  }

  const onEditSubmitInvalid = (errors: FieldErrors<FormDataEdit>) => {
    const messages = Object.values(errors)
      .map((e) =>
        e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string'
          ? (e as { message: string }).message
          : ''
      )
      .filter(Boolean)
    const summary =
      messages.length > 0
        ? messages.slice(0, 3).join(' · ')
        : 'Corrija os campos destacados antes de salvar.'
    toastError(summary)
  }

  return (
    <form
      onSubmit={handleSubmit(onEditSubmitValid, onEditSubmitInvalid)}
      className="min-w-0 space-y-4"
    >
      <div className="min-w-0">
        <label className="ui-label">Tipo</label>
        <select {...register('type')} className="ui-field w-full max-w-full min-w-0">
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>
      </div>
      <div className="min-w-0">
        <label className="ui-label">Conta (opcional)</label>
        <select {...register('account_id')} className="ui-field w-full max-w-full min-w-0">
          <option value="">Sem conta vinculada</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-0">
        <label className="ui-label">Categoria</label>
        <select {...register('category_id')} className="ui-field w-full max-w-full min-w-0">
          <option value="">Selecione</option>
          {categoriesForSelect.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="mt-1 text-sm text-danger-500">{errors.category_id.message}</p>
        )}
      </div>
      <div className="min-w-0">
        <label className="ui-label">Descrição (opcional)</label>
        <input
          type="text"
          {...register('description')}
          className="ui-field w-full max-w-full min-w-0"
          placeholder="Ex: Supermercado"
        />
      </div>
      <div className="min-w-0">
        <label htmlFor="edit-tx-amount" className="ui-label">
          Valor
        </label>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              id="edit-tx-amount"
              value={field.value ?? 0}
              onChange={field.onChange}
              aria-describedby="edit-tx-amount-hint"
              placeholder="R$ 0,00"
            />
          )}
        />
        <p
          id="edit-tx-amount-hint"
          className="mt-1 text-xs text-ds-muted"
        >
          Digite apenas números: 1 = R$ 0,01; 1234 = R$ 12,34.
        </p>
        {errors.amount && (
          <p className="mt-1 text-sm text-danger-500" role="alert">
            {errors.amount.message}
          </p>
        )}
      </div>
      <div className="min-w-0 w-full max-w-full">
        <label className="ui-label">Data</label>
        <div className="flex w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-300 bg-white dark:border-[var(--border-default)] dark:bg-[rgba(39,39,42,0.55)]">
          <input
            type="date"
            {...register('transaction_date')}
            className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-base text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm dark:text-[var(--text-primary)] dark:focus:ring-brand-400"
          />
        </div>
        {errors.transaction_date && (
          <p className="mt-1 text-sm text-danger-500">{errors.transaction_date.message}</p>
        )}
      </div>
      <div className="min-w-0">
        <label className="ui-label">Observações (opcional)</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="ui-field w-full max-w-full min-w-0"
          placeholder="Notas sobre esta transação"
        />
      </div>
      <div className="min-w-0">
        <label className="ui-label">Recorrência</label>
        <select {...register('recurrence')} className="ui-field w-full max-w-full min-w-0">
          {recurrenceOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {type === 'expense' ? (
        <>
          <div className="min-w-0">
            <label htmlFor="edit-tx-credit-card" className="ui-label">
              Compra neste cartão{' '}
              <span className="font-normal text-ds-muted">
                (opcional)
              </span>
            </label>
            <select
              id="edit-tx-credit-card"
              {...register('credit_card_id')}
              className="ui-field w-full max-w-full min-w-0"
            >
              <option value="">Não — conta no total do mês como despesa normal</option>
              {creditCards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ds-muted">
              Se escolher um cartão, o valor não soma de novo no resumo do mês: use a
              fatura com competência neste mês.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <input
              id="edit-tx-exclude-month"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)] dark:focus:ring-brand-400"
              {...register('exclude_from_month_expense_summary')}
            />
            <label
              htmlFor="edit-tx-exclude-month"
              className="text-sm leading-snug text-slate-700 dark:text-[var(--text-secondary)]"
            >
              Excluir do total de despesas do mês (ex.: pagamento de fatura — afeta o
              saldo da conta)
            </label>
          </div>
        </>
      ) : null}
      <div className="flex min-w-0 flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="danger" onClick={onDelete}>
          Excluir transação
        </Button>
        <div className="flex flex-wrap items-center justify-end gap-3 sm:ml-auto">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Salvar alterações
          </Button>
        </div>
      </div>
    </form>
  )
}
