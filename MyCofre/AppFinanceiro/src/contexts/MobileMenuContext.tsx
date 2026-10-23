import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

interface MobileMenuContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const MobileMenuContext = createContext<MobileMenuContextValue | null>(null)

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  return (
    <MobileMenuContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </MobileMenuContext.Provider>
  )
}

export function useMobileMenu() {
  const ctx = useContext(MobileMenuContext)
  if (!ctx) {
    throw new Error('useMobileMenu must be used within MobileMenuProvider')
  }
  return ctx
}
