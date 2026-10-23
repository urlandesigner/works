import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  CardChevronLink,
  cardHeaderActionsClass,
} from '../../components/ui/CardChevronLink'
import { EditIconButton } from '../../components/ui/EditIconButton'
import { EmptyState } from '../../components/ui/EmptyState'
import { MobileFab } from '../../components/ui/MobileFab'
import { useHeaderActions } from '../../contexts/HeaderActionsContext'
import { useCreditCards } from '../../contexts/CreditCardsContext'
import { Plus, CreditCard as CreditCardIcon } from 'lucide-react'

export function CreditCardsPage() {
  const { setActions, setTitle, setMobileFab } = useHeaderActions()
  const { creditCards } = useCreditCards()

  useEffect(() => {
    setTitle('Cartões de crédito')
    return () => setTitle('', null)
  }, [setTitle])
  useEffect(() => {
    setActions(
      <Button to="/credit-cards/new">
        <Plus className="h-4 w-4" />
        Novo cartão
      </Button>
    )
    return () => setActions(null)
  }, [setActions])
  useEffect(() => {
    setMobileFab(
      <MobileFab
        to="/credit-cards/new"
        ariaLabel="Novo cartão"
        icon={<Plus className="h-7 w-7" strokeWidth={2.25} aria-hidden />}
      />
    )
    return () => setMobileFab(null)
  }, [setMobileFab])

  return (
    <div className="space-y-6">
      {creditCards.length === 0 ? (
        <Card>
          <EmptyState
            icon={CreditCardIcon}
            title="Nenhum cartão cadastrado"
            description="Adicione cartões para controlar faturas e limites em um só lugar."
          >
            <Button to="/credit-cards/new">
              <Plus className="h-4 w-4" />
              Novo cartão
            </Button>
          </EmptyState>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {creditCards.map((card) => (
            <Card
              key={card.id}
              className="overflow-hidden transition hover:border-slate-300"
            >
              <div className="card-block-header items-start gap-4">
                <Link
                  to={`/credit-cards/${card.id}`}
                  className="flex min-w-0 flex-1 items-start gap-3 rounded-lg pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:ring-offset-2"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <CreditCardIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="card-block-title truncate">{card.name}</h2>
                  </div>
                </Link>
                <div className={cardHeaderActionsClass}>
                  <EditIconButton
                    size="compact"
                    to={`/credit-cards/${card.id}/edit`}
                    aria-label={`Editar cartão ${card.name}`}
                    title="Editar cartão"
                    className="self-start"
                  />
                  <CardChevronLink
                    to={`/credit-cards/${card.id}`}
                    aria-label={`Abrir cartão ${card.name}`}
                    title="Ver detalhes"
                  />
                </div>
              </div>
              <div className="card-block-body-flush px-6 py-3">
                <p className="text-sm text-ds-muted">
                  {card.brand} · final {card.lastFourDigits}
                  {!card.isActive && ' · Inativo'}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
