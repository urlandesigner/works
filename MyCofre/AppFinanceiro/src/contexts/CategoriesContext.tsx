import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Category } from '../types'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { getSupabaseBrowserClient } from '../lib/supabase/client'
import { fetchCategoriesForUser } from '../lib/supabase/categoriesRepo'

interface CategoriesContextValue {
  categories: Category[]
  loading: boolean
  error: string | null
  /** Nome da categoria ou "—" se não existir no banco. */
  getCategoryName: (categoryId: string) => string
  refetchCategories: () => Promise<void>
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null)

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { error: toastError } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id ?? null

  const loadCategories = useCallback(async () => {
    if (!userId) {
      setCategories([])
      setLoading(false)
      setError(null)
      return
    }
    const client = getSupabaseBrowserClient()
    if (!client) {
      setCategories([])
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await fetchCategoriesForUser(client, userId)
    if (err) {
      setCategories([])
      setError(err.message)
      toastError(err.message)
    } else {
      setCategories(data)
    }
    setLoading(false)
  }, [userId, toastError])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  const getCategoryName = useCallback(
    (categoryId: string) =>
      categories.find((c) => c.id === categoryId)?.name ?? '—',
    [categories]
  )

  const value = useMemo<CategoriesContextValue>(
    () => ({
      categories,
      loading,
      error,
      getCategoryName,
      refetchCategories: loadCategories,
    }),
    [categories, loading, error, getCategoryName, loadCategories]
  )

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories(): CategoriesContextValue {
  const ctx = useContext(CategoriesContext)
  if (!ctx) {
    throw new Error('useCategories deve ser usado dentro de CategoriesProvider')
  }
  return ctx
}
