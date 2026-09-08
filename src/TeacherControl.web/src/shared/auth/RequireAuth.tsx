import { Alert } from '@mantine/core'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'

/** Route guard: obsah se vykreslí jen přihlášenému uživateli. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <Alert color="yellow" title="Nepřihlášen">
        Pro zobrazení této stránky se musíš přihlásit.
      </Alert>
    )
  }

  return <>{children}</>
}
