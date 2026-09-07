import { AppShell, Group, NavLink, Text, Title } from '@mantine/core'
import { Link, useLocation } from 'react-router'
import { DevUserSwitcher, useAuth } from '@/shared/auth'
import { APP_ROUTES, AppRoutes } from './routes'

export function App() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  return (
    <AppShell header={{ height: 56 }} navbar={{ width: 220, breakpoint: 'xs' }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title order={4}>Teacher Control</Title>
          <Group gap="sm">
            <Text size="sm">{user?.displayName ?? 'Nepřihlášen'}</Text>
            <DevUserSwitcher />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        {APP_ROUTES.map((route) => (
          <NavLink
            key={route.path}
            component={Link}
            to={route.path}
            label={route.label}
            active={pathname === route.path}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <AppRoutes />
      </AppShell.Main>
    </AppShell>
  )
}
