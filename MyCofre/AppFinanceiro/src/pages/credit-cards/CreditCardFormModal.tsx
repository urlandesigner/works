import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { useCreditCards } from '../../contexts/CreditCardsContext'
import { useToast } from '../../contexts/ToastContext'
import { CreditCard as LucideCreditCard } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Informe o nome do cartão'),
  brand: z.string().min(1, 'Informe a bandeira'),
  lastFourDigits: z
    .string()
    .length(4, 'Informe exatamente 4 dígitos')
    .regex(/^\d{4}$/, 'Apenas números'),
  isActive: z.boolean(),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const checkboxClass =
  'h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-[var(--border-default)] dark:bg-[var(--bg-elevated)] dark:focus:ring-brand-400'

export function CreditCardFormModal() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getCardById, addCard, updateCard } = useCreditCards()
  const { success } = useToast()
  const card = id ? getCardById(id) : undefined
  const isEdit = Boolean(id)

  const goBack = () => {
    if (isEdit && id) navigate(`/credit-cards/${id}`)
    else navigate('/credit-cards')
  }

  const formNew = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, notes: '' },
  })

  const formEdit = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      brand: '',
      lastFourDigits: '',
      isActive: true,
      notes: '',
    },
  })

  useEffect(() => {
    if (card && isEdit) {
      formEdit.reset({
        name: card.name,
        brand: card.brand,
        lastFourDigits: card.lastFourDigits,
        isActive: card.isActive,
        notes: card.notes ?? '',
      })
    }
  }, [card, isEdit, formEdit])

  if (isEdit && id && !card) {
    return (
      <EmptyState
        icon={LucideCreditCard}
        title="Cartão não encontrado"
        description="Ele pode ter sido excluído ou o link está incorreto."
      >
        <Button type="button" variant="secondary" onClick={goBack}>
          Voltar aos cartões
        </Button>
      </EmptyState>
    )
  }

  if (isEdit && card) {
    const { register, formState: { errors } } = formEdit
    return (
      <form
        onSubmit={formEdit.handleSubmit(async (data) => {
          const ok = await updateCard(id!, {
            name: data.name.trim(),
            brand: data.brand.trim(),
            lastFourDigits: data.lastFourDigits,
            isActive: data.isActive,
            notes: data.notes?.trim() || null,
          })
          if (!ok) return
          success('Cartão atualizado.')
          navigate(`/credit-cards/${id}`)
        })}
        className="space-y-4"
        noValidate
      >
        <div>
          <label className="ui-label">Nome</label>
          <input
            type="text"
            {...register('name')}
            className="ui-field"
            placeholder="Ex: Nubank, Itaú"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-danger-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="ui-label">Bandeira</label>
          <input
            type="text"
            {...register('brand')}
            className="ui-field"
            placeholder="Ex: Visa, Mastercard"
          />
          {errors.brand && (
            <p className="mt-1 text-sm text-danger-500">{errors.brand.message}</p>
          )}
        </div>

        <div>
          <label className="ui-label">Últimos 4 dígitos</label>
          <input
            type="text"
            maxLength={4}
            {...register('lastFourDigits')}
            className="ui-field max-w-[120px] tabular-nums"
            placeholder="1234"
          />
          {errors.lastFourDigits && (
            <p className="mt-1 text-sm text-danger-500">
              {errors.lastFourDigits.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="edit-isActive"
            {...register('isActive')}
            className={checkboxClass}
          />
          <label
            htmlFor="edit-isActive"
            className="text-sm font-medium text-slate-700 dark:text-[var(--text-secondary)]"
          >
            Cartão ativo
          </label>
        </div>

        <div>
          <label className="ui-label">Observações (opcional)</label>
          <textarea
            {...register('notes')}
            rows={2}
            className="ui-field"
            placeholder="Ex: limite, data de fechamento"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={goBack}>
            Cancelar
          </Button>
          <Button type="submit">Salvar alterações</Button>
        </div>
      </form>
    )
  }

  const { register, formState: { errors } } = formNew
  return (
    <form
      onSubmit={formNew.handleSubmit(async (data) => {
        const newCard = await addCard({
          name: data.name.trim(),
          brand: data.brand.trim(),
          lastFourDigits: data.lastFourDigits,
          isActive: data.isActive,
          notes: data.notes?.trim() || null,
        })
        if (!newCard) return
        success('Cartão cadastrado.')
        navigate(`/credit-cards/${newCard.id}`)
      })}
      className="space-y-4"
      noValidate
    >
      <div>
        <label className="ui-label">Nome</label>
        <input
          type="text"
          {...register('name')}
          className="ui-field"
          placeholder="Ex: Nubank, Itaú"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-danger-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="ui-label">Bandeira</label>
        <input
          type="text"
          {...register('brand')}
          className="ui-field"
          placeholder="Ex: Visa, Mastercard"
        />
        {errors.brand && (
          <p className="mt-1 text-sm text-danger-500">{errors.brand.message}</p>
        )}
      </div>

      <div>
        <label className="ui-label">Últimos 4 dígitos</label>
        <input
          type="text"
          maxLength={4}
          {...register('lastFourDigits')}
          className="ui-field max-w-[120px] tabular-nums"
          placeholder="1234"
        />
        {errors.lastFourDigits && (
          <p className="mt-1 text-sm text-danger-500">
            {errors.lastFourDigits.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="new-isActive"
          {...register('isActive')}
          className={checkboxClass}
        />
        <label
          htmlFor="new-isActive"
          className="text-sm font-medium text-slate-700 dark:text-[var(--text-secondary)]"
        >
          Cartão ativo
        </label>
      </div>

      <div>
        <label className="ui-label">Observações (opcional)</label>
        <textarea
          {...register('notes')}
          rows={2}
          className="ui-field"
          placeholder="Ex: limite, data de fechamento"
        />
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
