import { createContext, use } from 'react'

/**
 * Přepínání uživatele je záležitost mocku, ne veřejného auth API.
 * Používá to jen `DevUserSwitcher`, featury na to nesahají.
 */
export const MockAuthControlsContext = createContext<((userId: string) => void) | null>(null)

export function useMockAuthControls() {
  const switchUser = use(MockAuthControlsContext)

  if (switchUser === null) {
    throw new Error('useMockAuthControls() musí být uvnitř <MockAuthProvider>.')
  }

  return switchUser
}
