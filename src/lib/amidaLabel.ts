import { LINE_SPACING } from './layout'
import { splitTextToLines } from './text'

export type AmidaLabelVariant = 'participant' | 'reward'

export const LABEL_BOX_WIDTH = 70
export const LABEL_BOX_HALF_WIDTH = LABEL_BOX_WIDTH / 2
export const LABEL_BOX_MIN_HEIGHT = 32
export const LABEL_SHADOW_OFFSET = 2

const PARTICIPANT_BOX_BASE_HEIGHT = 12
const REWARD_BOX_BASE_HEIGHT = 8

export function getLabelBaseHeight(variant: AmidaLabelVariant): number {
  return variant === 'participant' ? PARTICIPANT_BOX_BASE_HEIGHT : REWARD_BOX_BASE_HEIGHT
}

export function getLabelTextOffsetY(variant: AmidaLabelVariant): number {
  return variant === 'participant' ? 13 : 12
}

export function getLabelLines(text: string): string[] {
  return splitTextToLines(text)
}

export function getLabelBoxHeight(
  text: string,
  variant: AmidaLabelVariant,
  options: { minHeight?: number } = {}
): number {
  const lines = getLabelLines(text)
  const height = getLabelBaseHeight(variant) + lines.length * LINE_SPACING
  return options.minHeight === undefined ? height : Math.max(options.minHeight, height)
}
