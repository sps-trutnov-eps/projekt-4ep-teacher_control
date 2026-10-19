import {
  Alert,
  Anchor,
  Button,
  Card,
  Center,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { zodResolver } from '@hookform/resolvers/zod'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/shared/auth'
import { useLoginMutation } from './api'
import { loginSchema, type LoginFormValues } from './schema'

/**
 * F6 Login – přihlašovací stránka.
 *
 * Podporuje přihlášení přes školní e-mail (@spstrutnov.cz) a heslo.
 */
export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const loginMutation = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setError(null)

    try {
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      })
      await login()
      notifications.show({
        title: 'Přihlášeno',
        message: 'Byl jsi úspěšně přihlášen do systému.',
        color: 'green',
      })
      navigate('/')
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Přihlášení se nezdařilo. Zkontroluj e-mail a heslo.'
      setError(message)
    }
  }

  if (isAuthenticated) {
    return (
      <Center mih="60vh">
        <Card shadow="sm" padding="xl" radius="md" withBorder maw={400} w="100%">
          <Stack align="center" gap="md">
            <Title order={3}>Už jsi přihlášen</Title>
            <Text size="sm" c="dimmed" ta="center">
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
            <Stack gap={4} align="center">
              <Title order={2} ta="center">
                Přihlášení
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                Přihlaš se pomocí školního e-mailu
              </Text>
            </Stack>

            <TextInput
              label="Školní e-mail"
              placeholder="jmeno.prijmeni@spstrutnov.cz"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <PasswordInput
              label="Heslo"
              placeholder="Zadej heslo"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {error ? (
              <Alert color="red" title="Chyba přihlášení">
                {error}
              </Alert>
            ) : null}

            <Button type="submit" fullWidth loading={loginMutation.isPending}>
              Přihlásit se
            </Button>

            <Text size="sm" ta="center">
              Nemáš účet?{' '}
              <Anchor component={Link} to="/register" fw={500}>
                Zaregistruj se
              </Anchor>
            </Text>
          </Stack>
        </form>
      </Card>
    </Center>
  )
}
