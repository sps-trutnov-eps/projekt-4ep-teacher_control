import { Select } from '@mantine/core'
import { useAuth } from './AuthContext'
import { useMockAuthControls } from './mockAuthControls'
import { MOCK_USERS } from './mockUsers'

const OPTIONS = MOCK_USERS.map((user) => ({
  value: user.id,
  label: `${user.displayName} (${user.roles.join(', ')})`,
}))

/**
 * Vývojářský přepínač uživatele. Zmizí, jakmile bude hotová featura F6 Login.
 */
export function DevUserSwitcher() {
  const { user } = useAuth()
  const switchUser = useMockAuthControls()

  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <Select
      size="xs"
      w={260}
      aria-label="Dev přepínač uživatele"
      placeholder="Nepřihlášen"
      data={OPTIONS}
      value={user?.id ?? null}
      onChange={(value) => switchUser(value ?? '')}
    />
  )
}
