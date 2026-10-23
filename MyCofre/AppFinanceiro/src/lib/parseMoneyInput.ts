/**
 * Interpreta texto monetário no padrão brasileiro comum:
 * vírgula como decimal; pontos como separador de milhar quando há vírgula.
 * Sem vírgula, aceita ponto como decimal (ex.: `38571.00` de toFixed — não
 * confundir com milhar: não remover o ponto decimal).
 */
export function parseMoneyInput(raw: string): number {
  const s = normalizeMoneyRaw(raw)
  if (!s) return Number.NaN
  if (s.includes(',')) {
    const withoutThousands = s.replace(/\./g, '')
    return Number.parseFloat(withoutThousands.replace(',', '.'))
  }
  return Number.parseFloat(s)
}

function normalizeMoneyRaw(raw: string): string {
  return raw.trim().replace(/\s/g, '').replace(/R\$\s?/gi, '')
}

/**
 * Como `parseMoneyInput`, mas retorna `null` se vazio ou inválido.
 * Aceita pt-BR (`38.571,00`) e ponto decimal EN (`38571.00`).
 */
export function parseMoneyInputLoose(raw: string): number | null {
  const s = normalizeMoneyRaw(raw ?? '')
  if (!s) return null
  const n = parseMoneyInput(s)
  return Number.isFinite(n) ? n : null
}

/** Valor inicial em formulário (pt-BR). */
export function formatMoneyForInput(value: number): string {
  if (!Number.isFinite(value)) return ''
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
