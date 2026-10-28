import { AppShell, Burger, Group, NavLink, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Link, useLocation } from 'react-router'
import { DevUserSwitcher, RequireAuth, useAuth } from '@/shared/auth'
import { APP_ROUTES, AppRoutes } from './routes'

export function App() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [navbarOpened, { toggle: toggleNavbar, close: closeNavbar }] = useDisclosure()

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !navbarOpened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" miw={0}>
            <Burger
              opened={navbarOpened}
              onClick={toggleNavbar}
              hiddenFrom="sm"
              size="sm"
              aria-label="Menu"
            />
            <Title order={4} style={{ whiteSpace: 'nowrap' }}>
              Teacher Control
            </Title>
          </Group>
          <Group gap="sm" wrap="nowrap">
            <Text size="sm" visibleFrom="sm">
              {user?.displayName ?? 'Nepřihlášen'}
            </Text>
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
            onClick={closeNavbar}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <RequireAuth>
          <AppRoutes />
        </RequireAuth>
      </AppShell.Main>
    </AppShell>
  )
}
