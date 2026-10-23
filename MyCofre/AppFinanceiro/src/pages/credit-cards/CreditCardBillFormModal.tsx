import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import { useCreditCards } from '../../contexts/CreditCardsContext'
import { useToast } from '../../contexts/ToastContext'
import type { CreditCardBill } from '../../types'
import { MONTH_LABELS } from '../../lib/calendar'

const schema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  amount: z.number().min(0, 'Valor não pode ser negativo'),
  isPaid: z.boolean(),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface CreditCardBillFormModalProps {
  creditCardId: string
  bill: CreditCardBill | null
  onClose: () => void
  onSaved: () => void
}

const CURRENT_YEAR = new Date().getFullYear()
const MONTHS = MONTH_LABELS.map((label, i) => ({ value: i + 1, label }))

const checkboxClass =
  'h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)] dark:focus:ring-brand-400'

export function CreditCardBillFormModal({
  creditCardId,
  bill,
  onClose,
  onSaved,
}: CreditCardBillFormModalProps) {
  const { addBill, updateBill, deleteBill } = useCreditCards()
  const { success } = useToast()
  const isEditing = bill != null

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: CURRENT_YEAR,
      amount: 0,
      isPaid: false,
      notes: '',
    },
  })

  useEffect(() => {
    if (bill) {
      reset({
        month: bill.month,
        year: bill.year,
        amount: bill.amount,
        isPaid: bill.isPaid,
        notes: bill.notes ?? '',
      })
    }
  }, [bill, reset])

  const onSubmit = async (data: FormData) => {
    if (isEditing && bill) {
      const ok = await updateBill(bill.id, {
        month: data.month,
        year: data.year,
        amount: data.amount,
        isPaid: data.isPaid,
        notes: data.notes?.trim() || null,
      })
      if (!ok) return
    } else {
      const row = await addBill({
        creditCardId,
        month: data.month,
        year: data.year,
        amount: data.amount,
        isPaid: data.isPaid,
        notes: data.notes?.trim() || null,
      })
      if (!row) return
    }
    success(isEditing ? 'Fatura atualizada.' : 'Fatura registrada.')
    onSaved()
    onClose()
  }

  return (
    <Modal
      fullBleedMobile
      title={isEditing ? 'Editar fatura' : 'Adicionar fatura'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="ui-label">Mês</label>
          <select {...register('month', { valueAsNumber: true })} className="ui-field">
            {MONTHS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="ui-label">Ano</label>
          <input
            type="number"
            min={2000}
            max={2100}
            {...register('year', { valueAsNumber: true })}
            className="ui-field max-w-[120px] tabular-nums"
          />
          {errors.year && (
            <p className="mt-1 text-sm text-danger-500">{errors.year.message}</p>
          )}
        </div>

        <div>
          <label className="ui-label">Valor da fatura</label>
          <Controller
            name="amount"
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
          {errors.amount && (
            <p className="mt-1 text-sm text-danger-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPaid"
            {...register('isPaid')}
            className={checkboxClass}
          />
          <label
            htmlFor="isPaid"
            className="text-sm font-medium text-slate-700 dark:text-[var(--text-secondary)]"
          >
            Fatura paga
          </label>
        </div>

        <div>
          <label className="ui-label">Observações (opcional)</label>
          <textarea {...register('notes')} rows={2} className="ui-field" />
        </div>

        <div
          className={`flex flex-col gap-3 pt-2 ${
            isEditing && bill
              ? 'sm:flex-row sm:items-center sm:justify-between'
              : 'sm:flex-row sm:items-center sm:justify-end'
          }`}
        >
          {isEditing && bill ? (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (
                  !window.confirm(
                    'Tem certeza que deseja excluir esta fatura? Essa ação não poderá ser desfeita.'
                  )
                ) {
                  return
                }
                void (async () => {
                  const ok = await deleteBill(bill.id)
                  if (!ok) return
                  success('Fatura excluída.')
                  onSaved()
                  onClose()
                })()
              }}
            >
              Excluir fatura
            </Button>
          ) : null}
          <div className="flex flex-wrap items-center justify-end gap-3 sm:ml-auto">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Salvar alterações' : 'Adicionar'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
