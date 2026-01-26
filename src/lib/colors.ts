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

// Threshold for switching to unified color mode
const COLOR_THRESHOLD = DISTINCT_COLORS.length + 1 // 7

export function getParticipantColor(index: number, totalParticipants: number): string {
  if (totalParticipants >= COLOR_THRESHOLD) {
    return UNIFIED_COLOR
  }
  return DISTINCT_COLORS[index % DISTINCT_COLORS.length]
}

export function getParticipantColorMap(participants: string[]): Map<string, string> {
  const colorMap = new Map<string, string>()
  participants.forEach((participant, index) => {
    colorMap.set(participant, getParticipantColor(index, participants.length))
  })
  return colorMap
}

export function shouldUseColors(participantCount: number): boolean {
  return participantCount < COLOR_THRESHOLD
}
