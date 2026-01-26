import { render, screen } from '@testing-library/react'
import App from './App'
import { AppProvider } from './components/AppProvider'

describe('App', () => {
  it('renders the title', () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    )
    expect(screen.getByText('くじりん')).toBeInTheDocument()
  })
})
