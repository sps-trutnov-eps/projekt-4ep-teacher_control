import { createContext, use } from 'react'
import type { AuthContextValue } from './types'

/**
 * Auth je za jednotným rozhraním AuthContextValue.
 * V produkci a v aplikaci ho plní AuthProvider (napojení na /api/auth/me).
 * Ve vybraných testech komponent může být použit MockAuthProvider.
 */
export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = use(AuthContext)

  if (context === null) {
    throw new Error('useAuth() musí být uvnitř <AuthProvider> nebo <MockAuthProvider>.')
  }

  return context
}
