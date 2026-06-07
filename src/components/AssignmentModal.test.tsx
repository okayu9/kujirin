import { render, screen, fireEvent } from '@testing-library/react'
import { AssignmentModal } from './AssignmentModal'

describe('AssignmentModal', () => {
  const defaultProps = {
    columnIndex: 0,
    currentAssignment: null,
    participants: ['Alice', 'Bob'],
    assignedParticipants: new Set<string>(),
    onAssign: vi.fn(),
    onUnassign: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('closes on Escape', () => {
    render(<AssignmentModal {...defaultProps} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('keeps Tab focus inside the modal', () => {
    render(<AssignmentModal {...defaultProps} />)

    const firstButton = screen.getByRole('button', { name: 'Alice' })
    const closeButton = screen.getByRole('button', { name: '閉じる' })

    closeButton.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(firstButton).toHaveFocus()

    firstButton.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(closeButton).toHaveFocus()
  })
})
