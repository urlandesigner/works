import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useGoals } from '../contexts/GoalsContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { useToast } from '../contexts/ToastContext'
import { useAccounts } from '../contexts/AccountsContext'
import { useTransactions } from '../contexts/TransactionsContext'
import { getNetPatrimony } from '../lib/balance'
import { useCreditCards } from '../contexts/CreditCardsContext'
import { useInvestmentsForNetWorth } from '../hooks/useInvestmentsForNetWorth'
import { getGoalType } from '../lib/goalProgress'
import type { GoalType } from '../types'

const schema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  target_amount: z.number().positive('Meta deve ser maior que zero'),
  goal_type: z.enum(['manual', 'net_worth']),
  current_amount: z.number().min(0, 'Valor atual não pode ser negativo'),
})
type FormData = z.infer<typeof schema>

const goalTypeCardClass =
  'group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out active:scale-[0.99] motion-reduce:active:scale-100 border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 dark:border-[var(--border-default)] dark:bg-[var(--bg-surface)] dark:hover:border-white/[0.16] dark:hover:bg-white/[0.04] has-[:checked]:border-brand-400/70 has-[:checked]:bg-brand-50/60 has-[:checked]:shadow-sm dark:has-[:checked]:border-brand-400/55 dark:has-[:checked]:bg-brand-500/14 dark:has-[:checked]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500/45 has-[:focus-visible]:ring-offset-2 dark:has-[:focus-visible]:ring-brand-400/45 dark:has-[:focus-visible]:ring-offset-zinc-900'

export function EditGoalPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getGoalById, updateGoal, loading: goalsLoading } = useGoals()
  const goal = id ? getGoalById(id) : undefined
  const { accounts } = useAccounts()
  const { transactions } = useTransactions()
  const { investmentsForNetWorth } = useInvestmentsForNetWorth()
  const { creditCards, getBillsByCardId } = useCreditCards()

  const allCreditCardBills = useMemo(
    () => creditCards.flatMap((c) => getBillsByCardId(c.id)),
    [creditCards, getBillsByCardId]
  )

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', target_amount: 0, current_amount: 0, goal_type: 'manual' },
  })

  const goalType = useWatch({ control, name: 'goal_type' })
  const prevGoalTypeRef = useRef<GoalType | null>(null)

  const { setTitle } = useHeaderActions()
  const { success } = useToast()
  useEffect(() => {
    if (goal) {
      const type = getGoalType(goal)
      reset({
        name: goal.name,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount,
        goal_type: type,
      })
      prevGoalTypeRef.current = type
    }
  }, [goal, reset])

  useEffect(() => {
    const prev = prevGoalTypeRef.current
    if (prev === null || prev === goalType) return
    prevGoalTypeRef.current = goalType
    if (prev === 'net_worth' && goalType === 'manual') {
      setValue(
        'current_amount',
        getNetPatrimony(
          accounts,
          transactions,
          investmentsForNetWorth,
          allCreditCardBills
        )
      )
    }
    if (prev === 'manual' && goalType === 'net_worth') {
      setValue('current_amount', 0)
    }
  }, [
    goalType,
    accounts,
    transactions,
    investmentsForNetWorth,
    allCreditCardBills,
    setValue,
  ])

  useEffect(() => {
    if (!id) setTitle('Editar meta')
    else if (!goal) setTitle('Meta não encontrada', 'A meta pode ter sido excluída.')
    else setTitle('Editar meta', `${goal.name} · ${id}`)
    return () => setTitle('', null)
  }, [id, goal, setTitle])

  if (!id) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="py-4 text-sm text-ds-muted">
            Identificador não informado.
          </p>
          <Button to="/goals" variant="secondary">
            Voltar às metas
          </Button>
        </Card>
      </div>
    )
  }

  if (goalsLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600"
          aria-hidden
        />
        <p className="text-sm text-ds-muted">Carregando meta…</p>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="space-y-6">
        <Card>
          <Button to="/goals" variant="secondary">
            Voltar às metas
          </Button>
        </Card>
      </div>
    )
  }

  const onSubmit = async (data: FormData) => {
    const ok = await updateGoal(id, {
      name: data.name.trim(),
      target_amount: data.target_amount,
      current_amount: data.goal_type === 'net_worth' ? 0 : data.current_amount,
      goal_type: data.goal_type,
    })
    if (ok) {
      success('Meta atualizada.')
      navigate(`/goals/${id}`)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-lg">
        <form
          onSubmit={handleSubmit((d) => void onSubmit(d))}
          className="space-y-4"
          noValidate
        >
          <fieldset className="space-y-2">
            <legend className="mb-1.5 text-sm font-medium text-slate-700 dark:text-[var(--text-secondary)]">
              Tipo de meta
            </legend>
            <label className={goalTypeCardClass}>
              <input
                type="radio"
                value="manual"
                className="peer mt-0.5 h-4 w-4 shrink-0 border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)] dark:text-brand-400 dark:focus:ring-brand-400"
                {...register('goal_type')}
              />
              <span className="min-w-0 flex-1">
                <span className="font-medium text-slate-800 transition-colors peer-checked:text-slate-900 dark:text-[var(--text-secondary)] dark:peer-checked:text-[var(--text-primary)]">
                  Valor atual manual
                </span>
                <span className="mt-0.5 block text-ds-muted dark:text-[var(--text-muted)] dark:peer-checked:text-[var(--text-secondary)]">
                  Você informa quanto já tem guardado ou acumulado.
                </span>
              </span>
            </label>
            <label className={goalTypeCardClass}>
              <input
                type="radio"
                value="net_worth"
                className="peer mt-0.5 h-4 w-4 shrink-0 border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)] dark:text-brand-400 dark:focus:ring-brand-400"
                {...register('goal_type')}
              />
              <span className="min-w-0 flex-1">
                <span className="font-medium text-slate-800 transition-colors peer-checked:text-slate-900 dark:text-[var(--text-secondary)] dark:peer-checked:text-[var(--text-primary)]">
                  Patrimônio líquido
                </span>
                <span className="mt-0.5 block text-ds-muted dark:text-[var(--text-muted)] dark:peer-checked:text-[var(--text-secondary)]">
                  Contas + investimentos, menos faturas em aberto (visão geral).
                </span>
              </span>
            </label>
          </fieldset>

          <div>
            <label className="ui-label">Nome</label>
            <input
              type="text"
              {...register('name')}
              className="ui-field"
              placeholder="Ex: Reserva de emergência"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-danger-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="ui-label">Valor da meta</label>
            <Controller
              name="target_amount"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value ?? 0}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="R$ 0,00"
                />
              )}
            />
            {errors.target_amount && (
              <p className="mt-1 text-sm text-danger-500">
                {errors.target_amount.message}
              </p>
            )}
          </div>

          {goalType === 'manual' ? (
            <div>
              <label className="ui-label">Valor atual</label>
              <Controller
                name="current_amount"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    value={field.value ?? 0}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
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
          ) : (
            <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-[var(--border-default)] dark:bg-zinc-900/40 dark:text-[var(--text-muted)]">
              Progresso calculado com o patrimônio líquido (visão geral).
            </p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/goals/${id}`)}
            >
              Cancelar
            </Button>
            <Button type="submit">Salvar alterações</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
