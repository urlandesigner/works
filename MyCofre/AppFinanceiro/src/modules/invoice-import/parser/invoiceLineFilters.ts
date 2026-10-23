/**
 * Filtra linhas que não são compras/lançamentos reais em faturas de cartão (texto já normalizado).
 */

export function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const SKIP_PHRASES: string[] = [
  'pagamento de fatura',
  'pagamento recebido',
  'credito de pagamento',
  'crédito de pagamento',
  'pagamento em',
  'saldo anterior',
  'saldo em',
  'saldo atual',
  'saldo da fatura',
  'limite total',
  'limite disponivel',
  'limite disponível',
  'limite de credito',
  'limite de crédito',
  'pagamento minimo',
  'pagamento mínimo',
  'melhor dia de compra',
  'melhor dia',
  'rotativo',
  'juros',
  'multa',
  'iof',
  'total de creditos',
  'total de créditos',
  'total de debitos',
  'total de débitos',
  'resumo da fatura',
  'resumo financeiro',
  'dados do cartao',
  'dados do cartão',
  'final do cartao',
  'final do cartão',
  'www.',
  'sac ',
  'ouvidoria',
  'fale conosco',
  'mensagem institucional',
  'oferta',
  'promocao',
  'promoção',
  'cashback',
  'anuidade',
  'seguro prestamista',
  'protecao',
  'proteção',
  'pagina',
  'página',
  'continua',
  'proxima fatura',
  'demais faturas',
  'dolar de conversao',
  'conversao em dolar',
  'valor convertido',
  'total financiado',
]

/** Linha inteira é rodapé, SAC, telefone ou aviso — não lançamento. */
export function isSkippableInvoiceLineWhole(line: string): boolean {
  const n = normalizeForMatch(line)
  if (n.length < 3) return true

  const wholePhrases = [
    'proxima fatura',
    'demais faturas',
    'dolar de conversao',
    'conversao em dolar',
    'valor convertido',
    'encargos de',
    'sac ',
    'sac:',
    'ouvidoria',
    'fale conosco',
    'central de atendimento',
    'www.',
    'http',
    'total de encargos',
    'total encargos',
  ]
  for (const p of wholePhrases) {
    if (n.includes(p)) return true
  }

  if (/^\s*encargos\b/i.test(line.trim())) return true
  if (/^\s*iof\b/i.test(line.trim())) return true
  if (/^\s*juros\b/i.test(line.trim())) return true

  if (/^[\d\s\-()]+$/.test(n) && n.replace(/\D/g, '').length >= 10) return true

  return false
}

/** Retorna true se a descrição parece ser resumo/institucional — não compra. */
export function isNonPurchaseLine(description: string): boolean {
  const n = normalizeForMatch(description)
  if (n.length < 4) return true

  for (const phrase of SKIP_PHRASES) {
    if (n.includes(phrase)) return true
  }

  if (/^total\s+(geral|da fatura|a pagar)\s*$/i.test(n)) return true
  if (/^subtotal/i.test(n)) return true

  return false
}
