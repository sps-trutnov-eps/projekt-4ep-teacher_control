import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '@/shared/api'
import { AuthContext } from './AuthContext'
import type { AuthContextValue, Role, User } from './types'

async function restoreSession(): Promise<User | null> {
  try {
    const { data, error } = await api.GET('/api/auth/me')
    if (error || !data) {
      return null
    }
    return data as User
  } catch {
    return null
  }
}

async function callLogoutApi(): Promise<void> {
  try {
    await api.POST('/api/auth/logout')
  } catch {
    // Session se uklidí na serveru při příštím requestu.
  }
}

/**
 * Reálná implementace auth pro celou aplikaci.
 *
 * Na startu ověří stav přihlášení přes GET /api/auth/me (cookie session).
 * Přihlášení tak přežije obnovení stránky a nepřihlášený uživatel má `user === null`.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    restoreSession().then((u) => {
      setUser(u)
      setReady(true)
    })
  }, [])

  const login = useCallback(async (u?: User) => {
    if (u) {
      setUser(u)
      return
    }
    const current = await restoreSession()
    setUser(current)
  }, [])

  const logout = useCallback(async () => {
    await callLogoutApi()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    const roles: Role[] = user?.roles ?? []

    return {
      user,
      isAuthenticated: user !== null,
      roles,
      hasRole: (role) => roles.includes(role),
      login,
      logout,
    }
  }, [user, login, logout])

  if (!ready) {
    return null
  }

  return <AuthContext value={value}>{children}</AuthContext>
}
