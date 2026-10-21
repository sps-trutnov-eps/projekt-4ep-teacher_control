import {
  AppShell,
  Avatar,
  Burger,
  Button,
  Group,
  Menu,
  NavLink,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Link, useLocation, useNavigate } from 'react-router'
import { RequireAuth, useAuth } from '@/shared/auth'
import { APP_ROUTES, AppRoutes } from './routes'

export function App() {
  const { user, isAuthenticated, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [navbarOpened, { toggle: toggleNavbar, close: closeNavbar }] = useDisclosure()

  const navRoutes = APP_ROUTES.filter((route) => 'label' in route && route.label)
  const isPublicRoute = pathname === '/login' || pathname === '/register'

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

          {isAuthenticated && user ? (
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs" wrap="nowrap">
                    <Avatar color="blue" radius="xl" size="sm">
                      {user.displayName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Text size="sm" fw={500} visibleFrom="sm">
                      {user.displayName}
                    </Text>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{user.displayName}</Menu.Label>
                <Menu.Item
                  color="red"
                  onClick={() => {
                    void logout()
                    navigate('/login')
                  }}
                >
                  Odhlásit se
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Group gap="sm" wrap="nowrap">
              <Button variant="subtle" component={Link} to="/login" size="sm">
                Přihlásit se
              </Button>
              <Button component={Link} to="/register" size="sm">
                Registrace
              </Button>
            </Group>
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        {navRoutes.map((route) => (
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
        {isPublicRoute ? (
          <AppRoutes />
        ) : (
          <RequireAuth>
            <AppRoutes />
          </RequireAuth>
        )}
      </AppShell.Main>
    </AppShell>
  )
}
