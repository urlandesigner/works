export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/** Hoje no fuso local, só calendário (YYYY-MM-DD). Não usar toISOString() — vira dia errado perto da meia-noite UTC. */
export function getTodayIsoLocal(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const DATE_DISPLAY: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}

/**
 * Formata data de transação / campo tipo `date` (YYYY-MM-DD).
 * Evita `new Date('YYYY-MM-DD')` sozinho — no JS isso é meia-noite UTC e pode mostrar o dia anterior no Brasil.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const cal = dateStr.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(cal)) {
    return new Intl.DateTimeFormat('pt-BR', DATE_DISPLAY).format(
      new Date(`${cal}T12:00:00`)
    )
  }
  return new Intl.DateTimeFormat('pt-BR', DATE_DISPLAY).format(new Date(dateStr))
}
