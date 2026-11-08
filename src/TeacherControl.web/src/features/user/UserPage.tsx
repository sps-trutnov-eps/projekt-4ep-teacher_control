import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { Link, useNavigate } from 'react-router'
import { useAuth, type Role } from '@/shared/auth'
import { PageHeader } from '@/shared/ui'

const ROLE_METADATA: Record<Role, { label: string; color: string }> = {
  student: { label: 'Student', color: 'blue' },
  teacher: { label: 'Učitel', color: 'teal' },
  admin: { label: 'Správce', color: 'grape' },
}

/**
 * Uživatelská stránka (profil uživatele).
 * Zobrazuje jméno, školní e-mail, role a další podrobnosti přihlášeného uživatele.
 */
export function UserPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated || !user) {
    return (
      <Stack gap="md" maw={640}>
        <PageHeader
          title="Uživatelský profil"
          description="Přehled informací o přihlášeném uživateli."
        />
        <Alert color="yellow" title="Nepřihlášený uživatel">
          Pro zobrazení profilu se musíte nejprve přihlásit do systému.
        </Alert>
        <Group>
          <Button component={Link} to="/login">
            Přejít na přihlášení
          </Button>
        </Group>
      </Stack>
    )
  }

  const displayEmail =
    user.email || `${user.displayName.trim().toLowerCase().replace(/\s+/g, '.')}@spstrutnov.cz`

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <Stack gap="lg" maw={720}>
      <PageHeader
        title="Uživatelský profil"
        description="Přehled vašeho účtu, kontaktního e-mailu a oprávnění v systému."
      />

      <Card withBorder shadow="sm" radius="md" p="xl">
        <Group gap="lg" align="center" wrap="nowrap">
          <Avatar
            color="blue"
            radius="xl"
            size={76}
            style={{ fontSize: '1.8rem', fontWeight: 600 }}
          >
            {user.displayName.charAt(0).toUpperCase()}
          </Avatar>

          <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
            <Group gap="xs" wrap="wrap">
              <Title order={3} style={{ wordBreak: 'break-word' }}>
                {user.displayName}
              </Title>
              <Badge color="green" variant="light" size="sm">
                Aktivní účet
              </Badge>
            </Group>

            <Text size="sm" c="dimmed" style={{ wordBreak: 'break-word' }}>
              {displayEmail}
            </Text>

            <Group gap={6} mt={4} wrap="wrap">
              {user.roles.map((role) => {
                const meta = ROLE_METADATA[role] ?? { label: role, color: 'gray' }
                return (
                  <Badge key={role} color={meta.color} variant="light" size="sm">
                    {meta.label}
                  </Badge>
                )
              })}
            </Group>
          </Stack>
        </Group>

        <Divider my="xl" />

        <Stack gap="md">
          <Title order={5}>Údaje o účtu</Title>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Paper withBorder p="md" radius="sm">
              <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                Celé jméno
              </Text>
              <Text size="sm" fw={500} mt={4}>
                {user.displayName}
              </Text>
            </Paper>

            <Paper withBorder p="md" radius="sm">
              <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                Školní e-mail
              </Text>
              <Text size="sm" fw={500} mt={4} style={{ wordBreak: 'break-word' }}>
                {displayEmail}
              </Text>
            </Paper>

            <Paper withBorder p="md" radius="sm">
              <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                Identifikátor uživatele
              </Text>
              <Text size="sm" fw={500} mt={4} c="dimmed">
                {user.id}
              </Text>
            </Paper>

            <Paper withBorder p="md" radius="sm">
              <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                Stav ověření
              </Text>
              <Box mt={4}>
                <Badge color="green" variant="outline" size="sm">
                  Ověřený školní e-mail
                </Badge>
              </Box>
            </Paper>
          </SimpleGrid>
        </Stack>

        <Divider my="xl" />

        <Group justify="space-between" wrap="wrap">
          <Button variant="default" component={Link} to="/">
            Zpět na přehled
          </Button>
          <Button color="red" variant="light" onClick={handleLogout}>
            Odhlásit se
          </Button>
        </Group>
      </Card>
    </Stack>
  )
}
