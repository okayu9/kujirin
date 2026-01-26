import { render, screen, fireEvent } from '@testing-library/react'
import { ListInput } from './ListInput'

describe('ListInput', () => {
  const defaultProps = {
    label: 'テストラベル',
    value: '',
    onChange: vi.fn(),
    errors: [],
    duplicateIndices: new Set<number>(),
  }

  it('renders label', () => {
    render(<ListInput {...defaultProps} />)
    expect(screen.getByText('テストラベル')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(<ListInput {...defaultProps} icon="👤" />)
    expect(screen.getByText('👤')).toBeInTheDocument()
  })

  it('renders textarea with value', () => {
    render(<ListInput {...defaultProps} value={'Alice\nBob'} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('Alice\nBob')
  })

  it('renders placeholder', () => {
    render(<ListInput {...defaultProps} placeholder="入力してください" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('placeholder', '入力してください')
  })

  it('calls onChange when text is entered', () => {
    const onChange = vi.fn()
    render(<ListInput {...defaultProps} onChange={onChange} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'New text' } })
    expect(onChange).toHaveBeenCalledWith('New text')
  })

  it('displays line numbers based on value', () => {
    // Line count is derived from value.split('\n')
    render(<ListInput {...defaultProps} value={'Line1\nLine2\nLine3'} />)
    // Line number 1 should always be present
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('displays errors', () => {
    const errors = [
      { line: 1, message: 'エラー1' },
      { message: 'エラー2' },
    ]
    render(<ListInput {...defaultProps} errors={errors} />)
    expect(screen.getByText('1行目: エラー1')).toBeInTheDocument()
    expect(screen.getByText('エラー2')).toBeInTheDocument()
  })

  it('does not show error list when no errors', () => {
    render(<ListInput {...defaultProps} errors={[]} />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
