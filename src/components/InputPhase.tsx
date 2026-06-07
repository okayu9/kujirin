import { useCallback, useMemo, useState } from 'react'
import { useAppContext } from '../hooks'
import { ListInput } from './ListInput'
import { validateLists, findDuplicates } from '../lib/validation'

export function InputPhase() {
  const { state, dispatch } = useAppContext()
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  const validation = useMemo(
    () => validateLists(state.participantsRaw, state.rewardsRaw),
    [state.participantsRaw, state.rewardsRaw]
  )

  const participantDuplicates = useMemo(() => {
    const lines = state.participantsRaw.split('\n').map((l) => l.trim())
    return findDuplicates(lines)
  }, [state.participantsRaw])

  // Filter errors: show line-level errors immediately, list-level errors only after submit attempt
  const participantErrorsToShow = useMemo(() => {
    if (hasAttemptedSubmit) return validation.participantErrors
    return validation.participantErrors.filter((e) => e.line !== undefined)
  }, [validation.participantErrors, hasAttemptedSubmit])

  const rewardErrorsToShow = useMemo(() => {
    if (hasAttemptedSubmit) return validation.rewardErrors
    return validation.rewardErrors.filter((e) => e.line !== undefined)
  }, [validation.rewardErrors, hasAttemptedSubmit])

  const handleParticipantsChange = useCallback(
    (value: string) => {
      dispatch({ type: 'SET_PARTICIPANTS_RAW', payload: value })
    },
    [dispatch]
  )

  const handleRewardsChange = useCallback(
    (value: string) => {
      dispatch({ type: 'SET_REWARDS_RAW', payload: value })
    },
    [dispatch]
  )

  const handleNext = useCallback(() => {
    setHasAttemptedSubmit(true)

    if (!validation.valid) return

    dispatch({
      type: 'SET_PARSED_LISTS',
      payload: { participants: validation.participants, rewards: validation.rewards },
    })

    dispatch({ type: 'GO_TO_SELECTION' })
  }, [dispatch, validation])

  const isParticipantsEmpty = state.participantsRaw.trim() === ''
  const isRewardsEmpty = state.rewardsRaw.trim() === ''

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-amber-200">
        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold shadow">
          1
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">参加者とゴールを入力</h2>
          <p className="text-sm text-gray-500">くじを引く人と、当たりの内容を決めましょう</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ListInput
          label="参加者"
          icon="👤"
          value={state.participantsRaw}
          onChange={handleParticipantsChange}
          errors={isParticipantsEmpty && !hasAttemptedSubmit ? [] : participantErrorsToShow}
          duplicateIndices={isParticipantsEmpty ? new Set() : participantDuplicates}
          placeholder="ぽんず&#10;もちまる&#10;ゆきだるま&#10;ひつじ丸"
        />
        <ListInput
          label="ゴール"
          icon="🎯"
          value={state.rewardsRaw}
          onChange={handleRewardsChange}
          errors={isRewardsEmpty && !hasAttemptedSubmit ? [] : rewardErrorsToShow}
          duplicateIndices={new Set()}
          placeholder="焼肉おごり&#10;スイーツ食べ放題&#10;肩もみ券&#10;明日の掃除当番"
        />
      </div>

      {hasAttemptedSubmit && validation.generalErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <ul className="text-red-600 text-sm space-y-1">
            {validation.generalErrors.map((error, i) => (
              <li key={i} className="flex items-center gap-2">
                <span aria-hidden="true">⚠️</span>
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-gradient-primary text-white rounded-xl font-bold shadow-lg btn-hover-lift"
        >
          次へ進む <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}
