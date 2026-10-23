import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { useGoals } from '../contexts/GoalsContext'
import { useHeaderActions } from '../contexts/HeaderActionsContext'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

const schema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  target_amount: z.number().positive('Meta deve ser maior que zero'),
  goal_type: z.enum(['manual', 'net_worth']),
  current_amount: z.number().min(0, 'Valor atual não pode ser negativo'),
})

type FormData = z.infer<typeof schema>

const goalTypeCardClass =
  'group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out active:scale-[0.99] motion-reduce:active:scale-100 border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 dark:border-[var(--border-default)] dark:bg-[var(--bg-surface)] dark:hover:border-white/[0.16] dark:hover:bg-white/[0.04] has-[:checked]:border-brand-400/70 has-[:checked]:bg-brand-50/60 has-[:checked]:shadow-sm dark:has-[:checked]:border-brand-400/55 dark:has-[:checked]:bg-brand-500/14 dark:has-[:checked]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500/45 has-[:focus-visible]:ring-offset-2 dark:has-[:focus-visible]:ring-brand-400/45 dark:has-[:focus-visible]:ring-offset-zinc-900'

export function NewGoalPage() {
  const navigate = useNavigate()
  const { addGoal } = useGoals()
  const { user } = useAuth()
  const { setTitle } = useHeaderActions()
  const { success, error: toastError } = useToast()
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      current_amount: 0,
      goal_type: 'manual',
    },
  })

  const goalType = useWatch({ control, name: 'goal_type' })

  useEffect(() => {
    if (goalType === 'net_worth') {
      setValue('current_amount', 0)
    }
  }, [goalType, setValue])

  useEffect(() => {
    setTitle('Nova meta')
    return () => setTitle('', null)
  }, [setTitle])

  const onSubmit = async (data: FormData) => {
    const uid = user?.id
    if (!uid) {
      toastError('Sessão inválida. Faça login novamente.')
      return
    }
    const ok = await addGoal({
      user_id: uid,
      name: data.name.trim(),
      target_amount: data.target_amount,
      current_amount: data.goal_type === 'net_worth' ? 0 : data.current_amount,
      goal_type: data.goal_type,
      is_active: true,
      color: null,
    })
    if (ok) {
      success('Meta criada com sucesso.')
      navigate('/goals')
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
                  Contas + investimentos, menos faturas de cartão em aberto — mesma
                  base da visão geral.
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
