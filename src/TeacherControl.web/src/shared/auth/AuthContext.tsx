import { createContext, use } from 'react'
import type { AuthContextValue } from './types'

/**
 * Auth je schválně za jedním rozhraním.
 *
 * Dokud není hotová featura F6 (Login proti školnímu systému), plní kontext `MockAuthProvider`.
 * Až F6 přijde, vymění se jen implementace providera. Veřejné API `useAuth()` a typy zůstávají
 * stejné, featury se kvůli tomu nemění.
 */
export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = use(AuthContext)

  if (context === null) {
    throw new Error('useAuth() musí být uvnitř <MockAuthProvider>. Zkontroluj main.tsx.')
  }

  return context
}
