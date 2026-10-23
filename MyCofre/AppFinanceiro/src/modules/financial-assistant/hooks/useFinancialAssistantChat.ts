import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useCategories } from '../../../contexts/CategoriesContext'
import { useTransactions } from '../../../contexts/TransactionsContext'
import {
  clearLegacyAssistantTransactionsStorage,
  loadMessages,
  saveMessages,
} from '../services/financialAssistantStorage'
import { parseFinanceMessage } from '../services/parseFinanceMessage'
import type { AssistantMessage, ParsedFinanceAction, TransactionDraft } from '../types'
import { createDraftFromParsed } from '../utils/createDraftFromParsed'
import { formatAssistantReply } from '../utils/formatAssistantReply'
import { formatPreviewSummaryLine } from '../utils/previewFormatting'
import { resolveCategoryIdForDraft } from '../utils/resolveCategoryForDraft'

const MAX_MESSAGES = 80

function createClientId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export interface UseFinancialAssistantChatResult {
  messages: AssistantMessage[]
  hydrated: boolean
  input: string
  setInput: (v: string) => void
  currentDraft: TransactionDraft | null
  currentParsed: ParsedFinanceAction | null
  isProcessing: boolean
  isPersisting: boolean
  sendError: string | null
  canRetrySendError: boolean
  chatEndRef: RefObject<HTMLDivElement | null>
  setCurrentDraft: React.Dispatch<React.SetStateAction<TransactionDraft | null>>
  clearSendError: () => void
  handleSend: () => void
  handleConfirmDraft: () => Promise<void>
  retryLastFailedAction: () => Promise<void>
  handleCancelDraft: () => void
  applyQuickSuggestion: (text: string) => void
}

export function useFinancialAssistantChat(
  onConfirmSuccess?: () => void
): UseFinancialAssistantChatResult {
  const { user } = useAuth()
  const { categories, loading: categoriesLoading } = useCategories()
  const { addTransaction } = useTransactions()

  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [input, setInput] = useState('')
  const [currentDraft, setCurrentDraft] = useState<TransactionDraft | null>(null)
  const [currentParsed, setCurrentParsed] = useState<ParsedFinanceAction | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPersisting, setIsPersisting] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [lastFailedAction, setLastFailedAction] = useState<'confirm' | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const persistGuardRef = useRef(false)

  useEffect(() => {
    clearLegacyAssistantTransactionsStorage()
    setMessages(loadMessages())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const trimmed =
      messages.length > MAX_MESSAGES ? messages.slice(-MAX_MESSAGES) : messages
    saveMessages(trimmed)
  }, [messages, hydrated])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text) return

    setSendError(null)
    setLastFailedAction(null)
    setIsProcessing(true)

    window.setTimeout(() => {
      try {
        const userMsg: AssistantMessage = {
          id: createClientId('assistant-user'),
          role: 'user',
          content: text,
          createdAt: new Date().toISOString(),
        }

        const parsed = parseFinanceMessage(text)
        const replyText = formatAssistantReply(parsed)
        const assistantMsg: AssistantMessage = {
          id: createClientId('assistant-reply'),
          role: 'assistant',
          content: replyText,
          createdAt: new Date().toISOString(),
        }

        const draft = createDraftFromParsed(parsed)

        setMessages((prev) =>
          [...prev, userMsg, assistantMsg].slice(-MAX_MESSAGES)
        )
        setCurrentParsed(parsed)
        setCurrentDraft(draft)
        setInput('')

        if (
          parsed.missingFields.includes('valor') ||
          (parsed.data.amount != null && parsed.data.amount <= 0)
        ) {
          setSendError(
            'Não encontrei um valor no texto. Informe na prévia ou envie outra mensagem com o valor.'
          )
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Falha inesperada ao processar sua mensagem.'
        setSendError(`Não foi possível enviar sua mensagem. ${message}`)
      } finally {
        setIsProcessing(false)
      }
    }, 480)
  }, [input])

  const handleConfirmDraft = useCallback(async () => {
    if (!currentDraft || persistGuardRef.current) return
    if (currentDraft.amount <= 0 || !currentDraft.description.trim()) {
      setSendError('Para confirmar, preencha um valor e uma descrição.')
      return
    }
    if (!currentDraft.date) {
      setSendError('Informe a data do lançamento na prévia.')
      return
    }

    if (!user?.id) {
      setSendError('Faça login para salvar o lançamento no app.')
      return
    }

    if (categoriesLoading) {
      setSendError('Aguarde, carregando categorias…')
      return
    }

    const categoryId = resolveCategoryIdForDraft(categories, currentDraft)
    if (!categoryId) {
      setSendError(
        'Não há categorias para este tipo. Crie uma categoria em Transações ou nas configurações.'
      )
      return
    }

    persistGuardRef.current = true
    setIsPersisting(true)
    setSendError(null)
    setLastFailedAction(null)

    const done: TransactionDraft = { ...currentDraft }
    let persistErrorMessage: string | null = null

    const ok = await addTransaction(
      {
        user_id: user.id,
        account_id: null,
        category_id: categoryId,
        type: done.type,
        description: done.description.trim(),
        amount: done.amount,
        transaction_date: done.date,
        notes: null,
        recurrence: 'none',
        credit_card_id: null,
        exclude_from_month_expense_summary: false,
      },
      {
        silent: true,
        suppressErrorToast: true,
        onError: (message) => {
          persistErrorMessage = message
        },
      }
    )

    if (!ok) {
      setSendError(
        persistErrorMessage ?? 'Ocorreu um erro ao salvar. Tente novamente.'
      )
      setLastFailedAction('confirm')
      setIsPersisting(false)
      persistGuardRef.current = false
      return
    }

    const ack: AssistantMessage = {
      id: createClientId('assistant-ack'),
      role: 'assistant',
      content: `Lançamento salvo no app: ${formatPreviewSummaryLine(
        done
      )}. Você já vê em Transações e na visão geral.`,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, ack].slice(-MAX_MESSAGES))
    setCurrentDraft(null)
    setCurrentParsed(null)
    setInput('')
    setLastFailedAction(null)

    setIsPersisting(false)
    persistGuardRef.current = false
    onConfirmSuccess?.()
  }, [
    currentDraft,
    user?.id,
    categories,
    categoriesLoading,
    addTransaction,
    onConfirmSuccess,
  ])

  const handleCancelDraft = useCallback(() => {
    setCurrentDraft(null)
    setCurrentParsed(null)
    setSendError(null)
    setLastFailedAction(null)
  }, [])

  const applyQuickSuggestion = useCallback((text: string) => {
    setInput(text)
    setSendError(null)
    setLastFailedAction(null)
  }, [])

  const retryLastFailedAction = useCallback(async () => {
    if (lastFailedAction === 'confirm') {
      await handleConfirmDraft()
    }
  }, [lastFailedAction, handleConfirmDraft])

  return {
    messages,
    hydrated,
    input,
    setInput,
    currentDraft,
    currentParsed,
    isProcessing,
    isPersisting,
    sendError,
    canRetrySendError: lastFailedAction === 'confirm',
    chatEndRef,
    setCurrentDraft,
    clearSendError: () => {
      setSendError(null)
      setLastFailedAction(null)
    },
    handleSend,
    handleConfirmDraft,
    retryLastFailedAction,
    handleCancelDraft,
    applyQuickSuggestion,
  }
}
