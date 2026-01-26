import { type ReactNode } from 'react'
import { useAppReducer } from '../hooks'
import { AppContext } from '../context/AppContext'

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useAppReducer()

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}
