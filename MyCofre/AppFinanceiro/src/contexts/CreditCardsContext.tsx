import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CreditCard, CreditCardBill } from '../types'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { getSupabaseBrowserClient } from '../lib/supabase/client'
import {
  deleteBillRow,
  deleteCreditCardRow,
  fetchBillsForUser,
  fetchCreditCardsForUser,
  insertBillRow,
  insertCreditCard,
  updateBillRow,
  updateCreditCardRow,
} from '../lib/supabase/creditCardsRepo'

type CreditCardCreate = Omit<CreditCard, 'id'>
type CreditCardUpdate = Partial<Omit<CreditCard, 'id'>>
type CreditCardBillCreate = Omit<CreditCardBill, 'id'>
type CreditCardBillUpdate = Partial<Omit<CreditCardBill, 'id'>>

interface CreditCardsContextValue {
  creditCards: CreditCard[]
  bills: CreditCardBill[]
  loading: boolean
  error: string | null
  addCard: (data: CreditCardCreate) => Promise<CreditCard | null>
  updateCard: (id: string, data: CreditCardUpdate) => Promise<boolean>
  deleteCard: (id: string) => Promise<boolean>
  getCardById: (id: string) => CreditCard | undefined
  getBillsByCardId: (creditCardId: string) => CreditCardBill[]
  addBill: (data: CreditCardBillCreate) => Promise<CreditCardBill | null>
  updateBill: (id: string, data: CreditCardBillUpdate) => Promise<boolean>
  deleteBill: (id: string) => Promise<boolean>
  getBillById: (id: string) => CreditCardBill | undefined
  refetchCreditCards: () => Promise<void>
}

const CreditCardsContext = createContext<CreditCardsContextValue | null>(null)

export function CreditCardsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { error: toastError } = useToast()
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [bills, setBills] = useState<CreditCardBill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id ?? null

  const loadAll = useCallback(async () => {
    if (!userId) {
      setCreditCards([])
      setBills([])
      setLoading(false)
      setError(null)
      return
    }
    const client = getSupabaseBrowserClient()
    if (!client) {
      setCreditCards([])
      setBills([])
      setLoading(false)
      setError('Supabase não configurado.')
      toastError('Supabase não configurado. Verifique o arquivo .env.')
      return
    }
    setLoading(true)
    setError(null)
    const [cardsRes, billsRes] = await Promise.all([
      fetchCreditCardsForUser(client, userId),
      fetchBillsForUser(client, userId),
    ])
    const errMsg = cardsRes.error?.message ?? billsRes.error?.message
    if (errMsg) {
      setCreditCards([])
      setBills([])
      setError(errMsg)
      toastError(errMsg)
    } else {
      setCreditCards(cardsRes.data)
      setBills(billsRes.data)
      setError(null)
    }
    setLoading(false)
  }, [userId, toastError])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  const addCard = useCallback(
    async (data: CreditCardCreate): Promise<CreditCard | null> => {
      if (!userId) {
        toastError('Sessão inválida. Faça login novamente.')
        return null
      }
      const client = getSupabaseBrowserClient()
      if (!client) {
        toastError('Supabase não configurado.')
        return null
      }
      const { data: row, error: insertErr } = await insertCreditCard(
        client,
        userId,
        data
      )
      if (insertErr) {
        setError(insertErr.message)
        toastError(insertErr.message)
        return null
      }
      if (row) {
        setCreditCards((prev) => [row, ...prev])
        setError(null)
      }
      return row
    },
    [userId, toastError]
  )

  const updateCard = useCallback(
    async (id: string, data: CreditCardUpdate): Promise<boolean> => {
      if (!userId) {
        toastError('Sessão inválida. Faça login novamente.')
        return false
      }
      const client = getSupabaseBrowserClient()
      if (!client) {
        toastError('Supabase não configurado.')
        return false
      }
      const { data: row, error: updateErr } = await updateCreditCardRow(
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
        setCreditCards((prev) => prev.map((c) => (c.id === id ? row : c)))
        setError(null)
      }
      return true
    },
    [userId, toastError]
  )

  const deleteCard = useCallback(
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
      const { error: delErr } = await deleteCreditCardRow(client, userId, id)
      if (delErr) {
        setError(delErr.message)
        toastError(delErr.message)
        return false
      }
      setCreditCards((prev) => prev.filter((c) => c.id !== id))
      setBills((prev) => prev.filter((b) => b.creditCardId !== id))
      setError(null)
      return true
    },
    [userId, toastError]
  )

  const getCardById = useCallback(
    (id: string) => creditCards.find((c) => c.id === id),
    [creditCards]
  )

  const getBillsByCardId = useCallback(
    (creditCardId: string) =>
      bills
        .filter((b) => b.creditCardId === creditCardId)
        .sort((a, b) =>
          a.year !== b.year ? a.year - b.year : a.month - b.month
        ),
    [bills]
  )

  const addBill = useCallback(
    async (data: CreditCardBillCreate): Promise<CreditCardBill | null> => {
      if (!userId) {
        toastError('Sessão inválida. Faça login novamente.')
        return null
      }
      const client = getSupabaseBrowserClient()
      if (!client) {
        toastError('Supabase não configurado.')
        return null
      }
      const { data: row, error: insertErr } = await insertBillRow(
        client,
        userId,
        data
      )
      if (insertErr) {
        setError(insertErr.message)
        toastError(insertErr.message)
        return null
      }
      if (row) {
        setBills((prev) => [...prev, row])
        setError(null)
      }
      return row
    },
    [userId, toastError]
  )

  const updateBill = useCallback(
    async (id: string, data: CreditCardBillUpdate): Promise<boolean> => {
      if (!userId) {
        toastError('Sessão inválida. Faça login novamente.')
        return false
      }
      const client = getSupabaseBrowserClient()
      if (!client) {
        toastError('Supabase não configurado.')
        return false
      }
      const { data: row, error: updateErr } = await updateBillRow(
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
        setBills((prev) => prev.map((b) => (b.id === id ? row : b)))
        setError(null)
      }
      return true
    },
    [userId, toastError]
  )

  const deleteBill = useCallback(
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
      const { error: delErr } = await deleteBillRow(client, userId, id)
      if (delErr) {
        setError(delErr.message)
        toastError(delErr.message)
        return false
      }
      setBills((prev) => prev.filter((b) => b.id !== id))
      setError(null)
      return true
    },
    [userId, toastError]
  )

  const getBillById = useCallback(
    (id: string) => bills.find((b) => b.id === id),
    [bills]
  )

  const value = useMemo<CreditCardsContextValue>(
    () => ({
      creditCards,
      bills,
      loading,
      error,
      addCard,
      updateCard,
      deleteCard,
      getCardById,
      getBillsByCardId,
      addBill,
      updateBill,
      deleteBill,
      getBillById,
      refetchCreditCards: loadAll,
    }),
    [
      creditCards,
      bills,
      loading,
      error,
      addCard,
      updateCard,
      deleteCard,
      getCardById,
      getBillsByCardId,
      addBill,
      updateBill,
      deleteBill,
      getBillById,
      loadAll,
    ]
  )

  return (
    <CreditCardsContext.Provider value={value}>
      {children}
    </CreditCardsContext.Provider>
  )
}

export function useCreditCards(): CreditCardsContextValue {
  const ctx = useContext(CreditCardsContext)
  if (!ctx) {
    throw new Error('useCreditCards must be used within CreditCardsProvider')
  }
  return ctx
}
