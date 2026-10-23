import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Goal } from '../types'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { getSupabaseBrowserClient } from '../lib/supabase/client'
import {
  deleteGoalRow,
  fetchGoalsForUser,
  insertGoal,
  updateGoalRow,
} from '../lib/supabase/goalsRepo'

type GoalUpdate = Omit<Goal, 'id' | 'user_id'>
type GoalCreate = Omit<Goal, 'id'>

interface GoalsContextValue {
  goals: Goal[]
  loading: boolean
  error: string | null
  addGoal: (data: GoalCreate) => Promise<boolean>
  updateGoal: (id: string, data: Partial<GoalUpdate>) => Promise<boolean>
  deleteGoal: (id: string) => Promise<boolean>
  getGoalById: (id: string) => Goal | undefined
  refetchGoals: () => Promise<void>
}

const GoalsContext = createContext<GoalsContextValue | null>(null)

export function GoalsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { error: toastError } = useToast()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id ?? null

  const loadGoals = useCallback(async () => {
    if (!userId) {
      setGoals([])
      setLoading(false)
      setError(null)
      return
    }

    const client = getSupabaseBrowserClient()
    if (!client) {
      setGoals([])
      setLoading(false)
      setError('Supabase não configurado.')
      toastError('Supabase não configurado. Verifique o arquivo .env.')
      return
    }

    setLoading(true)
    setError(null)
    const { data, error: fetchErr } = await fetchGoalsForUser(client, userId)
    if (fetchErr) {
      setGoals([])
      setError(fetchErr.message)
      toastError(fetchErr.message)
    } else {
      setGoals(data)
    }
    setLoading(false)
  }, [userId, toastError])

  useEffect(() => {
    void loadGoals()
  }, [loadGoals])

  const addGoal = useCallback(
    async (data: GoalCreate): Promise<boolean> => {
      if (!userId) {
        toastError('Sessão inválida. Faça login novamente.')
        return false
      }
      const client = getSupabaseBrowserClient()
      if (!client) {
        toastError('Supabase não configurado.')
        return false
      }

      const { data: row, error: insertErr } = await insertGoal(client, userId, {
        ...data,
        user_id: userId,
      })
      if (insertErr) {
        setError(insertErr.message)
        toastError(insertErr.message)
        return false
      }
      if (row) {
        setGoals((prev) => [row, ...prev])
        setError(null)
      }
      return true
    },
    [userId, toastError]
  )

  const updateGoal = useCallback(
    async (id: string, data: Partial<GoalUpdate>): Promise<boolean> => {
      if (!userId) {
        toastError('Sessão inválida. Faça login novamente.')
        return false
      }
      const client = getSupabaseBrowserClient()
      if (!client) {
        toastError('Supabase não configurado.')
        return false
      }

      const { data: row, error: updateErr } = await updateGoalRow(
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
        setGoals((prev) => prev.map((g) => (g.id === id ? row : g)))
        setError(null)
      }
      return true
    },
    [userId, toastError]
  )

  const deleteGoal = useCallback(
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

      const { error: delErr } = await deleteGoalRow(client, userId, id)
      if (delErr) {
        setError(delErr.message)
        toastError(delErr.message)
        return false
      }
      setGoals((prev) => prev.filter((g) => g.id !== id))
      setError(null)
      return true
    },
    [userId, toastError]
  )

  const getGoalById = useCallback(
    (id: string) => goals.find((g) => g.id === id),
    [goals]
  )

  const value = useMemo<GoalsContextValue>(
    () => ({
      goals,
      loading,
      error,
      addGoal,
      updateGoal,
      deleteGoal,
      getGoalById,
      refetchGoals: loadGoals,
    }),
    [goals, loading, error, addGoal, updateGoal, deleteGoal, getGoalById, loadGoals]
  )

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  )
}

export function useGoals(): GoalsContextValue {
  const ctx = useContext(GoalsContext)
  if (!ctx) {
    throw new Error('useGoals deve ser usado dentro de GoalsProvider')
  }
  return ctx
}
