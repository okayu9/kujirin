import type { KeyboardEvent } from 'react'
import { LINE_SPACING } from '../lib/layout'
import { splitTextToLines } from '../lib/text'

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
  const boxHeight = (variant === 'participant' ? 12 : 8) + lines.length * LINE_SPACING
  const textStartY = y + (variant === 'participant' ? 13 : 12)

  const handleKeyDown = (e: KeyboardEvent<SVGGElement>) => {
    if (isClickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick()
    }
  }

  if (variant === 'participant') {
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
          x={x - 33}
          y={y + 2}
          width={66}
          height={boxHeight}
          rx={8}
          fill="rgba(0,0,0,0.1)"
        />
        <rect
          x={x - 35}
          y={y}
          width={70}
          height={boxHeight}
          rx={8}
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
        x={x - 35}
        y={y}
        width={70}
        height={boxHeight}
        rx={6}
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
