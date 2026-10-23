import { useEffect, useState } from 'react'
import { useNavigation } from 'react-router-dom'
import { clsx } from 'clsx'

/**
 * Barra fina no topo durante navegação (data router).
 */
export function NavigationProgress() {
  const navigation = useNavigation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (navigation.state === 'loading') {
      setVisible(true)
      return
    }
    const t = setTimeout(() => setVisible(false), 200)
    return () => clearTimeout(t)
  }, [navigation.state])

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[95] h-0.5 overflow-hidden"
      aria-hidden
    >
      <div
        className={clsx(
          'h-full w-full bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600 transition-opacity duration-200 ease-out',
          visible ? 'opacity-100 motion-safe:animate-pulse motion-reduce:animate-none' : 'opacity-0'
        )}
      />
    </div>
  )
}
