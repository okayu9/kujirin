import { useEffect, useRef } from 'react'

interface AssignmentModalProps {
  columnIndex: number
  currentAssignment: string | null
  participants: string[]
  assignedParticipants: Set<string>
  onAssign: (participantName: string) => void
  onUnassign: () => void
  onClose: () => void
}

export function AssignmentModal({
  columnIndex,
  currentAssignment,
  participants,
  assignedParticipants,
  onAssign,
  onUnassign,
  onClose,
}: AssignmentModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key !== 'Tab') {
        return
      }

      const modal = modalRef.current
      if (!modal) return

      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!firstElement || !lastElement) {
        e.preventDefault()
        return
      }

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const modalTitleId = `modal-title-${columnIndex}`

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 card-shadow-lg"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
      >
        <h3
          id={modalTitleId}
          className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"
        >
          <span className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
            {columnIndex + 1}
          </span>
          <span>参加者を選ぶ</span>
        </h3>

        {currentAssignment && (
          <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-xs text-amber-600 mb-1">現在の配置</div>
            <div className="font-bold text-amber-800">{currentAssignment}</div>
          </div>
        )}

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {participants.map((participant) => {
            const isAssigned = assignedParticipants.has(participant)
            const isCurrentlyAssigned = participant === currentAssignment

            return (
              <button
                key={participant}
                onClick={() => onAssign(participant)}
                disabled={isAssigned && !isCurrentlyAssigned}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  isCurrentlyAssigned
                    ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-2 border-orange-300 font-medium'
                    : isAssigned
                      ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                      : 'bg-gray-50 hover:bg-amber-50 hover:border-amber-200 text-gray-700 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{participant}</span>
                  {isAssigned && !isCurrentlyAssigned && (
                    <span className="text-xs text-gray-400">配置済み</span>
                  )}
                  {isCurrentlyAssigned && (
                    <span className="text-orange-500">✓</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex gap-3">
          {currentAssignment && (
            <button
              onClick={onUnassign}
              className="flex-1 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
            >
              外す
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
