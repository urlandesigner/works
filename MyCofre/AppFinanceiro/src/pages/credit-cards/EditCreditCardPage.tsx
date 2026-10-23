import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useCreditCards } from '../../contexts/CreditCardsContext'
import { useHeaderActions } from '../../contexts/HeaderActionsContext'

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

export function EditCreditCardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getCardById, updateCard } = useCreditCards()
  const card = id ? getCardById(id) : undefined

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      brand: '',
      lastFourDigits: '',
      isActive: true,
      notes: '',
    },
  })

  const { setTitle } = useHeaderActions()
  useEffect(() => {
    if (card) {
      reset({
        name: card.name,
        brand: card.brand,
        lastFourDigits: card.lastFourDigits,
        isActive: card.isActive,
        notes: card.notes ?? '',
      })
    }
  }, [card, reset])
  useEffect(() => {
    if (!id) setTitle('Editar cartão')
    else if (!card) setTitle('Cartão não encontrado', 'O cartão pode ter sido excluído.')
    else setTitle('Editar cartão', `${card.name} · final ${card.lastFourDigits}`)
    return () => setTitle('', null)
  }, [id, card, setTitle])

  if (!id) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="py-4 text-sm text-ds-muted">
            Identificador não informado.
          </p>
          <Button to="/credit-cards" variant="secondary">
            Voltar aos cartões
          </Button>
        </Card>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="py-4 text-sm text-ds-muted">
            O cartão pode ter sido excluído.
          </p>
          <Button to="/credit-cards" variant="secondary">
            Voltar aos cartões
          </Button>
        </Card>
      </div>
    )
  }

  const onSubmit = async (data: FormData) => {
    const ok = await updateCard(id, {
      name: data.name.trim(),
      brand: data.brand.trim(),
      lastFourDigits: data.lastFourDigits,
      isActive: data.isActive,
      notes: data.notes?.trim() || null,
    })
    if (!ok) return
    navigate(`/credit-cards/${id}`)
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
              id="isActive"
              {...register('isActive')}
              className={checkboxClass}
            />
            <label
              htmlFor="isActive"
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
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/credit-cards/${id}`)}
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
