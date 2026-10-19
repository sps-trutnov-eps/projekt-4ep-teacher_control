import { AppShell, Avatar, Button, Group, Menu, NavLink, Text, Title, UnstyledButton } from '@mantine/core'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/shared/auth'
import { APP_ROUTES, AppRoutes } from './routes'

export function App() {
  const { user, isAuthenticated, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const navRoutes = APP_ROUTES.filter((route) => 'label' in route && route.label)

  return (
    <AppShell header={{ height: 56 }} navbar={{ width: 220, breakpoint: 'xs' }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title order={4}>Teacher Control</Title>

          {isAuthenticated && user ? (
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Avatar color="blue" radius="xl" size="sm">
                      {user.displayName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Text size="sm" fw={500}>
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
            <Group gap="sm">
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
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <AppRoutes />
      </AppShell.Main>
    </AppShell>
  )
}
