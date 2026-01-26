import { renderHook, act } from '@testing-library/react'
import { useAppReducer, initialState } from './useAppReducer'

describe('useAppReducer', () => {
  describe('initialState', () => {
    it('has correct initial values', () => {
      expect(initialState.phase).toBe('input')
      expect(initialState.participantsRaw).toBe('')
      expect(initialState.rewardsRaw).toBe('')
      expect(initialState.participants).toEqual([])
      expect(initialState.rewards).toEqual([])
      expect(initialState.assignments.size).toBe(0)
      expect(initialState.revealedColumns.size).toBe(0)
    })
  })

  describe('SET_PARTICIPANTS_RAW', () => {
    it('updates participantsRaw', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      act(() => {
        dispatch({ type: 'SET_PARTICIPANTS_RAW', payload: 'Alice\nBob' })
      })

      expect(result.current[0].participantsRaw).toBe('Alice\nBob')
    })
  })

  describe('SET_REWARDS_RAW', () => {
    it('updates rewardsRaw', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      act(() => {
        dispatch({ type: 'SET_REWARDS_RAW', payload: '景品A\n景品B' })
      })

      expect(result.current[0].rewardsRaw).toBe('景品A\n景品B')
    })
  })

  describe('SET_PARSED_LISTS', () => {
    it('updates participants and rewards arrays', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      act(() => {
        dispatch({
          type: 'SET_PARSED_LISTS',
          payload: { participants: ['Alice', 'Bob'], rewards: ['景品A', '景品B'] },
        })
      })

      expect(result.current[0].participants).toEqual(['Alice', 'Bob'])
      expect(result.current[0].rewards).toEqual(['景品A', '景品B'])
    })
  })

  describe('GO_TO_SELECTION', () => {
    it('changes phase to selection and resets assignments', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      // First set up some state
      act(() => {
        dispatch({ type: 'SET_PARTICIPANTS_RAW', payload: 'Alice\nBob' })
      })

      act(() => {
        dispatch({ type: 'GO_TO_SELECTION' })
      })

      expect(result.current[0].phase).toBe('selection')
      expect(result.current[0].assignments.size).toBe(0)
    })
  })

  describe('GO_TO_INPUT', () => {
    it('changes phase to input and resets assignments and revealed columns', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      // Set up state in selection phase
      act(() => {
        dispatch({ type: 'GO_TO_SELECTION' })
        dispatch({ type: 'ASSIGN_ENTRY', payload: { columnIndex: 0, participantName: 'Alice' } })
      })

      act(() => {
        dispatch({ type: 'GO_TO_INPUT' })
      })

      expect(result.current[0].phase).toBe('input')
      expect(result.current[0].assignments.size).toBe(0)
      expect(result.current[0].revealedColumns.size).toBe(0)
    })
  })

  describe('GO_TO_REVEAL', () => {
    it('changes phase to reveal and resets revealed columns', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      act(() => {
        dispatch({ type: 'GO_TO_SELECTION' })
      })

      act(() => {
        dispatch({ type: 'GO_TO_REVEAL' })
      })

      expect(result.current[0].phase).toBe('reveal')
      expect(result.current[0].revealedColumns.size).toBe(0)
    })
  })

  describe('GO_BACK_TO_SELECTION', () => {
    it('changes phase back to selection and resets revealed columns', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      // Go to reveal phase first
      act(() => {
        dispatch({ type: 'GO_TO_SELECTION' })
        dispatch({ type: 'GO_TO_REVEAL' })
        dispatch({ type: 'REVEAL_COLUMN', payload: 0 })
      })

      act(() => {
        dispatch({ type: 'GO_BACK_TO_SELECTION' })
      })

      expect(result.current[0].phase).toBe('selection')
      expect(result.current[0].revealedColumns.size).toBe(0)
    })
  })

  describe('ASSIGN_ENTRY', () => {
    it('assigns participant to column', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      act(() => {
        dispatch({ type: 'ASSIGN_ENTRY', payload: { columnIndex: 0, participantName: 'Alice' } })
      })

      expect(result.current[0].assignments.get(0)).toBe('Alice')
    })

    it('removes previous assignment for same participant', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      act(() => {
        dispatch({ type: 'ASSIGN_ENTRY', payload: { columnIndex: 0, participantName: 'Alice' } })
      })

      act(() => {
        dispatch({ type: 'ASSIGN_ENTRY', payload: { columnIndex: 2, participantName: 'Alice' } })
      })

      expect(result.current[0].assignments.has(0)).toBe(false)
      expect(result.current[0].assignments.get(2)).toBe('Alice')
    })

    it('can assign multiple participants to different columns', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      act(() => {
        dispatch({ type: 'ASSIGN_ENTRY', payload: { columnIndex: 0, participantName: 'Alice' } })
        dispatch({ type: 'ASSIGN_ENTRY', payload: { columnIndex: 1, participantName: 'Bob' } })
      })

      expect(result.current[0].assignments.get(0)).toBe('Alice')
      expect(result.current[0].assignments.get(1)).toBe('Bob')
    })
  })

  describe('UNASSIGN_ENTRY', () => {
    it('removes assignment from column', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      act(() => {
        dispatch({ type: 'ASSIGN_ENTRY', payload: { columnIndex: 0, participantName: 'Alice' } })
      })

      act(() => {
        dispatch({ type: 'UNASSIGN_ENTRY', payload: { columnIndex: 0 } })
      })

      expect(result.current[0].assignments.has(0)).toBe(false)
    })

    it('does nothing for unassigned column', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      act(() => {
        dispatch({ type: 'UNASSIGN_ENTRY', payload: { columnIndex: 5 } })
      })

      expect(result.current[0].assignments.size).toBe(0)
    })
  })

  describe('ASSIGN_RANDOM', () => {
    it('sets assignments map directly', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      const randomAssignments = new Map([
        [0, 'Alice'],
        [1, 'Bob'],
        [2, 'Charlie'],
      ])

      act(() => {
        dispatch({ type: 'ASSIGN_RANDOM', payload: randomAssignments })
      })

      expect(result.current[0].assignments).toEqual(randomAssignments)
    })
  })

  describe('REVEAL_COLUMN', () => {
    it('adds column to revealed set', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      act(() => {
        dispatch({ type: 'REVEAL_COLUMN', payload: 0 })
      })

      expect(result.current[0].revealedColumns.has(0)).toBe(true)
    })

    it('can reveal multiple columns', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      act(() => {
        dispatch({ type: 'REVEAL_COLUMN', payload: 0 })
        dispatch({ type: 'REVEAL_COLUMN', payload: 2 })
      })

      expect(result.current[0].revealedColumns.has(0)).toBe(true)
      expect(result.current[0].revealedColumns.has(2)).toBe(true)
      expect(result.current[0].revealedColumns.size).toBe(2)
    })

    it('does not duplicate when revealing same column twice', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      act(() => {
        dispatch({ type: 'REVEAL_COLUMN', payload: 0 })
        dispatch({ type: 'REVEAL_COLUMN', payload: 0 })
      })

      expect(result.current[0].revealedColumns.size).toBe(1)
    })
  })

  describe('REVEAL_ALL', () => {
    it('reveals all columns based on participants length', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      act(() => {
        dispatch({
          type: 'SET_PARSED_LISTS',
          payload: { participants: ['Alice', 'Bob', 'Charlie'], rewards: ['A', 'B', 'C'] },
        })
      })

      act(() => {
        dispatch({ type: 'REVEAL_ALL' })
      })

      expect(result.current[0].revealedColumns.has(0)).toBe(true)
      expect(result.current[0].revealedColumns.has(1)).toBe(true)
      expect(result.current[0].revealedColumns.has(2)).toBe(true)
      expect(result.current[0].revealedColumns.size).toBe(3)
    })
  })

  describe('RESET', () => {
    it('resets to initial state', () => {
      const { result } = renderHook(() => useAppReducer())
      const [, dispatch] = result.current

      // Set up various state
      act(() => {
        dispatch({ type: 'SET_PARTICIPANTS_RAW', payload: 'Alice\nBob' })
        dispatch({ type: 'SET_REWARDS_RAW', payload: '景品A\n景品B' })
        dispatch({ type: 'GO_TO_SELECTION' })
        dispatch({ type: 'ASSIGN_ENTRY', payload: { columnIndex: 0, participantName: 'Alice' } })
      })

      act(() => {
        dispatch({ type: 'RESET' })
      })

      expect(result.current[0]).toEqual(initialState)
    })
  })

  describe('unknown action', () => {
    it('returns current state for unknown action type', () => {
      const { result } = renderHook(() => useAppReducer())
      const [stateBefore, dispatch] = result.current

      act(() => {
        // @ts-expect-error Testing unknown action
        dispatch({ type: 'UNKNOWN_ACTION' })
      })

      expect(result.current[0]).toEqual(stateBefore)
    })
  })
})
