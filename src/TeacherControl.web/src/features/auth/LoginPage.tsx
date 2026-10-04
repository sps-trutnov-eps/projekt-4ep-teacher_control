import {
  Button,
  Card,
  Center,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useAuth } from '@/shared/auth'
import { useNavigate } from 'react-router'

const loginSchema = z.object({
  username: z.string().min(1, 'Uživatelské jméno je povinné'),
  password: z.string().min(1, 'Heslo je povinné'),
})

type LoginFormValues = z.infer<typeof loginSchema>

/**
 * F6 Login – přihlašovací stránka.
 *
 * Aktuálně volá `login()` z auth kontextu (mock).
 * Až bude napojení na Windows Active Directory, formulář odešle
 * credentials na API a provider se vymění – tato komponenta
 * zůstane stejná, změní se jen implementace `login()`.
 */
export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (_data: LoginFormValues) => {
    setError(null)
    setLoading(true)

    try {
      // TODO: Až bude AD napojení, předat _data.username a _data.password
      // do login() nebo na API endpoint.
      await login()
      navigate('/')
    } catch {
      setError('Přihlášení se nezdařilo. Zkontroluj uživatelské jméno a heslo.')
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated) {
    return (
      <Center mih="60vh">
        <Card shadow="sm" padding="xl" radius="md" withBorder maw={400} w="100%">
          <Stack align="center" gap="md">
            <Title order={3}>Už jsi přihlášen</Title>
            <Text size="sm" c="dimmed">
              Jsi již přihlášen do systému.
            </Text>
            <Button variant="light" onClick={() => navigate('/')}>
              Přejít na hlavní stránku
            </Button>
          </Stack>
        </Card>
      </Center>
    )
  }

  return (
    <Center mih="60vh">
      <Card shadow="sm" padding="xl" radius="md" withBorder maw={400} w="100%">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <Title order={2} ta="center">
              Přihlášení
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              Přihlaš se pomocí školního účtu
            </Text>

            <TextInput
              label="Uživatelské jméno"
              placeholder="jmeno.prijmeni"
              autoComplete="username"
              error={errors.username?.message}
              {...register('username')}
            />

            <PasswordInput
              label="Heslo"
              placeholder="Zadej heslo"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {error ? (
              <Text size="sm" c="red">
                {error}
              </Text>
            ) : null}

            <Button type="submit" fullWidth loading={loading}>
              Přihlásit se
            </Button>
          </Stack>
        </form>
      </Card>
    </Center>
  )
}
