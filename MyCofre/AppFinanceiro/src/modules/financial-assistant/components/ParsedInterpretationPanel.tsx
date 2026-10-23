import { Card } from '../../../components/ui/Card'
import type { ParsedFinanceAction } from '../types'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface ParsedInterpretationPanelProps {
  parsed: ParsedFinanceAction | null
}

export function ParsedInterpretationPanel({ parsed }: ParsedInterpretationPanelProps) {
  if (!parsed) {
    return (
      <Card className="border-dashed border-slate-300 dark:border-slate-600">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Digite algo como:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <li>gastei 50 no mercado</li>
          <li>recebi 2000 de salário</li>
          <li>paguei 120 de internet</li>
        </ul>
      </Card>
    )
  }

  const tipo = parsed.data.type === 'income' ? 'Receita' : 'Despesa'
  const valor =
    parsed.data.amount != null && parsed.data.amount > 0
      ? BRL.format(parsed.data.amount)
      : 'A definir na prévia'
  const cat = parsed.data.category?.trim() || 'Sem categoria'
  const dataLabel = parsed.data.date
    ? new Date(parsed.data.date + 'T12:00:00').toLocaleDateString('pt-BR')
    : '—'

  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Resumo do que entendi
      </h3>
      <p className="mt-1 text-xs text-ds-muted">
        Baseado na sua última mensagem — ajuste na prévia se algo estiver diferente.
      </p>
      <ul className="mt-3 space-y-2.5 text-sm text-slate-800 dark:text-slate-200">
        <li className="flex justify-between gap-2">
          <span className="text-ds-muted">Tipo</span>
          <span className="font-medium">{tipo}</span>
        </li>
        <li className="flex justify-between gap-2">
          <span className="text-ds-muted">Valor</span>
          <span className="font-semibold tabular-nums">{valor}</span>
        </li>
        <li className="flex justify-between gap-2">
          <span className="text-ds-muted">Categoria</span>
          <span className="font-medium">{cat}</span>
        </li>
        <li className="flex justify-between gap-2">
          <span className="text-ds-muted">Data</span>
          <span className="font-medium">{dataLabel}</span>
        </li>
      </ul>
    </Card>
  )
}
