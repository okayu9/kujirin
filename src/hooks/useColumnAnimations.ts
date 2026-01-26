import { useState, useRef, useCallback } from 'react'

interface UseColumnAnimationsOptions {
  participantColors: Map<string, string>
  assignments: Map<number, string>
  revealedColumns: Set<number>
  onReveal: (columnIndex: number) => void
}

export function useColumnAnimations({
  participantColors,
  assignments,
  revealedColumns,
  onReveal,
}: UseColumnAnimationsOptions) {
  const [animatingColumns, setAnimatingColumns] = useState<Map<number, string>>(new Map())
  const [completedBalls, setCompletedBalls] = useState<Map<number, string>>(new Map())
  const pendingRevealsRef = useRef<number[]>([])

  const getParticipantColor = useCallback(
    (columnIndex: number): string => {
      const participantName = assignments.get(columnIndex)
      return participantName ? participantColors.get(participantName) || '#ef4444' : '#ef4444'
    },
    [assignments, participantColors]
  )

  const startAnimation = useCallback(
    (columnIndex: number) => {
      if (revealedColumns.has(columnIndex)) return

      const participantName = assignments.get(columnIndex)
      if (!participantName) return

      const color = getParticipantColor(columnIndex)
      setAnimatingColumns((prev) => {
        if (prev.has(columnIndex)) return prev
        return new Map(prev).set(columnIndex, color)
      })
    },
    [revealedColumns, assignments, getParticipantColor]
  )

  const completeAnimation = useCallback(
    (columnIndex: number) => {
      setAnimatingColumns((prev) => {
        const color = prev.get(columnIndex)
        if (color) {
          setCompletedBalls((prevCompleted) => new Map(prevCompleted).set(columnIndex, color))
        }
        const next = new Map(prev)
        next.delete(columnIndex)
        return next
      })

      onReveal(columnIndex)

      // Process next pending reveal
      const nextColumn = pendingRevealsRef.current.shift()
      if (nextColumn !== undefined && !revealedColumns.has(nextColumn) && assignments.has(nextColumn)) {
        const color = getParticipantColor(nextColumn)
        setAnimatingColumns((prev) => new Map(prev).set(nextColumn, color))
      }
    },
    [onReveal, revealedColumns, assignments, getParticipantColor]
  )

  const startAllAnimations = useCallback(() => {
    setAnimatingColumns((prev) => {
      const newAnimating = new Map(prev)
      let hasChanges = false

      for (const [columnIndex] of assignments) {
        if (!revealedColumns.has(columnIndex) && !prev.has(columnIndex)) {
          newAnimating.set(columnIndex, getParticipantColor(columnIndex))
          hasChanges = true
        }
      }

      return hasChanges ? newAnimating : prev
    })
  }, [assignments, revealedColumns, getParticipantColor])

  return {
    animatingColumns,
    completedBalls,
    isAnimating: animatingColumns.size > 0,
    startAnimation,
    completeAnimation,
    startAllAnimations,
  }
}
