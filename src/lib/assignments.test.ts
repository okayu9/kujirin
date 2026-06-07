import {
  assignParticipant,
  createAssignmentsFromParticipants,
  getAssignedParticipants,
  unassignColumn,
} from './assignments'

describe('assignments', () => {
  it('assigns a participant to a column without mutating the source map', () => {
    const assignments = new Map([[1, 'Bob']])

    const nextAssignments = assignParticipant(assignments, 0, 'Alice')

    expect(assignments).toEqual(new Map([[1, 'Bob']]))
    expect(nextAssignments).toEqual(new Map([
      [1, 'Bob'],
      [0, 'Alice'],
    ]))
  })

  it('moves an existing participant assignment to the new column', () => {
    const assignments = new Map([
      [0, 'Alice'],
      [1, 'Bob'],
    ])

    const nextAssignments = assignParticipant(assignments, 2, 'Alice')

    expect(nextAssignments).toEqual(new Map([
      [1, 'Bob'],
      [2, 'Alice'],
    ]))
  })

  it('unassigns a column without mutating the source map', () => {
    const assignments = new Map([
      [0, 'Alice'],
      [1, 'Bob'],
    ])

    const nextAssignments = unassignColumn(assignments, 0)

    expect(assignments.has(0)).toBe(true)
    expect(nextAssignments).toEqual(new Map([[1, 'Bob']]))
  })

  it('creates column assignments from ordered participants', () => {
    expect(createAssignmentsFromParticipants(['Alice', 'Bob'])).toEqual(new Map([
      [0, 'Alice'],
      [1, 'Bob'],
    ]))
  })

  it('returns assigned participant names', () => {
    expect(getAssignedParticipants(new Map([
      [0, 'Alice'],
      [2, 'Bob'],
    ]))).toEqual(new Set(['Alice', 'Bob']))
  })
})
