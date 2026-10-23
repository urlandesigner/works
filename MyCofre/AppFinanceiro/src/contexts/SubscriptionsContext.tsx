import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Subscription } from '../types'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { getSupabaseBrowserClient } from '../lib/supabase/client'
import {
  deleteSubscriptionRow,
  fetchSubscriptionsForUser,
  insertSubscription,
  updateSubscriptionRow,
} from '../lib/supabase/subscriptionsRepo'

type SubscriptionUpdate = Omit<Subscription, 'id' | 'user_id'>
type SubscriptionCreate = Omit<Subscription, 'id'>

interface SubscriptionsContextValue {
  subscriptions: Subscription[]
  loading: boolean
  error: string | null
  addSubscription: (data: SubscriptionCreate) => Promise<Subscription | null>
  updateSubscription: (
    id: string,
    data: Partial<SubscriptionUpdate>
  ) => Promise<boolean>
  deleteSubscription: (id: string) => Promise<boolean>
  getSubscriptionById: (id: string) => Subscription | undefined
  refetchSubscriptions: () => Promise<void>
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(
  null
)

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { error: toastError } = useToast()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id ?? null

  const loadSubscriptions = useCallback(async () => {
    if (!userId) {
      setSubscriptions([])
      setLoading(false)
      setError(null)
      return
    }
    const client = getSupabaseBrowserClient()
    if (!client) {
      setSubscriptions([])
      setLoading(false)
      setError('Supabase não configurado.')
      toastError('Supabase não configurado. Verifique o arquivo .env.')
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await fetchSubscriptionsForUser(
      client,
      userId
    )
    if (err) {
      setSubscriptions([])
      setError(err.message)
      toastError(err.message)
    } else {
      setSubscriptions(data)
      setError(null)
    }
    setLoading(false)
  }, [userId, toastError])

  useEffect(() => {
    void loadSubscriptions()
  }, [loadSubscriptions])

  const addSubscription = useCallback(
    async (data: SubscriptionCreate): Promise<Subscription | null> => {
      if (!userId) {
        toastError('Sessão inválida. Faça login novamente.')
        return null
      }
      const client = getSupabaseBrowserClient()
      if (!client) {
        toastError('Supabase não configurado.')
        return null
      }
      const { data: row, error: insertErr } = await insertSubscription(
        client,
        userId,
        { ...data, user_id: userId }
      )
      if (insertErr) {
        setError(insertErr.message)
        toastError(insertErr.message)
        return null
      }
      if (row) {
        setSubscriptions((prev) => [...prev, row])
        setError(null)
      }
      return row
    },
    [userId, toastError]
  )

  const updateSubscription = useCallback(
    async (id: string, data: Partial<SubscriptionUpdate>): Promise<boolean> => {
      if (!userId) {
        toastError('Sessão inválida. Faça login novamente.')
        return false
      }
      const client = getSupabaseBrowserClient()
      if (!client) {
        toastError('Supabase não configurado.')
        return false
      }
      const { data: row, error: updateErr } = await updateSubscriptionRow(
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
      if (row) {
        setSubscriptions((prev) => prev.map((s) => (s.id === id ? row : s)))
        setError(null)
      } else {
        /* Resposta sem linha (ex.: edge do driver): mescla o patch para não manter lembretes/UI defasados. */
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...data } : s))
        )
        setError(null)
      }
      return true
    },
    [userId, toastError]
  )

  const deleteSubscription = useCallback(
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
      const { error: delErr } = await deleteSubscriptionRow(
        client,
        userId,
        id
      )
      if (delErr) {
        setError(delErr.message)
        toastError(delErr.message)
        return false
      }
      setSubscriptions((prev) => prev.filter((s) => s.id !== id))
      setError(null)
      return true
    },
    [userId, toastError]
  )

  const getSubscriptionById = useCallback(
    (id: string) => subscriptions.find((s) => s.id === id),
    [subscriptions]
  )

  const value = useMemo<SubscriptionsContextValue>(
    () => ({
      subscriptions,
      loading,
      error,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      getSubscriptionById,
      refetchSubscriptions: loadSubscriptions,
    }),
    [
      subscriptions,
      loading,
      error,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      getSubscriptionById,
      loadSubscriptions,
    ]
  )

  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
    </SubscriptionsContext.Provider>
  )
}

export function useSubscriptions(): SubscriptionsContextValue {
  const ctx = useContext(SubscriptionsContext)
  if (!ctx) {
    throw new Error(
      'useSubscriptions deve ser usado dentro de SubscriptionsProvider'
    )
  }
  return ctx
}
