import { useCallback, useMemo } from 'react'
import { getParticipantColor, shouldUseColors } from '../lib/colors'

interface ResultPanelProps {
  participants: string[]
  results: Map<string, string>
  revealedColumns: Set<number>
  assignments: Map<number, string>
}

export function ResultPanel({
  participants,
  results,
  revealedColumns,
  assignments,
}: ResultPanelProps) {
  const revealedParticipants = useMemo(() => {
    const set = new Set<string>()
    for (const columnIndex of revealedColumns) {
      const participant = assignments.get(columnIndex)
      if (participant) {
        set.add(participant)
      }
    }
    return set
  }, [revealedColumns, assignments])

  const handleCopy = useCallback(() => {
    const lines: string[] = []
    for (const participant of participants) {
      const reward = results.get(participant)
      if (revealedParticipants.has(participant) && reward) {
        lines.push(`${participant} → ${reward}`)
      }
    }
    navigator.clipboard.writeText(lines.join('\n'))?.catch(() => {
      // Clipboard API may fail in insecure contexts or when denied permission
    })
  }, [participants, results, revealedParticipants])

  const hasRevealedResults = revealedParticipants.size > 0

  const useColors = shouldUseColors(participants.length)
  const participantColorList = useMemo(
    () => participants.map((_, index) => getParticipantColor(index, participants.length)),
    [participants]
  )

  return (
    <div className="bg-gradient-card border-2 border-amber-200 rounded-2xl p-5 card-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">🏆</span>
          結果発表
        </h3>
        {hasRevealedResults && (
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors font-medium flex items-center gap-1"
          >
            📋 コピー
          </button>
        )}
      </div>

      {!hasRevealedResults ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎋</div>
          <p className="text-gray-500">
            上の参加者ラベルをクリックして<br />
            くじを引いてみましょう
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {participants.map((participant, index) => {
            const reward = results.get(participant)
            const isRevealed = revealedParticipants.has(participant)
            const color = participantColorList[index]

            return (
              <div
                key={participant}
                className={`flex justify-between items-center p-3 rounded-xl transition-all ${
                  isRevealed
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 result-reveal'
                    : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {useColors && (
                    <div
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  <span className={`font-medium ${isRevealed ? 'text-gray-800' : 'text-gray-400'}`}>
                    {participant}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isRevealed ? (
                    <>
                      <span className="text-green-600 font-bold">{reward}</span>
                      <span className="text-green-500">✓</span>
                    </>
                  ) : (
                    <span className="text-gray-300 font-mono">???</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
