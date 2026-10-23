import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { formatCurrency as formatCurrencyBRL } from '../lib/format'
import { getValuesHidden, setValuesHidden as setValuesHiddenStorage } from '../lib/storage'

const MASKED_VALUE = 'R$ ••••••'

interface ValuesVisibilityContextValue {
  /** Se true, valores monetários são exibidos mascarados (R$ ••••••). */
  valuesHidden: boolean
  toggleValuesVisibility: () => void
  /** Formata valor em moeda; retorna máscara se valuesHidden. */
  formatCurrency: (value: number) => string
}

const ValuesVisibilityContext = createContext<ValuesVisibilityContextValue | null>(null)

export function ValuesVisibilityProvider({ children }: { children: ReactNode }) {
  const [valuesHidden, setValuesHidden] = useState<boolean>(() => getValuesHidden())

  const toggleValuesVisibility = useCallback(() => {
    setValuesHidden((prev) => {
      const next = !prev
      setValuesHiddenStorage(next)
      return next
    })
  }, [])

  const formatCurrency = useCallback(
    (value: number): string => {
      return valuesHidden ? MASKED_VALUE : formatCurrencyBRL(value)
    },
    [valuesHidden]
  )

  const value = useMemo<ValuesVisibilityContextValue>(
    () => ({
      valuesHidden,
      toggleValuesVisibility,
      formatCurrency,
    }),
    [valuesHidden, toggleValuesVisibility, formatCurrency]
  )

  return (
    <ValuesVisibilityContext.Provider value={value}>
      {children}
    </ValuesVisibilityContext.Provider>
  )
}

export function useValuesVisibility(): ValuesVisibilityContextValue {
  const ctx = useContext(ValuesVisibilityContext)
  if (!ctx) {
    throw new Error('useValuesVisibility deve ser usado dentro de ValuesVisibilityProvider')
  }
  return ctx
}
