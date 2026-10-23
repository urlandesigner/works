import { useMemo } from 'react'
import { Card } from '../../../components/ui/Card'
import type { StatementImportItem } from '../types'

interface StatementImportSummaryProps {
  items: StatementImportItem[]
}

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function StatementImportSummary({ items }: StatementImportSummaryProps) {
  const { totalIncome, totalExpenses, totalInvoice } = useMemo(() => {
    const selectedItems = items.filter(
      (item) => item.isSelected && item.reviewStatus !== 'ignored'
    )

    let income = 0
    let expenses = 0
    for (const item of selectedItems) {
      if (item.type === 'needs_review') continue
      if (item.type === 'income') {
        income += Math.abs(item.amount)
      } else if (item.type === 'expense') {
        expenses += Math.abs(item.amount)
      }
    }

    return {
      totalIncome: income,
      totalExpenses: -expenses,
      totalInvoice: expenses,
    }
  }, [items])

  return (
    <Card>
      <h2 className="card-block-heading mb-3">Resumo dinamico (itens selecionados)</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-3 dark:border-emerald-400/20 dark:bg-emerald-950/20">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Total de entradas
          </p>
          <p className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-300">
            {BRL.format(totalIncome)}
          </p>
        </div>

        <div className="rounded-xl border border-red-200/80 bg-red-50/70 px-4 py-3 dark:border-red-400/20 dark:bg-red-950/20">
          <p className="text-xs font-medium uppercase tracking-wide text-red-700 dark:text-red-300">
            Total de saidas
          </p>
          <p className="mt-1 text-lg font-semibold text-red-700 dark:text-red-300">
            {BRL.format(totalExpenses)}
          </p>
        </div>

        <div className="rounded-xl border border-brand-300/80 bg-brand-50 px-4 py-3 dark:border-brand-400/30 dark:bg-brand-900/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-800 dark:text-brand-300">
            Total da fatura
          </p>
          <p className="mt-1 text-2xl font-bold text-brand-800 dark:text-brand-300">
            {BRL.format(totalInvoice)}
          </p>
        </div>
      </div>
    </Card>
  )
}
