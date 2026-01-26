// Distinct color palette for up to 6 participants
// Colors are chosen to be maximally different from each other
const DISTINCT_COLORS = [
  '#e53935', // red
  '#1e88e5', // blue
  '#43a047', // green
  '#fb8c00', // orange
  '#8e24aa', // purple
  '#00acc1', // cyan
]

// Single color for 7+ participants
const UNIFIED_COLOR = '#e53935' // red

export function getParticipantColor(index: number, totalParticipants: number): string {
  if (totalParticipants >= 7) {
    return UNIFIED_COLOR
  }
  return DISTINCT_COLORS[index % DISTINCT_COLORS.length]
}

export function getParticipantColorMap(participants: string[]): Map<string, string> {
  const colorMap = new Map<string, string>()
  const useUnifiedColor = participants.length >= 7

  participants.forEach((participant, index) => {
    if (useUnifiedColor) {
      colorMap.set(participant, UNIFIED_COLOR)
    } else {
      colorMap.set(participant, DISTINCT_COLORS[index % DISTINCT_COLORS.length])
    }
  })
  return colorMap
}

export function shouldUseColors(participantCount: number): boolean {
  return participantCount < 7
}
