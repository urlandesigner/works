/**
 * Normalização para PDFs com texto quebrado (espaços no meio das palavras).
 * Usado só para localizar seções e títulos — não substitui o texto original das linhas.
 */

function stripDiacriticsChar(ch: string): string {
  return ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/** Letra latina minúscula sem acento, ou null. */
function letterToCompact(ch: string): string | null {
  if (!/[a-zA-ZÀ-ÿ]/.test(ch)) return null
  return stripDiacriticsChar(ch).toLowerCase()
}

/**
 * Compacta o texto: remove espaços, pontuação e junta letras/dígitos como no PDF “quebrado”.
 * Mantém mapa compact[i] → índice no string original do caractere que gerou compact[i].
 */
export function buildCompactWithMap(raw: string): {
  compact: string
  indexMap: number[]
} {
  const parts: string[] = []
  const indexMap: number[] = []

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]!
    if (/\s/.test(c)) continue
    if (/[.,;:!?\-_()[\]{}"'`´]/.test(c)) continue
    const letter = letterToCompact(c)
    if (letter) {
      parts.push(letter)
      indexMap.push(i)
    } else if (/[0-9]/.test(c)) {
      parts.push(c)
      indexMap.push(i)
    }
  }

  return { compact: parts.join(''), indexMap }
}

/** Janela máxima (no compact) entre início de "lancamentos" e fim de "saques". */
const MAX_HEADER_SPAN = 900

/**
 * Encontra onde termina o título da seção (após "saques") no texto original.
 * Palavras-chave: lancamentos → compras → saques (ordem, próximas no compact).
 */
export function findHeaderEndAfterLancamentosComprasSaques(raw: string): number | null {
  const { compact, indexMap } = buildCompactWithMap(raw)
  if (compact.length === 0 || indexMap.length === 0) return null

  const kw1 = 'lancamentos'
  const kw2 = 'compras'
  const kw3 = 'saques'

  let from = 0
  while (from < compact.length) {
    const i1 = compact.indexOf(kw1, from)
    if (i1 < 0) return null
    const i2 = compact.indexOf(kw2, i1 + kw1.length)
    if (i2 < 0) {
      from = i1 + 1
      continue
    }
    const i3 = compact.indexOf(kw3, i2 + kw2.length)
    if (i3 < 0) {
      from = i1 + 1
      continue
    }
    if (i3 - i1 > MAX_HEADER_SPAN) {
      from = i1 + 1
      continue
    }
    const endCompactIdx = i3 + kw3.length - 1
    const rawEnd = indexMap[endCompactIdx]
    if (rawEnd === undefined) return null
    return rawEnd + 1
  }

  return null
}
