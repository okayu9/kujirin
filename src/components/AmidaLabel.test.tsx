import { render } from '@testing-library/react'
import { AmidaLabel } from './AmidaLabel'

describe('AmidaLabel', () => {
  const renderInSvg = (component: React.ReactElement) => {
    return render(<svg>{component}</svg>)
  }

  describe('participant variant', () => {
    it('renders participant label with text', () => {
      const { container } = renderInSvg(
        <AmidaLabel
          x={100}
          y={10}
          text="Alice"
          title="Alice"
          variant="participant"
        />
      )
      expect(container.querySelector('text')).toHaveTextContent('Alice')
    })

    it('renders title element', () => {
      const { container } = renderInSvg(
        <AmidaLabel
          x={100}
          y={10}
          text="Alice"
          title="アリス"
          variant="participant"
        />
      )
      expect(container.querySelector('title')).toHaveTextContent('アリス')
    })

    it('renders shadow rect for participant', () => {
      const { container } = renderInSvg(
        <AmidaLabel
          x={100}
          y={10}
          text="Alice"
          title="Alice"
          variant="participant"
        />
      )
      const rects = container.querySelectorAll('rect')
      expect(rects).toHaveLength(2) // shadow + main rect
    })

    it('applies revealed styling', () => {
      const { container } = renderInSvg(
        <AmidaLabel
          x={100}
          y={10}
          text="Alice"
          title="Alice"
          variant="participant"
          isRevealed={true}
        />
      )
      const mainRect = container.querySelectorAll('rect')[1]
      expect(mainRect).toHaveAttribute('fill', '#dcfce7')
      expect(mainRect).toHaveAttribute('stroke', '#22c55e')
    })

    it('applies participant color', () => {
      const { container } = renderInSvg(
        <AmidaLabel
          x={100}
          y={10}
          text="Alice"
          title="Alice"
          variant="participant"
          participantColor="#e53935"
        />
      )
      const mainRect = container.querySelectorAll('rect')[1]
      expect(mainRect).toHaveAttribute('fill', '#e5393520')
      expect(mainRect).toHaveAttribute('stroke', '#e53935')
    })

    it('adds cursor-pointer class when clickable', () => {
      const { container } = renderInSvg(
        <AmidaLabel
          x={100}
          y={10}
          text="Alice"
          title="Alice"
          variant="participant"
          isClickable={true}
        />
      )
      const g = container.querySelector('g')
      expect(g).toHaveClass('cursor-pointer')
    })
  })

  describe('reward variant', () => {
    it('renders reward label with text', () => {
      const { container } = renderInSvg(
        <AmidaLabel
          x={100}
          y={200}
          text="賞品A"
          title="賞品A"
          variant="reward"
        />
      )
      expect(container.querySelector('text')).toHaveTextContent('賞品A')
    })

    it('has only one rect (no shadow)', () => {
      const { container } = renderInSvg(
        <AmidaLabel
          x={100}
          y={200}
          text="賞品A"
          title="賞品A"
          variant="reward"
        />
      )
      const rects = container.querySelectorAll('rect')
      expect(rects).toHaveLength(1)
    })

    it('uses reward styling', () => {
      const { container } = renderInSvg(
        <AmidaLabel
          x={100}
          y={200}
          text="賞品A"
          title="賞品A"
          variant="reward"
        />
      )
      const rect = container.querySelector('rect')
      expect(rect).toHaveAttribute('fill', '#f0fdf4')
      expect(rect).toHaveAttribute('stroke', '#86efac')
    })
  })

  describe('text splitting', () => {
    it('renders long text as multiple tspans', () => {
      const { container } = renderInSvg(
        <AmidaLabel
          x={100}
          y={10}
          text="長いテキスト名前"
          title="長いテキスト名前"
          variant="participant"
        />
      )
      const tspans = container.querySelectorAll('tspan')
      expect(tspans.length).toBeGreaterThan(1)
    })
  })
})
