import type { KeyboardEvent } from 'react'
import { LINE_SPACING } from '../lib/layout'
import { splitTextToLines } from '../lib/text'

// Label box dimensions
const BOX_WIDTH = 70
const BOX_HALF_WIDTH = BOX_WIDTH / 2
const SHADOW_OFFSET = 2
const PARTICIPANT_BORDER_RADIUS = 8
const REWARD_BORDER_RADIUS = 6

// Vertical padding/offset for text positioning
const PARTICIPANT_BOX_BASE_HEIGHT = 12
const REWARD_BOX_BASE_HEIGHT = 8
const PARTICIPANT_TEXT_OFFSET_Y = 13
const REWARD_TEXT_OFFSET_Y = 12

interface AmidaLabelProps {
  x: number
  y: number
  text: string
  title: string
  variant: 'participant' | 'reward'
  isRevealed?: boolean
  participantColor?: string
  onClick?: () => void
  isClickable?: boolean
}

export function AmidaLabel({
  x,
  y,
  text,
  title,
  variant,
  isRevealed = false,
  participantColor,
  onClick,
  isClickable = false,
}: AmidaLabelProps) {
  const lines = splitTextToLines(text)
  const isParticipant = variant === 'participant'
  const baseHeight = isParticipant ? PARTICIPANT_BOX_BASE_HEIGHT : REWARD_BOX_BASE_HEIGHT
  const boxHeight = baseHeight + lines.length * LINE_SPACING
  const textStartY = y + (isParticipant ? PARTICIPANT_TEXT_OFFSET_Y : REWARD_TEXT_OFFSET_Y)

  const handleKeyDown = (e: KeyboardEvent<SVGGElement>) => {
    if (isClickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick()
    }
  }

  if (isParticipant) {
    const fillColor = isRevealed
      ? '#dcfce7'
      : participantColor
        ? `${participantColor}20`
        : '#fff7ed'
    const strokeColor = isRevealed ? '#22c55e' : participantColor || '#f97316'
    const textColor = isRevealed ? '#15803d' : participantColor || '#c2410c'

    return (
      <g
        onClick={isClickable ? onClick : undefined}
        onKeyDown={isClickable ? handleKeyDown : undefined}
        className={isClickable ? 'cursor-pointer' : ''}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
      >
        <title>{title}</title>
        {/* Shadow */}
        <rect
          x={x - BOX_HALF_WIDTH + SHADOW_OFFSET}
          y={y + SHADOW_OFFSET}
          width={BOX_WIDTH - SHADOW_OFFSET * 2}
          height={boxHeight}
          rx={PARTICIPANT_BORDER_RADIUS}
          fill="rgba(0,0,0,0.1)"
        />
        <rect
          x={x - BOX_HALF_WIDTH}
          y={y}
          width={BOX_WIDTH}
          height={boxHeight}
          rx={PARTICIPANT_BORDER_RADIUS}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={2}
        />
        <text x={x} textAnchor="middle" fill={textColor} className="text-xs font-medium">
          {lines.map((line, lineIdx) => (
            <tspan key={lineIdx} x={x} y={textStartY + lineIdx * LINE_SPACING}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    )
  }

  // Reward variant
  return (
    <g>
      <title>{title}</title>
      <rect
        x={x - BOX_HALF_WIDTH}
        y={y}
        width={BOX_WIDTH}
        height={boxHeight}
        rx={REWARD_BORDER_RADIUS}
        fill="#f0fdf4"
        stroke="#86efac"
        strokeWidth={1}
      />
      <text x={x} textAnchor="middle" className="fill-green-700 text-xs font-medium">
        {lines.map((line, lineIdx) => (
          <tspan key={lineIdx} x={x} y={textStartY + lineIdx * LINE_SPACING}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  )
}
