import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Investment } from '../types'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { getSupabaseBrowserClient } from '../lib/supabase/client'
import {
  deleteInvestmentRow,
  fetchInvestmentsForUser,
  insertInvestment,
  updateInvestmentRow,
} from '../lib/supabase/investmentsRepo'

type InvestmentUpdate = Omit<Investment, 'id' | 'user_id'>
type InvestmentCreate = Omit<Investment, 'id'>

interface InvestmentsContextValue {
  investments: Investment[]
  loading: boolean
  error: string | null
  addInvestment: (data: InvestmentCreate) => Promise<Investment | null>
  updateInvestment: (
    id: string,
    data: Partial<InvestmentUpdate>
  ) => Promise<boolean>
  deleteInvestment: (id: string) => Promise<boolean>
  getInvestmentById: (id: string) => Investment | undefined
  refetchInvestments: () => Promise<void>
}

const InvestmentsContext = createContext<InvestmentsContextValue | null>(null)

export function InvestmentsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { error: toastError } = useToast()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id ?? null

  const loadInvestments = useCallback(async () => {
    if (!userId) {
      setInvestments([])
      setLoading(false)
      setError(null)
      return
    }
    const client = getSupabaseBrowserClient()
    if (!client) {
      setInvestments([])
      setLoading(false)
      setError('Supabase não configurado.')
      toastError('Supabase não configurado. Verifique o arquivo .env.')
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await fetchInvestmentsForUser(client, userId)
    if (err) {
      setInvestments([])
      setError(err.message)
      toastError(err.message)
    } else {
      setInvestments(data)
    }
    setLoading(false)
  }, [userId, toastError])

  useEffect(() => {
    void loadInvestments()
  }, [loadInvestments])

  const addInvestment = useCallback(
    async (data: InvestmentCreate): Promise<Investment | null> => {
      if (!userId) {
        toastError('Sessão inválida. Faça login novamente.')
        return null
      }
      const client = getSupabaseBrowserClient()
      if (!client) {
        toastError('Supabase não configurado.')
        return null
      }
      const { data: row, error: insertErr } = await insertInvestment(
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
        setInvestments((prev) => [...prev, row])
        setError(null)
      }
      return row
    },
    [userId, toastError]
  )

  const updateInvestment = useCallback(
    async (id: string, data: Partial<InvestmentUpdate>): Promise<boolean> => {
      if (!userId) {
        toastError('Sessão inválida. Faça login novamente.')
        return false
      }
      const client = getSupabaseBrowserClient()
      if (!client) {
        toastError('Supabase não configurado.')
        return false
      }
      const { data: row, error: updateErr } = await updateInvestmentRow(
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
        setInvestments((prev) => prev.map((i) => (i.id === id ? row : i)))
        setError(null)
      }
      return true
    },
    [userId, toastError]
  )

  const getInvestmentById = useCallback(
    (id: string) => investments.find((i) => i.id === id),
    [investments]
  )

  const deleteInvestment = useCallback(
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
      const { error: delErr } = await deleteInvestmentRow(client, userId, id)
      if (delErr) {
        setError(delErr.message)
        toastError(delErr.message)
        return false
      }
      setInvestments((prev) => prev.filter((i) => i.id !== id))
      setError(null)
      return true
    },
    [userId, toastError]
  )

  const value = useMemo<InvestmentsContextValue>(
    () => ({
      investments,
      loading,
      error,
      addInvestment,
      updateInvestment,
      deleteInvestment,
      getInvestmentById,
      refetchInvestments: loadInvestments,
    }),
    [
      investments,
      loading,
      error,
      addInvestment,
      updateInvestment,
      deleteInvestment,
      getInvestmentById,
      loadInvestments,
    ]
  )

  return (
    <InvestmentsContext.Provider value={value}>
      {children}
    </InvestmentsContext.Provider>
  )
}

export function useInvestments(): InvestmentsContextValue {
  const ctx = useContext(InvestmentsContext)
  if (!ctx) {
    throw new Error(
      'useInvestments deve ser usado dentro de InvestmentsProvider'
    )
  }
  return ctx
}
