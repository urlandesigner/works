import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { CardChevronIcon } from '../../components/ui/CardChevronLink'
import { EditIconButton } from '../../components/ui/EditIconButton'
import { EmptyState } from '../../components/ui/EmptyState'
import { MetricCard } from '../../components/ui/MetricCard'
import { Modal } from '../../components/ui/Modal'
import { MobileFab } from '../../components/ui/MobileFab'
import { useHeaderActions } from '../../contexts/HeaderActionsContext'
import { useValuesVisibility } from '../../contexts/ValuesVisibilityContext'
import { useCreditCards } from '../../contexts/CreditCardsContext'
import { CreditCardBillFormModal } from './CreditCardBillFormModal'
import { MONTH_LABELS } from '../../lib/calendar'
import {
  getMonthCreditCardBillsTotal,
  getOutstandingCreditCardDebt,
} from '../../lib/balance'
import {
  Plus,
  CreditCard as CreditCardIcon,
  Receipt,
  Calendar,
  Wallet,
} from 'lucide-react'
import type { CreditCardBill } from '../../types'
import { financeExpenseAmountSm } from '../../lib/financeDisplay'
import { CreditCardsPageSkeleton } from '../../components/ui/skeleton-compositions'

export function CreditCardsLayout() {
  const navigate = useNavigate()
  const outlet = useOutlet()
  const location = useLocation()
  const pathname = location.pathname
  const isNewRoute = pathname === '/credit-cards/new'
  const isEditRoute = /^\/credit-cards\/[^/]+\/edit$/.test(pathname)
  const isCardModalOpen = isNewRoute || isEditRoute
  const editId = isEditRoute ? pathname.split('/')[2] : null
  const modalTitle = isNewRoute ? 'Novo cartão' : 'Editar cartão'
  const { setActions, setTitle, setMobileFab } = useHeaderActions()
  const { formatCurrency } = useValuesVisibility()
  const { creditCards, getBillsByCardId, loading: creditCardsLoading } =
    useCreditCards()
  const [billModal, setBillModal] = useState<{
    open: true
    bill: CreditCardBill
  } | { open: false }>({ open: false })

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const { totalEmAberto, totalMesAtual, activeCardsCount, cardsWithBills } =
    useMemo(() => {
      const allBills = creditCards.flatMap((c) => getBillsByCardId(c.id))
      const totalEmAberto = getOutstandingCreditCardDebt(allBills)
      const totalMesAtual = getMonthCreditCardBillsTotal(
        allBills,
        currentYear,
        currentMonth
      )
      const activeCardsCount = creditCards.filter((c) => c.isActive).length
      const cardsWithBills = creditCards.map((card) => {
        const bills = getBillsByCardId(card.id)
          .slice()
          .sort((a, b) =>
            a.year !== b.year ? b.year - a.year : b.month - a.month
          )
        return { card, bills }
      })
      return {
        totalEmAberto,
        totalMesAtual,
        activeCardsCount,
        cardsWithBills,
      }
    }, [creditCards, getBillsByCardId, currentMonth, currentYear])

  const handleCloseCardModal = () => {
    if (isNewRoute) navigate('/credit-cards')
    else if (editId) navigate(`/credit-cards/${editId}`)
    else navigate('/credit-cards')
  }

  const openEditBill = (bill: CreditCardBill) => {
    setBillModal({ open: true, bill })
  }

  const closeBillModal = () => {
    setBillModal({ open: false })
  }

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
    <>
      <div className="space-y-6">
        {creditCardsLoading ? (
          <div aria-busy="true">
            <CreditCardsPageSkeleton />
          </div>
        ) : creditCards.length === 0 ? (
          <Card>
            <EmptyState
              icon={CreditCardIcon}
              title="Nenhum cartão cadastrado"
              description="Cadastre cartões para acompanhar faturas e totais por mês."
            >
              <Button to="/credit-cards/new">
                <Plus className="h-4 w-4" />
                Novo cartão
              </Button>
            </EmptyState>
          </Card>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Cards de resumo */}
            <div className="space-y-3 sm:hidden">
              <div className="grid grid-cols-2 gap-3 max-[360px]:grid-cols-1">
                <Card className="p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ds-muted">
                    Faturas em aberto
                  </p>
                  <p className="mt-1 font-display text-xl font-bold tabular-nums tracking-tight text-danger-600 dark:text-red-400">
                    {formatCurrency(totalEmAberto)}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ds-muted">
                    Total do mês
                  </p>
                  <p className="mt-1 font-display text-xl font-bold tabular-nums tracking-tight text-danger-600 dark:text-red-400">
                    {formatCurrency(totalMesAtual)}
                  </p>
                </Card>
              </div>
              <Card className="p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ds-muted">
                    Cartões ativos
                  </p>
                  <p className="font-display text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-[var(--text-primary)]">
                    {activeCardsCount}
                  </p>
                </div>
              </Card>
            </div>

            <div className="hidden gap-4 sm:grid sm:grid-cols-3">
              <MetricCard
                title="Faturas em aberto"
                icon={<Receipt className="h-5 w-5" />}
                value={formatCurrency(totalEmAberto)}
                valueClassName="font-bold text-danger-600"
              />
              <MetricCard
                title="Total do mês atual"
                icon={<Calendar className="h-5 w-5" />}
                value={formatCurrency(totalMesAtual)}
                valueClassName="font-bold text-danger-600"
              />
              <MetricCard
                title="Cartões ativos"
                icon={<Wallet className="h-5 w-5" />}
                value={activeCardsCount}
              />
            </div>

            {/* Listagem de faturas por cartão — dois blocos lado a lado */}
            {(() => {
              const mid = Math.ceil(cardsWithBills.length / 2)
              const left = cardsWithBills.slice(0, mid)
              const right = cardsWithBills.slice(mid)
              const renderCardBlock = (items: typeof cardsWithBills) => (
                <div className="space-y-6">
                  {items.map(({ card, bills }) => (
                    <section key={card.id}>
                      <Link
                        to={`/credit-cards/${card.id}`}
                        className="mb-3 flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:ring-offset-2"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-200">
                            <CreditCardIcon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {card.name}{' '}
                              <span className="font-normal text-ds-muted">
                                (•••• {card.lastFourDigits})
                              </span>
                            </p>
                            {!card.isActive && (
                              <p className="text-xs text-ds-muted">
                                Inativo
                              </p>
                            )}
                          </div>
                        </div>
                        <CardChevronIcon className="shrink-0" />
                      </Link>

                      {bills.length === 0 ? (
                        <p className="card-prose">Nenhuma fatura cadastrada</p>
                      ) : (
                        <ul className="card-list">
                          {bills.map((bill) => (
                            <li key={bill.id}>
                              <div className="card-list-row">
                              <span className="text-sm text-slate-700 dark:text-slate-200">
                                {MONTH_LABELS[bill.month - 1]}/{bill.year}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={financeExpenseAmountSm}>
                                  {formatCurrency(bill.amount)}
                                </span>
                                <EditIconButton
                                  onClick={() => openEditBill(bill)}
                                  aria-label={`Editar fatura ${MONTH_LABELS[bill.month - 1]}/${bill.year}`}
                                  title="Editar fatura"
                                />
                              </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))}
                </div>
              )
              return (
                <div className="space-y-4">
                  <h2 className="card-block-title">Faturas por cartão</h2>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                    <Card className="min-w-0">
                      {left.length > 0 ? (
                        renderCardBlock(left)
                      ) : (
                        <p className="card-prose">Nenhum cartão nesta coluna</p>
                      )}
                    </Card>
                    <Card className="min-w-0">
                      {right.length > 0 ? (
                        renderCardBlock(right)
                      ) : (
                        <p className="card-prose">Nenhum cartão nesta coluna</p>
                      )}
                    </Card>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {isCardModalOpen && (
        <Modal fullBleedMobile title={modalTitle} onClose={handleCloseCardModal}>
          {outlet}
        </Modal>
      )}

      {billModal.open && (
        <CreditCardBillFormModal
          creditCardId={billModal.bill.creditCardId}
          bill={billModal.bill}
          onClose={closeBillModal}
          onSaved={closeBillModal}
        />
      )}
    </>
  )
}
