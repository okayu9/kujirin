import { useLayoutEffect, useRef, useState, useMemo } from 'react'
import type { LadderData } from '../lib/amida'
import { VERTICAL_LINE_START_Y, getColumnX, getRungY } from '../lib/layout'

interface BallAnimationProps {
  ladder: LadderData
  startColumn: number
  color: string
  lineHeight: number
  onComplete: () => void
  onPositionChange?: (y: number) => void
}

interface Point {
  x: number
  y: number
}

const BALL_RADIUS = 10
const ANIMATION_DURATION = 3000 // 3 seconds

export function BallAnimation({
  ladder,
  startColumn,
  color,
  lineHeight,
  onComplete,
  onPositionChange,
}: BallAnimationProps) {
  const onCompleteRef = useRef(onComplete)
  const onPositionChangeRef = useRef(onPositionChange)

  // Update refs in effect to avoid accessing during render
  useLayoutEffect(() => {
    onCompleteRef.current = onComplete
    onPositionChangeRef.current = onPositionChange
  })

  // Calculate path once
  const { path, segmentLengths, totalLength } = useMemo(() => {
    const startY = VERTICAL_LINE_START_Y
    const endY = VERTICAL_LINE_START_Y + lineHeight

    // Group rungs by row
    const rungsByRow = new Map<number, { column: number }[]>()
    for (const rung of ladder.rungs) {
      const rowRungs = rungsByRow.get(rung.row)
      if (rowRungs) {
        rowRungs.push(rung)
      } else {
        rungsByRow.set(rung.row, [rung])
      }
    }

    // Build path
    const path: Point[] = []
    let currentColumn = startColumn

    path.push({ x: getColumnX(currentColumn), y: startY })

    for (let row = 0; row < ladder.rows; row++) {
      const rungY = getRungY(row)
      const rowRungs = rungsByRow.get(row) || []

      const rungToRight = rowRungs.find((r) => r.column === currentColumn)
      const rungToLeft = rowRungs.find((r) => r.column === currentColumn - 1)

      if (rungToRight) {
        path.push({ x: getColumnX(currentColumn), y: rungY })
        currentColumn = currentColumn + 1
        path.push({ x: getColumnX(currentColumn), y: rungY })
      } else if (rungToLeft) {
        path.push({ x: getColumnX(currentColumn), y: rungY })
        currentColumn = currentColumn - 1
        path.push({ x: getColumnX(currentColumn), y: rungY })
      }
    }

    path.push({ x: getColumnX(currentColumn), y: endY })

    // Calculate segment lengths
    let totalLength = 0
    const segmentLengths: number[] = []
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x
      const dy = path[i].y - path[i - 1].y
      const len = Math.sqrt(dx * dx + dy * dy)
      segmentLengths.push(len)
      totalLength += len
    }

    return { path, segmentLengths, totalLength }
  }, [ladder, startColumn, lineHeight])

  const isValidPath = path.length >= 2 && totalLength > 0

  // Position state
  const [position, setPosition] = useState<Point>(() => path[0] ?? { x: 0, y: 0 })

  // Animation effect
  useLayoutEffect(() => {
    // Handle invalid path - complete immediately
    if (!isValidPath) {
      onCompleteRef.current()
      return
    }

    const startTime = performance.now()
    let animationId: number | null = null
    let completed = false

    const animate = (currentTime: number) => {
      if (completed) return

      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1)

      if (progress >= 1) {
        completed = true
        setPosition(path[path.length - 1])
        onCompleteRef.current()
        return
      }

      // Find position along path
      const targetDistance = progress * totalLength
      let accumulatedDistance = 0

      for (let i = 0; i < segmentLengths.length; i++) {
        const segmentLength = segmentLengths[i]
        if (accumulatedDistance + segmentLength >= targetDistance) {
          const segmentProgress =
            segmentLength > 0
              ? (targetDistance - accumulatedDistance) / segmentLength
              : 0
          const p1 = path[i]
          const p2 = path[i + 1]
          const x = p1.x + (p2.x - p1.x) * segmentProgress
          const y = p1.y + (p2.y - p1.y) * segmentProgress
          setPosition({ x, y })
          onPositionChangeRef.current?.(y)
          break
        }
        accumulatedDistance += segmentLength
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      completed = true
      if (animationId !== null) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [path, segmentLengths, totalLength, isValidPath])

  // Don't render if path is invalid
  if (!isValidPath) {
    return null
  }

  return (
    <circle
      cx={position.x}
      cy={position.y}
      r={BALL_RADIUS}
      fill={color}
      stroke="white"
      strokeWidth={2}
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
    />
  )
}
