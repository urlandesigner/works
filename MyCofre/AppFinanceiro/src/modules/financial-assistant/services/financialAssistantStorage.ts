import type { AssistantMessage } from '../types'

const MSG_KEY = 'appfinanceiro.financial-assistant.messages.v1'
const TX_KEY = 'appfinanceiro.financial-assistant.transactions.v1'

export function loadMessages(): AssistantMessage[] {
  try {
    const raw = localStorage.getItem(MSG_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AssistantMessage[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveMessages(messages: AssistantMessage[]): void {
  localStorage.setItem(MSG_KEY, JSON.stringify(messages))
}

/** Remove dados legados de “confirmados só no navegador”; lançamentos reais vão ao banco. */
export function clearLegacyAssistantTransactionsStorage(): void {
  try {
    localStorage.removeItem(TX_KEY)
  } catch {
    /* ignore */
  }
}
