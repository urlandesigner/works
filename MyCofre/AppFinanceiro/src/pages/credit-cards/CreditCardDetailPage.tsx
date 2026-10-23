import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { EditIconButton } from '../../components/ui/EditIconButton'
import { useValuesVisibility } from '../../contexts/ValuesVisibilityContext'
import { useCreditCards } from '../../contexts/CreditCardsContext'
import { useHeaderActions } from '../../contexts/HeaderActionsContext'
import { useToast } from '../../contexts/ToastContext'
import { CreditCardBillFormModal } from './CreditCardBillFormModal'
import { MONTH_LABELS } from '../../lib/calendar'
import { Trash2, Plus, CreditCard as CreditCardIcon } from 'lucide-react'
import type { CreditCardBill } from '../../types'

const CURRENT_YEAR = new Date().getFullYear()

export function CreditCardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setTitle } = useHeaderActions()
  const { success } = useToast()
  const { formatCurrency } = useValuesVisibility()
  const { getCardById, deleteCard, getBillsByCardId } = useCreditCards()
  const card = id ? getCardById(id) : undefined
  const [year, setYear] = useState(CURRENT_YEAR)
  const [billModal, setBillModal] = useState<{
    open: true
    bill: CreditCardBill | null
  } | { open: false }>({ open: false })

  const allBills = id ? getBillsByCardId(id) : []
  const billsForYear = allBills.filter((b) => b.year === year)
  const totalYear = billsForYear.reduce((s, b) => s + b.amount, 0)
  const avgMonth =
    billsForYear.length > 0 ? totalYear / billsForYear.length : 0

  useEffect(() => {
    if (!id) setTitle('Cartão')
    else if (!card) setTitle('Cartão não encontrado', 'O cartão pode ter sido excluído.')
    else setTitle(card.name, `${card.brand} · final ${card.lastFourDigits}${!card.isActive ? ' · Inativo' : ''}`)
    return () => setTitle('', null)
  }, [id, card, setTitle])

  if (!id) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="card-prose mb-4">
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
          <p className="card-prose mb-4">
            O cartão pode ter sido excluído.
          </p>
          <Button to="/credit-cards" variant="secondary">
            Voltar aos cartões
          </Button>
        </Card>
      </div>
    )
  }

  const handleDelete = () => {
    if (
      window.confirm(
        'Excluir este cartão? Todas as faturas serão excluídas. Esta ação não pode ser desfeita.'
      )
    ) {
      void (async () => {
        const ok = await deleteCard(id)
        if (!ok) return
        success('Cartão excluído.')
        navigate('/credit-cards')
      })()
    }
  }

  const openAddBill = () =>
    setBillModal({ open: true, bill: null })
  const openEditBill = (bill: CreditCardBill) =>
    setBillModal({ open: true, bill })
  const closeBillModal = () => setBillModal({ open: false })

  const years = Array.from(
    new Set([CURRENT_YEAR, ...allBills.map((b) => b.year)])
  ).sort((a, b) => b - a)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2">
        <EditIconButton
          to={`/credit-cards/${id}/edit`}
          aria-label="Editar cartão"
          title="Editar cartão"
        />
        <Button type="button" variant="danger" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-200">
            <CreditCardIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {card.name}
            </p>
            <p className="text-sm text-ds-muted">
              {card.brand} · final {card.lastFourDigits}
            </p>
            {card.notes && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {card.notes}
              </p>
            )}
          </div>
        </div>
      </Card>

      <section>
        <Card>
          <div className="card-block-header items-center">
            <h2 className="card-block-title">Faturas</h2>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="bill-year" className="text-sm text-slate-600">
                Ano:
              </label>
              <select
                id="bill-year"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="ui-field min-w-0 w-[6.5rem] max-w-full px-2 py-1.5 text-sm"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <Button type="button" onClick={openAddBill}>
                <Plus className="h-4 w-4" />
                Adicionar fatura
              </Button>
            </div>
          </div>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <Card>
              <p className="card-section-label">Total no ano</p>
              <p className="mt-2 font-display text-xl font-bold tabular-nums tracking-tight text-danger-600">
                {formatCurrency(totalYear)}
              </p>
            </Card>
            <Card>
              <p className="card-section-label">Média mensal ({year})</p>
              <p className="mt-2 font-display text-xl font-bold tabular-nums tracking-tight text-danger-600">
                {formatCurrency(avgMonth)}
              </p>
            </Card>
          </div>

          {billsForYear.length === 0 ? (
            <p className="card-prose">
              Nenhuma fatura em {year}. Adicione uma fatura para acompanhar.
            </p>
          ) : (
            <ul className="card-list">
              {billsForYear.map((bill) => (
                <li key={bill.id}>
                  <div className="card-list-row">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {MONTH_LABELS[bill.month - 1]} {bill.year}
                    </p>
                    {bill.isPaid && (
                      <span className="text-xs font-medium text-emerald-600">
                        Paga
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold tabular-nums text-danger-600">
                      {formatCurrency(bill.amount)}
                    </p>
                    <EditIconButton
                      onClick={() => openEditBill(bill)}
                      aria-label={`Editar fatura ${MONTH_LABELS[bill.month - 1]} ${bill.year}`}
                      title="Editar fatura"
                    />
                  </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {billModal.open && (
        <CreditCardBillFormModal
          creditCardId={id}
          bill={billModal.bill}
          onClose={closeBillModal}
          onSaved={() => {}}
        />
      )}
    </div>
  )
}
