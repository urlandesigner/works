import { SheetModalFrame } from '../ui/SheetModalFrame'
import { TransactionNewForm } from '../../pages/transactions/TransactionFormModal'

export interface TransactionFormSheetProps {
  open: boolean
  onClose: () => void
}

/**
 * Bottom sheet de nova transação (ex.: Home) — mesmo shell que modais de rota.
 */
export function TransactionFormSheet({ open, onClose }: TransactionFormSheetProps) {
  return (
    <SheetModalFrame
      open={open}
      onClose={onClose}
      zIndex={100}
      fullBleedMobile
      overlayVariant="home"
      title="Nova transação"
      description="Preencha os campos para registrar no app."
      titleId="transaction-form-sheet-title"
      bodyClassName="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]"
    >
      <TransactionNewForm onClose={onClose} variant="sheet" />
    </SheetModalFrame>
  )
}
