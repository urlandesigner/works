import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import type { Transaction } from '../types'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { getSupabaseBrowserClient } from '../lib/supabase/client'
import {
  deleteTransactionRow,
  fetchTransactionsForUser,
  insertTransaction,
  updateTransactionRow,
} from '../lib/supabase/transactionsRepo'

type TransactionUpdate = Omit<Transaction, 'id' | 'user_id'>
type TransactionCreate = Omit<Transaction, 'id'>

interface TransactionsContextValue {
  transactions: Transaction[]
  /** Carregamento inicial ou recarregamento explícito. */
  loading: boolean
  /** Último erro de rede/API (lista ou mutação). */
  error: string | null
  addTransaction: (
    data: TransactionCreate,
    options?: {
      silent?: boolean
      suppressErrorToast?: boolean
      onError?: (message: string) => void
    }
  ) => Promise<boolean>
  updateTransaction: (
    id: string,
    data: Partial<TransactionUpdate>
  ) => Promise<boolean>
  deleteTransaction: (id: string) => Promise<boolean>
  getTransactionById: (id: string) => Transaction | undefined
  refetchTransactions: () => Promise<void>
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null)

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { error: toastError, success: toastSuccess } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id ?? null

  const loadTransactions = useCallback(async () => {
    if (!userId) {
      setTransactions([])
      setLoading(false)
      setError(null)
      return
    }

    const client = getSupabaseBrowserClient()
    if (!client) {
      setTransactions([])
      setLoading(false)
      setError('Supabase não configurado.')
      toastError('Supabase não configurado. Verifique o arquivo .env.')
      return
    }

    setLoading(true)
    setError(null)
    const { data, error: fetchErr } = await fetchTransactionsForUser(
      client,
      userId
    )
    if (fetchErr) {
      setTransactions([])
      setError(fetchErr.message)
      toastError(fetchErr.message)
    } else {
      setTransactions(data)
    }
    setLoading(false)
  }, [userId, toastError])

  useEffect(() => {
    void loadTransactions()
  }, [loadTransactions])

  const addTransaction = useCallback(
    async (
      data: TransactionCreate,
      options?: {
        silent?: boolean
        suppressErrorToast?: boolean
        onError?: (message: string) => void
      }
    ): Promise<boolean> => {
      const emitError = (message: string) => {
        setError(message)
        options?.onError?.(message)
        if (!options?.suppressErrorToast) {
          toastError(message)
        }
      }

      if (!userId) {
        emitError('Sessão inválida. Faça login novamente.')
        return false
      }
      const client = getSupabaseBrowserClient()
      if (!client) {
        emitError('Supabase não configurado.')
        return false
      }

      try {
        const { data: row, error: insertErr } = await insertTransaction(
          client,
          userId,
          { ...data, user_id: userId }
        )
        if (insertErr) {
          emitError(insertErr.message)
          return false
        }
        if (!row) {
          const msg =
            'A transação não foi retornada pelo servidor. Verifique a conexão e tente de novo.'
          emitError(msg)
          return false
        }
        setTransactions((prev) => [row, ...prev])
        setError(null)
        if (!options?.silent) {
          flushSync(() => {
            toastSuccess('Transação registrada com sucesso.')
          })
        }
        return true
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : 'Erro inesperado ao salvar a transação.'
        emitError(msg)
        return false
      }
    },
    [userId, toastError, toastSuccess]
  )

  const updateTransaction = useCallback(
    async (id: string, data: Partial<TransactionUpdate>): Promise<boolean> => {
      if (!userId) {
        toastError('Sessão inválida. Faça login novamente.')
        return false
      }
      const client = getSupabaseBrowserClient()
      if (!client) {
        toastError('Supabase não configurado.')
        return false
      }

      try {
        const { data: row, error: updateErr } = await updateTransactionRow(
          client,
          userId,
          id,
          data
        )
        if (updateErr) {
          setError(updateErr.message)
          toastError(updateErr.message)
          return false
        }
        if (!row) {
          const msg =
            'A transação atualizada não foi retornada pelo servidor. Tente novamente.'
          setError(msg)
          toastError(msg)
          return false
        }
        setTransactions((prev) => prev.map((t) => (t.id === id ? row : t)))
        setError(null)
        return true
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : 'Erro inesperado ao atualizar a transação.'
        setError(msg)
        toastError(msg)
        return false
      }
    },
    [userId, toastError]
  )

  const deleteTransaction = useCallback(
    async (id: string): Promise<boolean> => {
      if (!userId) {
        toastError('Sessão inválida. Faça login novamente.')
        return false
      }
      const client = getSupabaseBrowserClient()
      if (!client) {
        toastError('Supabase não configurado.')
        return false
      }

      const { error: delErr } = await deleteTransactionRow(client, userId, id)
      if (delErr) {
        setError(delErr.message)
        toastError(delErr.message)
        return false
      }
      setTransactions((prev) => prev.filter((t) => t.id !== id))
      setError(null)
      return true
    },
    [userId, toastError]
  )

  const getTransactionById = useCallback(
    (id: string) => transactions.find((t) => t.id === id),
    [transactions]
  )

  const value = useMemo<TransactionsContextValue>(
    () => ({
      transactions,
      loading,
      error,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTransactionById,
      refetchTransactions: loadTransactions,
    }),
    [
      transactions,
      loading,
      error,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTransactionById,
      loadTransactions,
    ]
  )

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions(): TransactionsContextValue {
  const ctx = useContext(TransactionsContext)
  if (!ctx) {
    throw new Error(
      'useTransactions deve ser usado dentro de TransactionsProvider'
    )
  }
  return ctx
}
