import { Alert } from '@mantine/core'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type { Role } from './types'

interface RequireRoleProps {
  role: Role
  children: ReactNode
}

/** Route guard: obsah se vykreslí jen uživateli s danou rolí. */
export function RequireRole({ role, children }: RequireRoleProps) {
  const { hasRole } = useAuth()

  if (!hasRole(role)) {
    return (
      <Alert color="red" title="Nedostatečné oprávnění">
        Tahle stránka je jen pro roli <strong>{role}</strong>.
      </Alert>
    )
  }

  return <>{children}</>
}
