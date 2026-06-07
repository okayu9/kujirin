import { useReducer } from 'react'
import type { AppState, AppAction } from '../types'
import { assignParticipant, unassignColumn } from '../lib/assignments'

export const initialState: AppState = {
  phase: 'input',

  participantsRaw: '',
  rewardsRaw: '',
  participants: [],
  rewards: [],

  assignments: new Map(),

  revealedColumns: new Set(),
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PARTICIPANTS_RAW':
      return { ...state, participantsRaw: action.payload }

    case 'SET_REWARDS_RAW':
      return { ...state, rewardsRaw: action.payload }

    case 'SET_PARSED_LISTS':
      return {
        ...state,
        participants: action.payload.participants,
        rewards: action.payload.rewards,
      }

    case 'GO_TO_SELECTION':
      return {
        ...state,
        phase: 'selection',
        assignments: new Map(),
      }

    case 'GO_TO_INPUT':
      return {
        ...state,
        phase: 'input',
        assignments: new Map(),
        revealedColumns: new Set(),
      }

    case 'GO_TO_REVEAL':
      return {
        ...state,
        phase: 'reveal',
        revealedColumns: new Set(),
      }

    case 'GO_BACK_TO_SELECTION':
      return {
        ...state,
        phase: 'selection',
        revealedColumns: new Set(),
      }

    case 'ASSIGN_ENTRY': {
      const { columnIndex, participantName } = action.payload
      return {
        ...state,
        assignments: assignParticipant(state.assignments, columnIndex, participantName),
      }
    }

    case 'UNASSIGN_ENTRY': {
      return {
        ...state,
        assignments: unassignColumn(state.assignments, action.payload.columnIndex),
      }
    }

    case 'ASSIGN_RANDOM':
      return { ...state, assignments: action.payload }

    case 'REVEAL_COLUMN': {
      const newRevealed = new Set(state.revealedColumns)
      newRevealed.add(action.payload)
      return { ...state, revealedColumns: newRevealed }
    }

    case 'REVEAL_ALL': {
      const allColumns = new Set<number>()
      for (let i = 0; i < state.participants.length; i++) {
        allColumns.add(i)
      }
      return { ...state, revealedColumns: allColumns }
    }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

export function useAppReducer() {
  return useReducer(appReducer, initialState)
}
