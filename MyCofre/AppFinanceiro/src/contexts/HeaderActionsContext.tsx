import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { DashboardFinancialAlert } from '../types/alert-card'

interface HeaderActionsContextValue {
  actions: ReactNode
  setActions: (node: ReactNode) => void
  mobileFab: ReactNode
  setMobileFab: (node: ReactNode) => void
  title: string
  subtitle: string | null
  setTitle: (title: string, subtitle?: string | null) => void
  /** Alerta da visão geral exibido como ícone + popover no header (null = oculto). */
  dashboardAlert: DashboardFinancialAlert | null
  setDashboardAlert: (alert: DashboardFinancialAlert | null) => void
}

const HeaderActionsContext = createContext<HeaderActionsContextValue | null>(null)

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null)
  const [mobileFab, setMobileFab] = useState<ReactNode>(null)
  const [title, setTitleState] = useState('')
  const [subtitle, setSubtitleState] = useState<string | null>(null)
  const [dashboardAlert, setDashboardAlert] =
    useState<DashboardFinancialAlert | null>(null)
  const setTitle = useCallback((t: string, sub?: string | null) => {
    setTitleState(t)
    setSubtitleState(sub ?? null)
  }, [])
  return (
    <HeaderActionsContext.Provider
      value={{
        actions,
        setActions,
        mobileFab,
        setMobileFab,
        title,
        subtitle,
        setTitle,
        dashboardAlert,
        setDashboardAlert,
      }}
    >
      {children}
    </HeaderActionsContext.Provider>
  )
}

export function useHeaderActions() {
  const ctx = useContext(HeaderActionsContext)
  if (!ctx) {
    throw new Error('useHeaderActions must be used within HeaderActionsProvider')
  }
  return ctx
}
