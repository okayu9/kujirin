import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ResultPanel } from './ResultPanel'

describe('ResultPanel', () => {
  const mockClipboard = {
    writeText: vi.fn(),
  }
  Object.assign(navigator, { clipboard: mockClipboard })

  beforeEach(() => {
    vi.clearAllMocks()
    mockClipboard.writeText.mockResolvedValue(undefined)
  })

  const defaultProps = {
    participants: ['Alice', 'Bob'],
    results: new Map([
      ['Alice', '賞品A'],
      ['Bob', '賞品B'],
    ]),
    revealedColumns: new Set<number>(),
    assignments: new Map([
      [0, 'Alice'],
      [1, 'Bob'],
    ]),
  }

  it('renders title', () => {
    render(<ResultPanel {...defaultProps} />)
    expect(screen.getByText('結果発表')).toBeInTheDocument()
  })

  it('shows placeholder when no results revealed', () => {
    render(<ResultPanel {...defaultProps} revealedColumns={new Set()} />)
    expect(screen.getByText(/上の参加者ラベルをクリック/)).toBeInTheDocument()
  })

  it('shows revealed results', () => {
    render(<ResultPanel {...defaultProps} revealedColumns={new Set([0])} />)
    expect(screen.getByText('賞品A')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('shows unrevealed participants with ???', () => {
    render(<ResultPanel {...defaultProps} revealedColumns={new Set([0])} />)
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('???')).toBeInTheDocument()
  })

  it('shows copy button when results are revealed', () => {
    render(<ResultPanel {...defaultProps} revealedColumns={new Set([0])} />)
    expect(screen.getByRole('button', { name: 'コピー' })).toBeInTheDocument()
  })

  it('does not show copy button when no results revealed', () => {
    render(<ResultPanel {...defaultProps} revealedColumns={new Set()} />)
    expect(screen.queryByRole('button', { name: 'コピー' })).not.toBeInTheDocument()
  })

  it('copies results to clipboard on button click', async () => {
    render(<ResultPanel {...defaultProps} revealedColumns={new Set([0, 1])} />)
    const copyButton = screen.getByRole('button', { name: 'コピー' })
    fireEvent.click(copyButton)
    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith('Alice → 賞品A\nBob → 賞品B')
    })
  })

  it('shows copy success feedback', async () => {
    render(<ResultPanel {...defaultProps} revealedColumns={new Set([0])} />)

    fireEvent.click(screen.getByRole('button', { name: 'コピー' }))

    expect(await screen.findByText('コピーしました')).toBeInTheDocument()
  })

  it('shows copy error feedback', async () => {
    mockClipboard.writeText.mockRejectedValue(new Error('denied'))
    render(<ResultPanel {...defaultProps} revealedColumns={new Set([0])} />)

    fireEvent.click(screen.getByRole('button', { name: 'コピー' }))

    expect(await screen.findByText('コピーできませんでした')).toBeInTheDocument()
  })
})
