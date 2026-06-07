import { useCallback, useMemo, useState } from 'react'
import { useAppContext } from '../hooks'
import { fisherYatesShuffle } from '../lib/amida'
import { AmidaPreview } from './AmidaPreview'
import { AssignmentModal } from './AssignmentModal'
import { PhaseHeader } from './PhaseHeader'

export function SelectionPhase() {
  const { state, dispatch } = useAppContext()
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null)

  const allAssigned = state.assignments.size === state.participants.length

  const assignedParticipants = useMemo(() => {
    return new Set(state.assignments.values())
  }, [state.assignments])

  const handleColumnClick = useCallback((columnIndex: number) => {
    setSelectedColumn(columnIndex)
  }, [])

  const handleAssign = useCallback(
    (participantName: string) => {
      if (selectedColumn !== null) {
        dispatch({
          type: 'ASSIGN_ENTRY',
          payload: { columnIndex: selectedColumn, participantName },
        })
      }
      setSelectedColumn(null)
    },
    [dispatch, selectedColumn]
  )

  const handleUnassign = useCallback(() => {
    if (selectedColumn !== null) {
      dispatch({
        type: 'UNASSIGN_ENTRY',
        payload: { columnIndex: selectedColumn },
      })
    }
    setSelectedColumn(null)
  }, [dispatch, selectedColumn])

  const handleCloseModal = useCallback(() => {
    setSelectedColumn(null)
  }, [])

  const handleRandomAssign = useCallback(() => {
    const shuffled = fisherYatesShuffle(state.participants)

    const newAssignments = new Map<number, string>()
    shuffled.forEach((participant, index) => {
      newAssignments.set(index, participant)
    })

    dispatch({ type: 'ASSIGN_RANDOM', payload: newAssignments })
  }, [dispatch, state.participants])

  const handleBack = useCallback(() => {
    dispatch({ type: 'GO_TO_INPUT' })
  }, [dispatch])

  const handleProceed = useCallback(() => {
    if (!allAssigned) return
    dispatch({ type: 'GO_TO_REVEAL' })
  }, [allAssigned, dispatch])

  return (
    <div className="space-y-6">
      <PhaseHeader
        step={2}
        title="スタート位置を決める"
        description="誰がどこからスタートするか決めましょう"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-amber-50 rounded-xl p-4">
        <div className="text-sm text-amber-800">
          上部のラベルをクリックして、参加者を配置してください
        </div>
        <button
          onClick={handleRandomAssign}
          className="px-4 py-2 text-sm bg-gradient-secondary text-white rounded-lg font-medium shadow btn-hover-lift"
        >
          <span aria-hidden="true">🎲</span> シャッフル
        </button>
      </div>

      <div className="overflow-x-auto pb-4">
        <AmidaPreview
          columnCount={state.rewards.length}
          rewards={state.rewards}
          assignments={state.assignments}
          onColumnClick={handleColumnClick}
        />
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
        >
          <span aria-hidden="true">←</span> 戻る
        </button>
        <button
          onClick={handleProceed}
          disabled={!allAssigned}
          className="px-8 py-3 bg-gradient-success text-white rounded-xl font-bold shadow-lg btn-hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          くじを引く <span aria-hidden="true">🎋</span>
        </button>
      </div>

      {selectedColumn !== null && (
        <AssignmentModal
          columnIndex={selectedColumn}
          currentAssignment={state.assignments.get(selectedColumn) || null}
          participants={state.participants}
          assignedParticipants={assignedParticipants}
          onAssign={handleAssign}
          onUnassign={handleUnassign}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
