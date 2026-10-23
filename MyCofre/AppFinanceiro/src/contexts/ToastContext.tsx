import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface ShowToastOptions {
  type: ToastType
  message: string
  /** ms (default 4200) */
  duration?: number
}

interface ToastItem extends Required<Pick<ShowToastOptions, 'type' | 'message'>> {
  id: string
  duration: number
}

interface ToastContextValue {
  showToast: (options: ShowToastOptions) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const

const styles = {
  success:
    'border-emerald-200/90 bg-emerald-50/95 text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-100',
  error:
    'border-red-200/90 bg-red-50/95 text-red-950 dark:border-red-800/60 dark:bg-red-950/45 dark:text-red-100',
  info: 'border-slate-200/90 bg-white text-slate-900 dark:border-white/10 dark:bg-zinc-800 dark:text-slate-100',
} as const

function ToastRow({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: () => void
}) {
  const Icon = icons[toast.type]
  const [entered, setEntered] = useState(false)
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const visible = entered || reduceMotion

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setEntered(true)
  }, [])

  return (
    <div
      role="status"
      className={clsx(
        'pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-card backdrop-blur-sm transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-opacity motion-reduce:duration-150',
        visible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'opacity-0 scale-[0.98] max-sm:-translate-y-2 sm:translate-y-2',
        styles[toast.type]
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0 opacity-90" aria-hidden />
      <p className="min-w-0 flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-lg p-1 text-current opacity-60 transition-[opacity,background-color] duration-150 ease-out hover:bg-black/5 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current/30"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    const t = timers.current.get(id)
    if (t) clearTimeout(t)
    timers.current.delete(id)
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const showToast = useCallback(
    ({ type, message, duration = 4200 }: ShowToastOptions) => {
      const id =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      setToasts((prev) => [...prev, { id, type, message, duration }])
      const timer = setTimeout(() => dismiss(id), duration)
      timers.current.set(id, timer)
    },
    [dismiss]
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (message, duration) => showToast({ type: 'success', message, duration }),
      error: (message, duration) => showToast({ type: 'error', message, duration }),
      info: (message, duration) => showToast({ type: 'info', message, duration }),
    }),
    [showToast]
  )

  const toastStack = (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[9999] flex flex-col items-stretch gap-2 p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] sm:top-auto sm:bottom-0 sm:items-end sm:pl-8 sm:pt-4 sm:pb-[max(1rem,env(safe-area-inset-bottom,0px))]"
      aria-live="polite"
      aria-relevant="additions text"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastRow key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' ? createPortal(toastStack, document.body) : null}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      showToast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    }
  }
  return ctx
}
