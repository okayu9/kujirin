import {
  parseAndValidateList,
  validateLists,
  findDuplicates,
} from './index'

describe('parseAndValidateList', () => {
  it('parses valid list', () => {
    const result = parseAndValidateList('Alice\nBob\nCharlie', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(true)
    expect(result.items).toEqual(['Alice', 'Bob', 'Charlie'])
    expect(result.errors).toHaveLength(0)
  })

  it('trims whitespace', () => {
    const result = parseAndValidateList('  Alice  \n  Bob  ', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.items).toEqual(['Alice', 'Bob'])
  })

  it('rejects empty lines', () => {
    const result = parseAndValidateList('Alice\n\nBob', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({
      line: 2,
      message: '空行は使用できません',
    })
  })

  it('rejects whitespace-only lines', () => {
    const result = parseAndValidateList('Alice\n   \nBob', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({
      line: 2,
      message: '空行は使用できません',
    })
  })

  it('rejects control characters', () => {
    const result = parseAndValidateList('Alice\x00', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(false)
    expect(result.errors[0].message).toContain('使用できない文字')
  })

  it('rejects format characters', () => {
    const result = parseAndValidateList('Alice\u200B', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(false)
    expect(result.errors[0].message).toContain('使用できない文字')
  })

  it('rejects items over 12 characters', () => {
    const result = parseAndValidateList('1234567890123', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(false)
    expect(result.errors[0].message).toContain('12文字以内')
  })

  it('accepts items of exactly 12 characters', () => {
    const result = parseAndValidateList('123456789012\nAB', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(true)
  })

  it('counts grapheme clusters for item length validation', () => {
    const result = parseAndValidateList('12345678901😀\nAB', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(true)
  })

  it('requires minimum 2 items', () => {
    const result = parseAndValidateList('Alice', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({
      message: 'テストは2項目以上必要です',
    })
  })

  it('rejects more than 10 items', () => {
    const items = Array.from({ length: 11 }, (_, i) => `Item${i + 1}`).join('\n')
    const result = parseAndValidateList(items, {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({
      message: 'テストは10項目以下にしてください',
    })
  })

  it('accepts exactly 10 items', () => {
    const items = Array.from({ length: 10 }, (_, i) => `Item${i + 1}`).join('\n')
    const result = parseAndValidateList(items, {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(true)
  })

  it('rejects duplicates when not allowed', () => {
    const result = parseAndValidateList('Alice\nBob\nAlice', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(false)
    expect(result.errors[0].message).toContain('重複')
  })

  it('allows duplicates when allowed', () => {
    const result = parseAndValidateList('Alice\nBob\nAlice', {
      allowDuplicates: true,
      listName: 'テスト',
    })
    expect(result.valid).toBe(true)
  })

  it('handles CRLF line endings', () => {
    const result = parseAndValidateList('Alice\r\nBob', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(true)
    expect(result.items).toEqual(['Alice', 'Bob'])
  })

  it('ignores trailing empty line', () => {
    const result = parseAndValidateList('Alice\nBob\n', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(true)
    expect(result.items).toEqual(['Alice', 'Bob'])
    expect(result.errors).toHaveLength(0)
  })

  it('ignores multiple trailing empty lines', () => {
    const result = parseAndValidateList('Alice\nBob\n\n\n', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(true)
    expect(result.items).toEqual(['Alice', 'Bob'])
    expect(result.errors).toHaveLength(0)
  })

  it('ignores trailing whitespace-only lines', () => {
    const result = parseAndValidateList('Alice\nBob\n   ', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(true)
    expect(result.items).toEqual(['Alice', 'Bob'])
  })

  it('still rejects empty lines in the middle even with trailing empty lines', () => {
    const result = parseAndValidateList('Alice\n\nBob\n', {
      allowDuplicates: false,
      listName: 'テスト',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({
      line: 2,
      message: '空行は使用できません',
    })
  })
})

describe('validateLists', () => {
  it('validates matching lists', () => {
    const result = validateLists('Alice\nBob', '賞品A\n賞品B')
    expect(result.valid).toBe(true)
  })

  it('rejects mismatched counts', () => {
    const result = validateLists('Alice\nBob', '賞品A\n賞品B\n賞品C')
    expect(result.valid).toBe(false)
    expect(result.generalErrors[0].message).toContain('一致しません')
  })

  it('allows duplicate goals', () => {
    const result = validateLists('Alice\nBob', '賞品A\n賞品A')
    expect(result.valid).toBe(true)
  })

  it('rejects duplicate participants', () => {
    const result = validateLists('Alice\nAlice', '賞品A\n賞品B')
    expect(result.valid).toBe(false)
    expect(result.participantErrors.length).toBeGreaterThan(0)
  })
})

describe('findDuplicates', () => {
  it('finds duplicate indices', () => {
    const result = findDuplicates(['A', 'B', 'A', 'C', 'B'])
    expect(result).toEqual(new Set([0, 1, 2, 4]))
  })

  it('returns empty set for no duplicates', () => {
    const result = findDuplicates(['A', 'B', 'C'])
    expect(result.size).toBe(0)
  })
})
