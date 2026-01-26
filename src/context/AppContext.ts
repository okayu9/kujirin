import { createContext, type Dispatch } from 'react'
import type { AppState, AppAction } from '../types'

export interface AppContextValue {
  state: AppState
  dispatch: Dispatch<AppAction>
}

export const AppContext = createContext<AppContextValue | null>(null)
