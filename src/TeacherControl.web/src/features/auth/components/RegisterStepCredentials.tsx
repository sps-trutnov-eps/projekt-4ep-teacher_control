import {
  Alert,
  Anchor,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { registerSchema, type RegisterFormValues } from '../schema'

interface RegisterStepCredentialsProps {
  initialEmail?: string
  onSubmit: (values: RegisterFormValues) => Promise<void>
  loading?: boolean
  error?: string | null
}

export function RegisterStepCredentials({
  initialEmail = '',
  onSubmit,
  loading = false,
  error = null,
}: RegisterStepCredentialsProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: initialEmail,
      password: '',
      confirmPassword: '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        <Stack gap={4} align="center">
          <Title order={2}>Registrace</Title>
          <Text size="sm" c="dimmed">
            Krok 1 ze 2: Zadej své školní údaje
          </Text>
        </Stack>

        <TextInput
          label="Školní e-mail"
          placeholder="jmeno.prijmeni@spstrutnov.cz"
          description="Povoleny jsou pouze účty s doménou @spstrutnov.cz"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordInput
          label="Heslo"
          placeholder="Alespoň 8 znaků"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <PasswordInput
          label="Potvrzení hesla"
          placeholder="Zadej heslo znovu"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {error ? (
          <Alert color="red" title="Chyba registrace">
            {error}
          </Alert>
        ) : null}

        <Button type="submit" fullWidth loading={loading}>
          Pokračovat na potvrzení
        </Button>

        <Text size="sm" ta="center">
          Už máš účet?{' '}
          <Anchor component={Link} to="/login" fw={500}>
            Přihlas se
          </Anchor>
        </Text>
      </Stack>
    </form>
  )
}
