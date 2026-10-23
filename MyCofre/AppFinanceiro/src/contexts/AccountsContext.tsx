import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Account } from '../types'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { getSupabaseBrowserClient } from '../lib/supabase/client'
import {
  deleteAccountRow,
  fetchAccountsForUser,
  insertAccount,
  updateAccountRow,
} from '../lib/supabase/accountsRepo'

type AccountUpdate = Omit<Account, 'id' | 'user_id'>
type AccountCreate = Omit<Account, 'id'>

interface AccountsContextValue {
  accounts: Account[]
  loading: boolean
  error: string | null
  addAccount: (data: AccountCreate) => Promise<Account | null>
  updateAccount: (id: string, data: Partial<AccountUpdate>) => Promise<boolean>
  deleteAccount: (id: string) => Promise<boolean>
  getAccountById: (id: string) => Account | undefined
  refetchAccounts: () => Promise<void>
}

const AccountsContext = createContext<AccountsContextValue | null>(null)

export function AccountsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { error: toastError } = useToast()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id ?? null

  const loadAccounts = useCallback(async () => {
    if (!userId) {
      setAccounts([])
      setLoading(false)
      setError(null)
      return
    }
    const client = getSupabaseBrowserClient()
    if (!client) {
      setAccounts([])
      setLoading(false)
      setError('Supabase não configurado.')
      toastError('Supabase não configurado. Verifique o arquivo .env.')
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: err } = await fetchAccountsForUser(client, userId)
    if (err) {
      setAccounts([])
      setError(err.message)
      toastError(err.message)
    } else {
      setAccounts(data)
    }
    setLoading(false)
  }, [userId, toastError])

  useEffect(() => {
    void loadAccounts()
  }, [loadAccounts])

  const addAccount = useCallback(
    async (data: AccountCreate): Promise<Account | null> => {
      if (!userId) {
        toastError('Sessão inválida. Faça login novamente.')
        return null
      }
      const client = getSupabaseBrowserClient()
      if (!client) {
        toastError('Supabase não configurado.')
        return null
      }
      const { data: row, error: insertErr } = await insertAccount(client, userId, {
        ...data,
        user_id: userId,
      })
      if (insertErr) {
        setError(insertErr.message)
        toastError(insertErr.message)
        return null
      }
      if (row) {
        setAccounts((prev) => [...prev, row])
        setError(null)
      }
      return row
    },
    [userId, toastError]
  )

  const updateAccount = useCallback(
    async (id: string, data: Partial<AccountUpdate>): Promise<boolean> => {
      if (!userId) {
        toastError('Sessão inválida. Faça login novamente.')
        return false
      }
      const client = getSupabaseBrowserClient()
      if (!client) {
        toastError('Supabase não configurado.')
        return false
      }
      const { data: row, error: updateErr } = await updateAccountRow(
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
        setAccounts((prev) => prev.map((a) => (a.id === id ? row : a)))
        setError(null)
      }
      return true
    },
    [userId, toastError]
  )

  const getAccountById = useCallback(
    (id: string) => accounts.find((a) => a.id === id),
    [accounts]
  )

  const deleteAccount = useCallback(
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
      const { error: delErr } = await deleteAccountRow(client, userId, id)
      if (delErr) {
        setError(delErr.message)
        toastError(delErr.message)
        return false
      }
      setAccounts((prev) => prev.filter((a) => a.id !== id))
      setError(null)
      return true
    },
    [userId, toastError]
  )

  const value = useMemo<AccountsContextValue>(
    () => ({
      accounts,
      loading,
      error,
      addAccount,
      updateAccount,
      deleteAccount,
      getAccountById,
      refetchAccounts: loadAccounts,
    }),
    [
      accounts,
      loading,
      error,
      addAccount,
      updateAccount,
      deleteAccount,
      getAccountById,
      loadAccounts,
    ]
  )

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  )
}

export function useAccounts(): AccountsContextValue {
  const ctx = useContext(AccountsContext)
  if (!ctx) {
    throw new Error('useAccounts deve ser usado dentro de AccountsProvider')
  }
  return ctx
}
