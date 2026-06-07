import { useCallback, useRef } from 'react'

const SCROLL_THROTTLE_MS = 200
const SCROLL_MARGIN_PX = 200
const SCROLL_PADDING_PX = 100
const SCROLL_THRESHOLD_PX = 50

export function useAutoScrollForBall() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastScrollTimeRef = useRef(0)
  const lastScrollTargetRef = useRef(0)

  const handleBallPositionChange = useCallback((normalizedY: number) => {
    const container = scrollContainerRef.current
    if (!container) return

    const svg = container.querySelector('svg')
    if (!svg) return

    const now = Date.now()
    if (now - lastScrollTimeRef.current < SCROLL_THROTTLE_MS) return

    const svgRect = svg.getBoundingClientRect()
    const ballScreenY = svgRect.top + svgRect.height * normalizedY
    const viewportHeight = window.innerHeight

    if (ballScreenY <= viewportHeight - SCROLL_MARGIN_PX) return

    const scrollTarget =
      window.scrollY + ballScreenY - viewportHeight + SCROLL_MARGIN_PX + SCROLL_PADDING_PX

    if (Math.abs(scrollTarget - lastScrollTargetRef.current) <= SCROLL_THRESHOLD_PX) {
      return
    }

    lastScrollTimeRef.current = now
    lastScrollTargetRef.current = scrollTarget
    window.scrollTo({ top: scrollTarget, behavior: 'smooth' })
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return {
    scrollContainerRef,
    handleBallPositionChange,
    scrollToTop,
  }
}
