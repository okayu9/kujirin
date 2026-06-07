import { useCallback, useMemo } from 'react'
import { useAppContext, useAutoScrollForBall, useColumnAnimations } from '../hooks'
import { AmidaView } from './AmidaView'
import { ResultPanel } from './ResultPanel'
import { generateAmida } from '../lib/amida'
import { getParticipantColorMap } from '../lib/colors'
import { PhaseHeader } from './PhaseHeader'

export function RevealPhase() {
  const { state, dispatch } = useAppContext()
  const { scrollContainerRef, handleBallPositionChange, scrollToTop } = useAutoScrollForBall()

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

  const handleBack = useCallback(() => {
    dispatch({ type: 'GO_BACK_TO_SELECTION' })
  }, [dispatch])

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [dispatch])

  const allRevealed = state.revealedColumns.size === state.participants.length
  const revealedCount = state.revealedColumns.size
  const totalCount = state.participants.length

  return (
    <div className="space-y-6">
      <PhaseHeader
        step={3}
        title="運命の分かれ道"
        description={
          <>
            参加者をクリックしてくじを引こう
            {totalCount > 0 && (
              <span className="ml-2 text-amber-600">
                ({revealedCount}/{totalCount}人完了)
              </span>
            )}
          </>
        }
      />

      {/* 全員スタートボタン */}
      {!allRevealed && (
        <div className="flex gap-4 justify-center">
          <button
            onClick={startAllAnimations}
            disabled={isAnimating}
            className="px-8 py-3 bg-gradient-success text-white rounded-xl font-bold shadow-lg btn-hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
            <span aria-hidden="true">🚀</span> 全員一斉スタート
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
            onClick={scrollToTop}
            className="px-4 py-2 text-amber-600 hover:text-amber-800 transition-colors flex items-center gap-2 bg-amber-50 rounded-lg"
          >
            <span aria-hidden="true">↑</span>
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
          <span aria-hidden="true">←</span> 戻る
        </button>
        <button
          onClick={handleReset}
          className="px-8 py-3 bg-gradient-primary text-white rounded-xl font-bold shadow-lg btn-hover-lift"
        >
          新しいくじを作る <span aria-hidden="true">🎋</span>
        </button>
      </div>
    </div>
  )
}
