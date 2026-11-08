import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import { MockAuthControlsContext } from './mockAuthControls'
import { DEFAULT_MOCK_USER_ID, MOCK_USERS } from './mockUsers'
import type { AuthContextValue, Role, User } from './types'

const STORAGE_KEY = 'teacher-control.mock-user-id'
const STORAGE_USER_KEY = 'teacher-control.mock-user-data'

function findUser(id: string | null): User | null {
  return MOCK_USERS.find((user) => user.id === id) ?? null
}

function readStoredUser(): User | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_USER_KEY)
    if (raw) {
      return JSON.parse(raw) as User
    }
    return findUser(sessionStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function storeUser(user: User | null): void {
  try {
    if (user === null) {
      sessionStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(STORAGE_USER_KEY)
    } else {
      sessionStorage.setItem(STORAGE_KEY, user.id)
      sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
    }
  } catch {
    // sessionStorage je jen pohodlí ve vývoji, když nejde, nic se neděje.
  }
}

/**
 * Dočasná implementace auth pro vývoj. Nahradí ji featura F6 Login.
 * Přepínání uživatele obsluhuje `DevUserSwitcher`.
 */
export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(
    () => readStoredUser() ?? findUser(DEFAULT_MOCK_USER_ID),
  )

  const switchUser = useCallback((id: string) => {
    const next = findUser(id)
    storeUser(next)
    setUser(next)
  }, [])

  const login = useCallback(async (user: User) => {
    storeUser(user)
    setUser(user)
  }, [])

  const logout = useCallback(async () => {
    storeUser(null)
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

  return (
    <AuthContext value={value}>
      <MockAuthControlsContext value={switchUser}>{children}</MockAuthControlsContext>
    </AuthContext>
  )
}
