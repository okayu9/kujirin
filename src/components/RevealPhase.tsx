import { useCallback, useMemo, useRef } from 'react'
import { useAppContext, useColumnAnimations } from '../hooks'
import { AmidaView } from './AmidaView'
import { ResultPanel } from './ResultPanel'
import { generateAmida } from '../lib/amida'
import { getParticipantColorMap } from '../lib/colors'

// Auto-scroll constants
const SCROLL_THROTTLE_MS = 200
const SCROLL_MARGIN_PX = 200
const SCROLL_PADDING_PX = 100
const SCROLL_THRESHOLD_PX = 50

export function RevealPhase() {
  const { state, dispatch } = useAppContext()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Generate amida once when component mounts
  const amida = useMemo(() => {
    return generateAmida(state.rewards.length)
  }, [state.rewards.length])

  // Create color map for participants
  const participantColors = useMemo(() => {
    return getParticipantColorMap(state.participants)
  }, [state.participants])

  const handleReveal = useCallback(
    (columnIndex: number) => {
      dispatch({ type: 'REVEAL_COLUMN', payload: columnIndex })
    },
    [dispatch]
  )

  const {
    animatingColumns,
    completedBalls,
    isAnimating,
    startAnimation,
    completeAnimation,
    startAllAnimations,
  } = useColumnAnimations({
    participantColors,
    assignments: state.assignments,
    revealedColumns: state.revealedColumns,
    onReveal: handleReveal,
  })

  const results = useMemo(() => {
    if (!amida) return new Map<string, string>()

    const resultMap = new Map<string, string>()
    for (const [columnIndex, participantName] of state.assignments) {
      const rewardIndex = amida.permutation[columnIndex]
      resultMap.set(participantName, state.rewards[rewardIndex])
    }
    return resultMap
  }, [amida, state.assignments, state.rewards])

  const lastScrollTimeRef = useRef(0)
  const lastScrollTargetRef = useRef(0)

  const handleBallPositionChange = useCallback((normalizedY: number) => {
    const container = scrollContainerRef.current
    if (!container) return

    const svg = container.querySelector('svg')
    if (!svg) return

    // Throttle scroll updates
    const now = Date.now()
    if (now - lastScrollTimeRef.current < SCROLL_THROTTLE_MS) return

    // Calculate where the ball is in the viewport
    const svgRect = svg.getBoundingClientRect()
    const ballScreenY = svgRect.top + svgRect.height * normalizedY

    // Check if ball is below visible area
    const viewportHeight = window.innerHeight

    if (ballScreenY > viewportHeight - SCROLL_MARGIN_PX) {
      const scrollTarget =
        window.scrollY + (ballScreenY - viewportHeight + SCROLL_MARGIN_PX + SCROLL_PADDING_PX)

      // Only scroll if target changed significantly
      if (Math.abs(scrollTarget - lastScrollTargetRef.current) > SCROLL_THRESHOLD_PX) {
        lastScrollTimeRef.current = now
        lastScrollTargetRef.current = scrollTarget
        window.scrollTo({ top: scrollTarget, behavior: 'smooth' })
      }
    }
  }, [])

  const handleBack = useCallback(() => {
    dispatch({ type: 'GO_BACK_TO_SELECTION' })
  }, [dispatch])

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [dispatch])

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const allRevealed = state.revealedColumns.size === state.participants.length
  const revealedCount = state.revealedColumns.size
  const totalCount = state.participants.length

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-amber-200">
        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold shadow">
          3
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800">運命の分かれ道</h2>
          <p className="text-sm text-gray-500">
            参加者をクリックしてくじを引こう
            {totalCount > 0 && (
              <span className="ml-2 text-amber-600">
                ({revealedCount}/{totalCount}人完了)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 全員スタートボタン */}
      {!allRevealed && (
        <div className="flex gap-4 justify-center">
          <button
            onClick={startAllAnimations}
            disabled={isAnimating}
            className="px-8 py-3 bg-gradient-success text-white rounded-xl font-bold shadow-lg btn-hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            🚀 全員一斉スタート
          </button>
        </div>
      )}

      <div ref={scrollContainerRef} className="overflow-x-auto pb-4">
        <AmidaView
          ladder={amida}
          rewards={state.rewards}
          assignments={state.assignments}
          revealedColumns={state.revealedColumns}
          animatingColumns={animatingColumns}
          completedBalls={completedBalls}
          participantColors={participantColors}
          onColumnClick={startAnimation}
          onAnimationComplete={completeAnimation}
          onBallPositionChange={handleBallPositionChange}
        />
      </div>

      {/* 上に戻るボタン */}
      {!allRevealed && !isAnimating && revealedCount > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleScrollToTop}
            className="px-4 py-2 text-amber-600 hover:text-amber-800 transition-colors flex items-center gap-2 bg-amber-50 rounded-lg"
          >
            <span>↑</span>
            <span>上に戻って続きを引く</span>
          </button>
        </div>
      )}

      <ResultPanel
        participants={state.participants}
        results={results}
        revealedColumns={state.revealedColumns}
        assignments={state.assignments}
      />

      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
        >
          ← 戻る
        </button>
        <button
          onClick={handleReset}
          className="px-8 py-3 bg-gradient-primary text-white rounded-xl font-bold shadow-lg btn-hover-lift"
        >
          新しいくじを作る 🎋
        </button>
      </div>
    </div>
  )
}
