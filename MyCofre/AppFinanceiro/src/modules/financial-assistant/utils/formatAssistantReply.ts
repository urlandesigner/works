import type { ParsedFinanceAction } from '../types'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatAssistantReply(p: ParsedFinanceAction): string {
  const amount = p.data.amount
  const hasAmount = amount != null && amount > 0
  const type = p.data.type ?? 'expense'
  const tipoLabel = type === 'income' ? 'Receita' : 'Despesa'
  const money = hasAmount ? BRL.format(amount!) : null
  const category = p.data.category?.trim()
  const desc = p.data.description?.trim() ?? ''

  const sentences: string[] = []

  if (!hasAmount && p.intent === 'unknown') {
    sentences.push(
      'Não consegui montar o lançamento só com essa frase. Inclua um valor ou reformule, e ajuste na prévia se precisar.'
    )
  } else if (hasAmount && p.intent !== 'unknown') {
    const mid = category
      ? `${tipoLabel} de ${money} (${category})`
      : desc
        ? `${tipoLabel} de ${money} — ${desc}`
        : `${tipoLabel} de ${money}`
    sentences.push(`Prévia criada: ${mid}.`)
    sentences.push('Confirme para salvar no seu app ou edite se precisar.')
  } else if (hasAmount) {
    sentences.push(`Prévia criada: valor ${money}. Confira o tipo e a descrição no card abaixo.`)
    sentences.push('Confirme para salvar no seu app ou edite se precisar.')
  } else {
    sentences.push(
      desc
        ? `Anotei: “${desc}”. Falta o valor para fechar a prévia — informe no card abaixo ou envie outra mensagem.`
        : 'Falta o valor para fechar a prévia — informe no card abaixo ou envie outra mensagem.'
    )
  }

  if (p.missingFields.includes('descrição')) {
    sentences.push('A descrição ficou incompleta; complete no campo da prévia.')
  }

  if (p.data.dateAssumed && hasAmount) {
    sentences.push(
      'Não vi data no texto, então usei hoje — altere na prévia se for outro dia.'
    )
  }

  return sentences.join(' ')
}
