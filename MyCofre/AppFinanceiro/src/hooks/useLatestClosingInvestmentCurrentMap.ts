import { useEffect, useLayoutEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getSupabaseBrowserClient } from '../lib/supabase/client'
import { fetchLatestClosingCurrentByInvestmentId } from '../lib/supabase/monthlyClosingsRepo'

type Options = {
  /** Tamanho da lista de investimentos (refetch quando mudar). */
  investmentCount: number
  /** Ex.: `location.pathname` para refetch ao navegar de volta à tela. */
  pathKey?: string
}

/**
 * Mapa `investment_id` → `current_amount` do fechamento mais recente (ano/mês).
 */
export function useLatestClosingInvestmentCurrentMap({
  investmentCount,
  pathKey = '',
}: Options): {
  map: ReadonlyMap<string, number>
  loading: boolean
} {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [data, setData] = useState<Map<string, number>>(() => new Map())
  const [loading, setLoading] = useState(false)

  useLayoutEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
  }, [userId, investmentCount, pathKey])

  useEffect(() => {
    if (!userId) {
      setData(new Map())
      return
    }
    let cancelled = false
    void (async () => {
      const client = getSupabaseBrowserClient()
      if (!client) {
        if (!cancelled) {
          setData(new Map())
          setLoading(false)
        }
        return
      }
      const { data: next, error } = await fetchLatestClosingCurrentByInvestmentId(
        client,
        userId
      )
      if (!cancelled) {
        setData(error ? new Map() : next)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId, investmentCount, pathKey])

  return { map: data, loading }
}
