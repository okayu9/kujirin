import type { LadderData } from '../lib/amida'
import { getEndColumn } from '../lib/amida'
import { AmidaLabel } from './AmidaLabel'
import { BallAnimation } from './BallAnimation'
import { shouldUseColors } from '../lib/colors'
import {
  COLUMN_WIDTH,
  PADDING_X,
  LABEL_HEIGHT,
  ROW_HEIGHT,
} from '../lib/layout'

interface AmidaViewProps {
  ladder: LadderData
  rewards: string[]
  assignments: Map<number, string>
  revealedColumns: Set<number>
  animatingColumns: Map<number, string> // columnIndex -> color
  completedBalls: Map<number, string> // columnIndex -> color (balls at final position)
  participantColors: Map<string, string> // participantName -> color
  onColumnClick: (columnIndex: number) => void
  onAnimationComplete: (columnIndex: number) => void
  onBallPositionChange?: (normalizedY: number) => void // 0-1 range
}

const MIN_ROWS = 6

const getColumnX = (index: number) =>
  PADDING_X + index * COLUMN_WIDTH + COLUMN_WIDTH / 2

export function AmidaView({
  ladder,
  rewards,
  assignments,
  revealedColumns,
  animatingColumns,
  completedBalls,
  participantColors,
  onColumnClick,
  onAnimationComplete,
  onBallPositionChange,
}: AmidaViewProps) {
  const columnCount = rewards.length
  const rowCount = Math.max(ladder.rows, MIN_ROWS)

  const svgWidth = columnCount * COLUMN_WIDTH + PADDING_X * 2
  const lineHeight = rowCount * ROW_HEIGHT + 40
  const svgHeight = lineHeight + LABEL_HEIGHT * 2 + 40

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      className="mx-auto block"
    >
      <defs>
        {/* Gradient for vertical lines */}
        <linearGradient id="amidaLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        {/* Gradient for horizontal rungs */}
        <linearGradient id="rungGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* Vertical lines */}
      {Array.from({ length: columnCount }, (_, i) => {
        const x = getColumnX(i)
        const assigned = assignments.get(i)
        const isRevealed = revealedColumns.has(i)
        const isAnimating = animatingColumns.has(i)
        const useColors = shouldUseColors(columnCount)
        const participantColor = useColors && assigned ? participantColors.get(assigned) : undefined
        const isClickable = !isRevealed && !isAnimating

        return (
          <g key={`col-${i}`}>
            {/* Top label (assigned participant) */}
            <AmidaLabel
              x={x}
              y={5}
              text={assigned || '?'}
              title={assigned || '未選択'}
              variant="participant"
              isRevealed={isRevealed}
              participantColor={participantColor}
              isClickable={isClickable}
              onClick={() => onColumnClick(i)}
            />

            {/* Vertical line */}
            <line
              x1={x}
              y1={LABEL_HEIGHT + 10}
              x2={x}
              y2={LABEL_HEIGHT + 10 + lineHeight}
              stroke="#92400e"
              strokeWidth={3}
              strokeLinecap="round"
            />

            {/* Bottom label (reward) */}
            <AmidaLabel
              x={x}
              y={LABEL_HEIGHT + lineHeight + 18}
              text={rewards[i]}
              title={rewards[i]}
              variant="reward"
            />
          </g>
        )
      })}

      {/* Horizontal rungs */}
      {ladder.rungs.map((rung, index) => {
        const y = LABEL_HEIGHT + 30 + rung.row * ROW_HEIGHT
        const x1 = getColumnX(rung.column)
        const x2 = getColumnX(rung.column + 1)
        return (
          <line
            key={`rung-${index}`}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke="#92400e"
            strokeWidth={3}
            strokeLinecap="round"
          />
        )
      })}

      {/* Ball animations */}
      {Array.from(animatingColumns.entries()).map(([columnIndex, color]) => (
        <BallAnimation
          key={`ball-${columnIndex}`}
          ladder={ladder}
          startColumn={columnIndex}
          color={color}
          lineHeight={lineHeight}
          onComplete={() => onAnimationComplete(columnIndex)}
          onPositionChange={(y) => {
            // Normalize Y position to 0-1 range
            const normalizedY = (y - LABEL_HEIGHT) / (lineHeight + LABEL_HEIGHT)
            onBallPositionChange?.(Math.max(0, Math.min(1, normalizedY)))
          }}
        />
      ))}

      {/* Completed balls at final position */}
      {Array.from(completedBalls.entries()).map(([startColumn, color]) => {
        // Compute final column position
        const endColumn = getEndColumn(ladder, startColumn)
        const x = getColumnX(endColumn)
        const y = LABEL_HEIGHT + 10 + lineHeight

        return (
          <g key={`completed-${startColumn}`}>
            {/* Glow effect */}
            <circle
              cx={x}
              cy={y}
              r={14}
              fill={color}
              opacity={0.3}
            />
            <circle
              cx={x}
              cy={y}
              r={10}
              fill={color}
              stroke="white"
              strokeWidth={2}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            />
          </g>
        )
      })}
    </svg>
  )
}
