/**
 * Deixa a descrição mais legível: tira preposições soltas no início,
 * capitaliza palavras e normaliza nomes conhecidos (ex.: ifood → iFood).
 */
const LEADING_PREP =
  /^(?:de|do|da|dos|das|no|na|nos|nas|em|pelo|pela|a|o|pra|pro|prá)\s+/i

/** Marcas e serviços com grafia preferida (minúsculo → forma exibida). */
const KNOWN_NAMES: Record<string, string> = {
  ifood: 'iFood',
  uber: 'Uber',
  nubank: 'Nubank',
  picpay: 'PicPay',
  inter: 'Inter',
  rappi: 'Rappi',
  shopee: 'Shopee',
  mercadolivre: 'Mercado Livre',
  'mercado livre': 'Mercado Livre',
  netflix: 'Netflix',
  spotify: 'Spotify',
  kabum: 'Kabum',
  ame: 'Ame Digital',
}

function capitalizeToken(token: string): string {
  const lower = token.toLowerCase()
  if (KNOWN_NAMES[lower]) return KNOWN_NAMES[lower]
  if (/^\d+[,.]?\d*$/.test(token)) return token
  if (token.length <= 1) return token.toUpperCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

export function normalizeDescription(raw: string): string {
  let s = raw.trim().replace(/\s+/g, ' ')
  if (s.length < 2) return s

  while (LEADING_PREP.test(s)) {
    s = s.replace(LEADING_PREP, '').trim()
  }

  const tokens = s.split(/\s+/)
  const multi = s.toLowerCase()
  if (KNOWN_NAMES[multi]) return KNOWN_NAMES[multi]

  return tokens.map(capitalizeToken).join(' ')
}
