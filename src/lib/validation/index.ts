export interface ValidationError {
  line?: number
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  items: string[]
}

const MAX_ITEM_LENGTH = 12
const MIN_ITEMS = 2
const MAX_ITEMS = 10

// Unicode General Category Cc (control) and Cf (format) detection
function hasControlCharacters(str: string): boolean {
  // eslint-disable-next-line no-control-regex
  const controlRegex = /[\x00-\x1F\x7F-\x9F]/
  // Format characters (Cf) - common ones
  const formatRegex = /[\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF]/

  return controlRegex.test(str) || formatRegex.test(str)
}

export function parseAndValidateList(
  raw: string,
  options: {
    allowDuplicates: boolean
    listName: string
  }
): ValidationResult {
  const errors: ValidationError[] = []
  const lines = raw.split(/\r?\n/)
  const items: string[] = []

  // Find the last non-empty line index (ignore trailing empty lines)
  let lastNonEmptyIndex = lines.length - 1
  while (lastNonEmptyIndex >= 0 && lines[lastNonEmptyIndex].trim() === '') {
    lastNonEmptyIndex--
  }

  for (let i = 0; i <= lastNonEmptyIndex; i++) {
    const trimmed = lines[i].trim()
    const lineNum = i + 1

    if (trimmed === '') {
      // Empty line in the middle is an error
      errors.push({
        line: lineNum,
        message: '空行は使用できません',
      })
      continue
    }

    if (hasControlCharacters(trimmed)) {
      errors.push({
        line: lineNum,
        message: '使用できない文字が含まれています',
      })
      continue
    }

    if (trimmed.length > MAX_ITEM_LENGTH) {
      errors.push({
        line: lineNum,
        message: `${MAX_ITEM_LENGTH}文字以内にしてください`,
      })
      continue
    }

    items.push(trimmed)
  }

  if (items.length < MIN_ITEMS) {
    errors.push({
      message: `${options.listName}は${MIN_ITEMS}項目以上必要です`,
    })
  }

  if (items.length > MAX_ITEMS) {
    errors.push({
      message: `${options.listName}は${MAX_ITEMS}項目以下にしてください`,
    })
  }

  if (!options.allowDuplicates) {
    const seen = new Map<string, number>()
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (seen.has(item)) {
        errors.push({
          line: i + 1,
          message: `「${item}」が重複しています（${seen.get(item)}行目）`,
        })
      } else {
        seen.set(item, i + 1)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    items,
  }
}

export function validateLists(
  participantsRaw: string,
  rewardsRaw: string
): {
  valid: boolean
  participantErrors: ValidationError[]
  rewardErrors: ValidationError[]
  generalErrors: ValidationError[]
  participants: string[]
  rewards: string[]
} {
  const participantResult = parseAndValidateList(participantsRaw, {
    allowDuplicates: false,
    listName: '参加者',
  })

  const rewardResult = parseAndValidateList(rewardsRaw, {
    allowDuplicates: true,
    listName: 'ゴール',
  })

  const generalErrors: ValidationError[] = []

  if (
    participantResult.items.length > 0 &&
    rewardResult.items.length > 0 &&
    participantResult.items.length !== rewardResult.items.length
  ) {
    generalErrors.push({
      message: `参加者数（${participantResult.items.length}）とゴール数（${rewardResult.items.length}）が一致しません`,
    })
  }

  const valid =
    participantResult.valid &&
    rewardResult.valid &&
    generalErrors.length === 0

  return {
    valid,
    participantErrors: participantResult.errors,
    rewardErrors: rewardResult.errors,
    generalErrors,
    participants: participantResult.items,
    rewards: rewardResult.items,
  }
}

export function findDuplicates(items: string[]): Set<number> {
  const seen = new Map<string, number>()
  const duplicateIndices = new Set<number>()

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const previousIndex = seen.get(item)
    if (previousIndex !== undefined) {
      duplicateIndices.add(previousIndex)
      duplicateIndices.add(i)
    } else {
      seen.set(item, i)
    }
  }

  return duplicateIndices
}
