export type Phase = 'input' | 'selection' | 'reveal'

export interface AppState {
  phase: Phase

  // Input
  participantsRaw: string
  rewardsRaw: string
  participants: string[]
  rewards: string[]

  // Selection
  assignments: Map<number, string> // columnIndex -> participantName

  // Reveal
  revealedColumns: Set<number>
}

export type AppAction =
  | { type: 'SET_PARTICIPANTS_RAW'; payload: string }
  | { type: 'SET_REWARDS_RAW'; payload: string }
  | { type: 'SET_PARSED_LISTS'; payload: { participants: string[]; rewards: string[] } }
  | { type: 'GO_TO_SELECTION' }
  | { type: 'GO_TO_INPUT' }
  | { type: 'GO_TO_REVEAL' }
  | { type: 'GO_BACK_TO_SELECTION' }
  | { type: 'RESET' }
  | { type: 'ASSIGN_ENTRY'; payload: { columnIndex: number; participantName: string } }
  | { type: 'UNASSIGN_ENTRY'; payload: { columnIndex: number } }
  | { type: 'ASSIGN_RANDOM'; payload: Map<number, string> }
  | { type: 'REVEAL_COLUMN'; payload: number }
  | { type: 'REVEAL_ALL' }
