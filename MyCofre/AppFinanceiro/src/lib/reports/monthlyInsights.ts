import type { MonthlyClosing } from '../../types/monthly-closing'

export type InsightTone = 'positive' | 'negative' | 'neutral'

export type MonthlyInsightRow = {
  id: string
  text: string
  tone: InsightTone
}

const EPS = 1e-6

function findClosing(
  closings: MonthlyClosing[],
  year: number,
  month: number
): MonthlyClosing | undefined {
  return closings.find((c) => c.year === year && c.month === month)
}

function previousCalendarMonth(
  year: number,
  month: number
): { year: number; month: number } {
  if (month <= 1) return { year: year - 1, month: 12 }
  return { year, month: month - 1 }
}

/** Variação percentual segura: retorna null se não for possível dividir (evita divisão por zero). */
export function safePercentChange(prev: number, cur: number): number | null {
  if (!Number.isFinite(prev) || !Number.isFinite(cur)) return null
  if (Math.abs(prev) < EPS) return null
  return ((cur - prev) / prev) * 100
}

function formatSignedPercent(
  pct: number,
  formatPercent: (n: number) => string
): string {
  const sign = pct > 0 ? '+' : pct < 0 ? '−' : ''
  const abs = Math.abs(pct)
  return `${sign}${formatPercent(abs)}`
}

/**
 * Compara o fechamento do mês visualizado com o mês civil anterior,
 * usando apenas registros presentes em `monthly_closings`.
 *
 * @returns `null` se não houver fechamento para o mês visualizado.
 */
export function computeMonthlyInsights(
  closings: MonthlyClosing[],
  viewedYear: number,
  viewedMonth: number,
  format: {
    currency: (n: number) => string
    percent: (n: number) => string
    monthShortLabel: (year: number, month: number) => string
  }
): MonthlyInsightRow[] | null {
  const current = findClosing(closings, viewedYear, viewedMonth)
  if (!current) return null

  const prevPeriod = previousCalendarMonth(viewedYear, viewedMonth)
  const previous = findClosing(closings, prevPeriod.year, prevPeriod.month)

  const currentLabel = format.monthShortLabel(viewedYear, viewedMonth)
  const ordered: MonthlyInsightRow[] = []

  if (previous) {
    const patPct = safePercentChange(
      previous.patrimony_total,
      current.patrimony_total
    )
    if (patPct !== null) {
      const tone: InsightTone =
        patPct > EPS ? 'positive' : patPct < -EPS ? 'negative' : 'neutral'
      const verb =
        patPct > EPS
          ? 'cresceu'
          : patPct < -EPS
            ? 'reduziu'
            : 'permaneceu estável'
      const pctStr = formatSignedPercent(patPct, format.percent)
      ordered.push({
        id: 'patrimony_vs_prev',
        tone,
        text:
          Math.abs(patPct) < EPS
            ? `Seu patrimônio permaneceu estável em relação ao mês anterior (${currentLabel}).`
            : `Seu patrimônio ${verb} ${pctStr} em relação ao mês anterior.`,
      })
    }

    const bal = current.month_balance
    if (Number.isFinite(bal)) {
      if (bal > EPS) {
        ordered.push({
          id: 'month_balance',
          tone: 'positive',
          text: `Você economizou ${format.currency(bal)} neste mês (saldo do fechamento).`,
        })
      } else if (bal < -EPS) {
        ordered.push({
          id: 'month_balance',
          tone: 'negative',
          text: `Seu saldo do mês foi negativo em ${format.currency(Math.abs(bal))} (fechamento).`,
        })
      } else {
        ordered.push({
          id: 'month_balance',
          tone: 'neutral',
          text: `Seu saldo do mês foi zero no fechamento de ${currentLabel}.`,
        })
      }
    }

    const expPct = safePercentChange(
      previous.month_expenses,
      current.month_expenses
    )
    if (expPct !== null) {
      const pctStr = formatSignedPercent(expPct, format.percent)
      const worse = expPct > EPS
      const better = expPct < -EPS
      ordered.push({
        id: 'expenses_vs_prev',
        tone: better ? 'positive' : worse ? 'negative' : 'neutral',
        text:
          Math.abs(expPct) < EPS
            ? `Suas despesas ficaram no mesmo patamar do mês anterior.`
            : worse
              ? `Suas despesas aumentaram ${pctStr} em relação ao mês anterior.`
              : `Suas despesas reduziram ${pctStr} em relação ao mês anterior.`,
      })
    }

    const incPct = safePercentChange(
      previous.month_income,
      current.month_income
    )
    if (incPct !== null) {
      const pctStr = formatSignedPercent(incPct, format.percent)
      const up = incPct > EPS
      const down = incPct < -EPS
      ordered.push({
        id: 'income_vs_prev',
        tone: up ? 'positive' : down ? 'negative' : 'neutral',
        text:
          Math.abs(incPct) < EPS
            ? `Suas receitas ficaram no mesmo patamar do mês anterior.`
            : up
              ? `Suas receitas aumentaram ${pctStr} em relação ao mês anterior.`
              : `Suas receitas reduziram ${pctStr} em relação ao mês anterior.`,
      })
    }
  } else {
    const bal = current.month_balance
    if (Number.isFinite(bal)) {
      if (bal > EPS) {
        ordered.push({
          id: 'month_balance',
          tone: 'positive',
          text: `Você economizou ${format.currency(bal)} neste mês (saldo do fechamento).`,
        })
      } else if (bal < -EPS) {
        ordered.push({
          id: 'month_balance',
          tone: 'negative',
          text: `Seu saldo do mês foi negativo em ${format.currency(Math.abs(bal))} (fechamento).`,
        })
      } else {
        ordered.push({
          id: 'month_balance',
          tone: 'neutral',
          text: `Seu saldo do mês foi zero no fechamento de ${currentLabel}.`,
        })
      }
    }
  }

  return ordered.slice(0, 4)
}
