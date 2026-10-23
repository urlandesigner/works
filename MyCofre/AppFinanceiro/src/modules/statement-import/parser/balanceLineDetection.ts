/**
 * Identifica linhas que não são lançamentos reais (saldo, resumo, rodapé, etc.).
 * Texto deve estar normalizado (ver normalizeForMatching).
 */

const NON_TRANSACTION_PHRASES: string[] = [
  'saldo do dia',
  'saldo anterior',
  'saldo final',
  'saldo em conta',
  'saldo disponivel',
  'saldo disponível',
  'saldo atual',
  'saldo total',
  'saldo bloqueado',
  'saldo investido',
  'limite da conta',
  'limite total',
  'limite disponivel',
  'limite disponível',
  'limite de credito',
  'limite de crédito',
  'total do dia',
  'total geral',
  'total creditos',
  'total créditos',
  'total debitos',
  'total débitos',
  'resumo do periodo',
  'resumo do período',
  'resumo do extrato',
  'movimentacao futura',
  'movimentação futura',
  'dados da conta',
  'dados do cartao',
  'dados do cartão',
  'extrato de conta',
  'extrato conta corrente',
  'agencia:',
  'agência:',
  'continua na proxima',
  'continua na próxima',
  'itau unibanco',
  'itaú unibanco',
  'sac ',
  'ouvidoria',
  'central de atendimento',
  'fale conosco',
  'www.itau',
  'www.itaú',
]

/** Padrões que indicam numeração de página ou fim de extrato */
const NON_TRANSACTION_REGEX: RegExp[] = [
  /^\s*pagina\s+\d+/i,
  /^\s*página\s+\d+/i,
  /^\s*pag\.\s*\d+/i,
  /^\s*\d+\s*\/\s*\d+\s*$/, // só "3 / 12"
  /^\s*folha\s+\d+/i,
]

export function normalizeForMatching(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Retorna true se a descrição parece ser saldo, resumo, cabeçalho institucional ou rodapé — não um lançamento.
 */
export function isNonTransactionLine(description: string): boolean {
  const n = normalizeForMatching(description)
  if (n.length < 3) return true

  for (const phrase of NON_TRANSACTION_PHRASES) {
    if (n.includes(phrase)) return true
  }

  // Linha que é só a palavra "saldo" ou começa com saldo seguido de valor (já capturado por regex em outros casos)
  if (/^saldo\s*$/i.test(n.trim())) return true

  for (const re of NON_TRANSACTION_REGEX) {
    if (re.test(n)) return true
  }

  return false
}

/** Alias: linhas de saldo/resumo/rodapé não são lançamentos. */
export const isBalanceOrSummaryLine = isNonTransactionLine
