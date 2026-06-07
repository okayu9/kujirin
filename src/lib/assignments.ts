export type Assignments = Map<number, string>

export function assignParticipant(
  assignments: Assignments,
  columnIndex: number,
  participantName: string
): Assignments {
  const nextAssignments = new Map(assignments)

  for (const [assignedColumnIndex, assignedParticipant] of nextAssignments) {
    if (assignedParticipant === participantName) {
      nextAssignments.delete(assignedColumnIndex)
    }
  }

  nextAssignments.set(columnIndex, participantName)
  return nextAssignments
}

export function unassignColumn(assignments: Assignments, columnIndex: number): Assignments {
  const nextAssignments = new Map(assignments)
  nextAssignments.delete(columnIndex)
  return nextAssignments
}

export function createAssignmentsFromParticipants(participants: string[]): Assignments {
  return new Map(participants.map((participant, index) => [index, participant]))
}

export function getAssignedParticipants(assignments: Assignments): Set<string> {
  return new Set(assignments.values())
}
