import { useEffect, type RefObject } from 'react'

export type BottomSheetViewportOptions = {
  /** @deprecated Kept for API compatibility; height is driven by CSS (dvh / max-h). */
  maxHeightCapPercent?: number
}

/**
 * Mobile bottom sheets: extra bottom padding on the scroll region when the virtual
 * keyboard overlaps the viewport. No panel maxHeight/transform — those fought flex
 * layout and caused clipping.
 */
export function useBottomSheetViewport(
  panelRef: RefObject<HTMLElement | null>,
  open: boolean,
  scrollRef?: RefObject<HTMLElement | null>,
  /** @deprecated Ignored; kept so existing call sites keep compiling. */
  _legacyOptions?: BottomSheetViewportOptions
): void {
  void _legacyOptions
  useEffect(() => {
    if (!open) return
    const vv = typeof window !== 'undefined' ? window.visualViewport : null
    if (!vv) return

    const sync = () => {
      const mobile = window.matchMedia('(max-width: 767px)').matches
      const keyboardOverlap = Math.max(
        0,
        window.innerHeight - vv.height - vv.offsetTop
      )

      const scrollEl = scrollRef?.current
      if (scrollEl) {
        const base = 16
        scrollEl.style.paddingBottom =
          mobile && keyboardOverlap > 0 ? `${base + keyboardOverlap}px` : ''
      }
    }

    sync()
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    window.addEventListener('resize', sync)
    return () => {
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [open, panelRef, scrollRef])

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    const onFocusIn = (e: FocusEvent) => {
      const t = e.target
      if (!(t instanceof HTMLElement)) return
      if (!t.matches('input, textarea, select')) return
      requestAnimationFrame(() => {
        t.scrollIntoView({ block: 'center', behavior: 'smooth' })
      })
    }

    panel.addEventListener('focusin', onFocusIn)
    return () => panel.removeEventListener('focusin', onFocusIn)
  }, [open, panelRef])
}
