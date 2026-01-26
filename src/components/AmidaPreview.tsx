import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  COLUMN_WIDTH,
  PADDING_X,
  LABEL_HEIGHT,
} from '../lib/layout'
import { splitTextToLines } from '../lib/text'

interface AmidaPreviewProps {
  columnCount: number
  rewards: string[]
  assignments: Map<number, string>
  onColumnClick: (columnIndex: number) => void
}

// Preview-specific layout constants
const LINE_HEIGHT = 200
const HIDDEN_BOX_HEIGHT = 140
const LABEL_BOX_WIDTH = 70
const LABEL_BOX_HEIGHT_MIN = 32
const SHADOW_OFFSET = 2
const BOX_BORDER_RADIUS = 12
const LINE_SPACING = 12
const TOP_LABEL_BASE_HEIGHT = 12
const BOTTOM_LABEL_BASE_HEIGHT = 8
const VERTICAL_LINE_START_OFFSET = 10
const BOTTOM_LABEL_OFFSET = 18
const SVG_EXTRA_HEIGHT = 40
const BOX_HORIZONTAL_PADDING = 10

export function AmidaPreview({
  columnCount,
  rewards,
  assignments,
  onColumnClick,
}: AmidaPreviewProps) {
  const svgWidth = columnCount * COLUMN_WIDTH + PADDING_X * 2
  const svgHeight = LINE_HEIGHT + LABEL_HEIGHT * 2 + SVG_EXTRA_HEIGHT

  const boxLeft = PADDING_X - BOX_HORIZONTAL_PADDING
  const boxWidth = columnCount * COLUMN_WIDTH + BOX_HORIZONTAL_PADDING * 2
  const boxTop = LABEL_HEIGHT + VERTICAL_LINE_START_OFFSET + (LINE_HEIGHT - HIDDEN_BOX_HEIGHT) / 2

  return (
    <div
      className="relative mx-auto"
      style={{ width: svgWidth, height: svgHeight }}
    >
      {/* SVG: Lines and mystery box only */}
      <svg
        width={svgWidth}
        height={svgHeight}
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="boxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>

        {/* Vertical lines */}
        {Array.from({ length: columnCount }, (_, i) => {
          const x = PADDING_X + i * COLUMN_WIDTH + COLUMN_WIDTH / 2
          return (
            <line
              key={`line-${i}`}
              x1={x}
              y1={LABEL_HEIGHT + VERTICAL_LINE_START_OFFSET}
              x2={x}
              y2={LABEL_HEIGHT + VERTICAL_LINE_START_OFFSET + LINE_HEIGHT}
              stroke="#92400e"
              strokeWidth={3}
              strokeLinecap="round"
            />
          )
        })}

        {/* Hidden box with shadow */}
        <rect
          x={boxLeft + SHADOW_OFFSET * 2}
          y={boxTop + SHADOW_OFFSET * 2}
          width={boxWidth}
          height={HIDDEN_BOX_HEIGHT}
          rx={BOX_BORDER_RADIUS}
          fill="rgba(0,0,0,0.1)"
        />
        <rect
          x={boxLeft}
          y={boxTop}
          width={boxWidth}
          height={HIDDEN_BOX_HEIGHT}
          rx={BOX_BORDER_RADIUS}
          fill="url(#boxGradient)"
          stroke="#d97706"
          strokeWidth={2}
        />
        <text
          x={boxLeft + boxWidth / 2}
          y={boxTop + HIDDEN_BOX_HEIGHT / 2 - 5}
          textAnchor="middle"
          className="fill-amber-600 text-3xl"
        >
          ?
        </text>
        <text
          x={boxLeft + boxWidth / 2}
          y={boxTop + HIDDEN_BOX_HEIGHT / 2 + 20}
          textAnchor="middle"
          className="fill-amber-500 text-xs"
        >
          運命やいかに
        </text>
      </svg>

      {/* HTML labels */}
      {Array.from({ length: columnCount }, (_, i) => {
        const centerX = PADDING_X + i * COLUMN_WIDTH + COLUMN_WIDTH / 2
        const assigned = assignments.get(i)
        const topLines = splitTextToLines(assigned || 'クリック')
        const bottomLines = splitTextToLines(rewards[i])
        const topBoxHeight = Math.max(LABEL_BOX_HEIGHT_MIN, TOP_LABEL_BASE_HEIGHT + topLines.length * LINE_SPACING)
        const bottomBoxHeight = Math.max(LABEL_BOX_HEIGHT_MIN, BOTTOM_LABEL_BASE_HEIGHT + bottomLines.length * LINE_SPACING)

        return (
          <div key={`labels-${i}`}>
            {/* Top label (assigned participant) */}
            <div
              onClick={() => onColumnClick(i)}
              onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onColumnClick(i)
                }
              }}
              className="absolute cursor-pointer select-none"
              style={{
                left: centerX - LABEL_BOX_WIDTH / 2,
                top: 5,
                width: LABEL_BOX_WIDTH,
                height: topBoxHeight,
              }}
              role="button"
              tabIndex={0}
              title={assigned || '未選択'}
            >
              {/* Shadow */}
              <div
                className="absolute rounded-lg bg-black/10"
                style={{
                  left: SHADOW_OFFSET,
                  top: SHADOW_OFFSET,
                  width: LABEL_BOX_WIDTH - SHADOW_OFFSET * 2,
                  height: topBoxHeight,
                }}
              />
              <div
                className={`absolute flex flex-col items-center justify-center rounded-lg border-2 ${
                  assigned
                    ? 'bg-orange-50 border-orange-500'
                    : 'bg-white border-gray-300 border-dashed'
                }`}
                style={{
                  left: 0,
                  top: 0,
                  width: LABEL_BOX_WIDTH,
                  height: topBoxHeight,
                }}
              >
                {topLines.map((line, lineIdx) => (
                  <span
                    key={lineIdx}
                    className={`text-xs font-medium leading-tight ${
                      assigned ? 'text-orange-700' : 'text-gray-400'
                    }`}
                  >
                    {line}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom label (reward) */}
            <div
              className="absolute select-none"
              style={{
                left: centerX - LABEL_BOX_WIDTH / 2,
                top: LABEL_HEIGHT + LINE_HEIGHT + BOTTOM_LABEL_OFFSET,
                width: LABEL_BOX_WIDTH,
                height: bottomBoxHeight,
              }}
              title={rewards[i]}
            >
              <div
                className="absolute flex flex-col items-center justify-center rounded-md bg-green-50 border border-green-300"
                style={{
                  left: 0,
                  top: 0,
                  width: LABEL_BOX_WIDTH,
                  height: bottomBoxHeight,
                }}
              >
                {bottomLines.map((line, lineIdx) => (
                  <span
                    key={lineIdx}
                    className="text-xs font-medium leading-tight text-green-700"
                  >
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
