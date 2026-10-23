type Candidate = {
  transaction_date: string
  amount: number
  description: string | null
}

type CandidateItem = {
  transactionDate: string
  amount: number
  description: string
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0
  if (a === b) return 1
  const wordsA = new Set(a.split(' '))
  const wordsB = new Set(b.split(' '))
  const intersection = [...wordsA].filter((word) => wordsB.has(word)).length
  const union = new Set([...wordsA, ...wordsB]).size
  return union > 0 ? intersection / union : 0
}

export function detectDuplicate(
  item: CandidateItem,
  candidates: Candidate[]
): { duplicate: boolean; reason: string | null } {
  const baseDescription = normalize(item.description)
  for (const candidate of candidates) {
    if (candidate.transaction_date !== item.transactionDate) continue
    if (Math.abs(candidate.amount - item.amount) > 0.009) continue

    const targetDescription = normalize(candidate.description ?? '')
    const score = similarity(baseDescription, targetDescription)
    if (score >= 0.55) {
      return {
        duplicate: true,
        reason: 'Mesmo valor/data e descricao muito parecida com lancamento existente.',
      }
    }
  }

  return { duplicate: false, reason: null }
}
