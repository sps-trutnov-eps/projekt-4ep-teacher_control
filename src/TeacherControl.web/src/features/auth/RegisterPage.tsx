import { Button, Card, Center, Stack, Text, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/shared/auth'
import { useConfirmCode, useRegister, useResendCode } from './api'
import { RegisterStepConfirmation } from './components/RegisterStepConfirmation'
import { RegisterStepCredentials } from './components/RegisterStepCredentials'
import type { ConfirmCodeFormValues, RegisterFormValues } from './schema'

export function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const registerMutation = useRegister()
  const confirmCodeMutation = useConfirmCode()
  const resendCodeMutation = useResendCode()

  // Pokud už je uživatel přihlášen, zobrazíme stav
  if (isAuthenticated) {
    return (
      <Center mih="60vh">
        <Card shadow="sm" padding="xl" radius="md" withBorder maw={420} w="100%">
          <Stack align="center" gap="md">
            <Title order={3}>Už jsi přihlášen</Title>
            <Text size="sm" c="dimmed" ta="center">
              Jsi již přihlášen do systému. Pro novou registraci se nejdříve odhlas.
            </Text>
            <Button variant="light" onClick={() => navigate('/')}>
              Přejít na hlavní stránku
            </Button>
          </Stack>
        </Card>
      </Center>
    )
  }

  const handleCredentialsSubmit = async (values: RegisterFormValues) => {
    setError(null)
    try {
      await registerMutation.mutateAsync({
        email: values.email,
        password: values.password,
      })

      setEmail(values.email)
      setStep(2)
      notifications.show({
        title: 'Kód odeslán',
        message: `Potvrzovací kód byl odeslán na adresu ${values.email}.`,
        color: 'blue',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registrace se nezdařila.'
      setError(message)
    }
  }

  const handleConfirmationSubmit = async (values: ConfirmCodeFormValues) => {
    setError(null)
    try {
      await confirmCodeMutation.mutateAsync({
        email,
        code: values.code,
      })

      notifications.show({
        title: 'Registrace dokončena',
        message: 'Tvůj účet byl úspěšně aktivován!',
        color: 'green',
      })

      // Po úspěšném ověření rovnou přihlásíme a přesměrujeme na hlavní stránku
      await login()
      navigate('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ověření kódu se nezdařilo.'
      setError(message)
    }
  }

  const handleResendCode = async () => {
    setError(null)
    try {
      await resendCodeMutation.mutateAsync({ email })
      notifications.show({
        title: 'Kód odeslán',
        message: 'Nový potvrzovací kód byl odeslán na tvůj e-mail.',
        color: 'blue',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nepodařilo se odeslat kód.'
      setError(message)
      throw err
    }
  }

  const handleBackToCredentials = () => {
    setError(null)
    setStep(1)
  }

  return (
    <Center mih="60vh">
      <Card shadow="sm" padding="xl" radius="md" withBorder maw={420} w="100%">
        {step === 1 ? (
          <RegisterStepCredentials
            initialEmail={email}
            onSubmit={handleCredentialsSubmit}
            loading={registerMutation.isPending}
            error={error}
          />
        ) : (
          <RegisterStepConfirmation
            email={email}
            onSubmit={handleConfirmationSubmit}
            onResend={handleResendCode}
            onBack={handleBackToCredentials}
            loading={confirmCodeMutation.isPending}
            resending={resendCodeMutation.isPending}
            error={error}
          />
        )}
      </Card>
    </Center>
  )
}
