import {
  Alert,
  Anchor,
  Button,
  Center,
  Group,
  PinInput,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { confirmCodeSchema, type ConfirmCodeFormValues } from '../schema'

interface RegisterStepConfirmationProps {
  email: string
  onSubmit: (values: ConfirmCodeFormValues) => Promise<void>
  onResend: () => Promise<void>
  onBack: () => void
  loading?: boolean
  resending?: boolean
  error?: string | null
}

const INITIAL_COOLDOWN_SECONDS = 30

export function RegisterStepConfirmation({
  email,
  onSubmit,
  onResend,
  onBack,
  loading = false,
  resending = false,
  error = null,
}: RegisterStepConfirmationProps) {
  const [countdown, setCountdown] = useState(INITIAL_COOLDOWN_SECONDS)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmCodeFormValues>({
    resolver: zodResolver(confirmCodeSchema),
    defaultValues: {
      code: '',
    },
  })

  // Odpočet pro znovuzaslání potvrzovacího kódu (30 sekund)
  useEffect(() => {
    if (countdown <= 0) {
      return
    }

    const timer = window.setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [countdown])

  const handleResendClick = async () => {
    if (countdown > 0 || resending) {
      return
    }
    await onResend()
    setCountdown(INITIAL_COOLDOWN_SECONDS)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="md">
        <Stack gap={4} align="center">
          <Title order={2}>Ověření e-mailu</Title>
          <Text size="sm" c="dimmed">
            Krok 2 ze 2: Zadej potvrzovací kód
          </Text>
        </Stack>

        <Stack gap={2} align="center">
          <Text size="sm" c="dimmed">
            Kód jsme odeslali na adresu:
          </Text>
          <Text size="sm" fw={600} ta="center">
            {email}
          </Text>
          <Anchor component="button" type="button" size="xs" onClick={onBack}>
            Změnit e-mail
          </Anchor>
        </Stack>

        <Stack gap="xs" align="center">
          <Text size="sm" fw={500}>
            Potvrzovací kód (6 číslic)
          </Text>
          <Controller
            control={control}
            name="code"
            render={({ field }) => (
              <Center>
                <PinInput
                  length={6}
                  type="number"
                  placeholder="○"
                  value={field.value}
                  onChange={field.onChange}
                  error={Boolean(errors.code)}
                  autoFocus
                />
              </Center>
            )}
          />
          {errors.code ? (
            <Text size="xs" c="red">
              {errors.code.message}
            </Text>
          ) : null}
        </Stack>

        {error ? (
          <Alert color="red" title="Chyba ověření">
            {error}
          </Alert>
        ) : null}

        <Button type="submit" fullWidth loading={loading}>
          Potvrdit a dokončit registraci
        </Button>

        <Group justify="center">
          <Button
            variant="subtle"
            size="sm"
            onClick={handleResendClick}
            disabled={countdown > 0 || resending}
            loading={resending}
          >
            {countdown > 0 ? `Znovu odeslat kód za ${countdown} s` : 'Znovu odeslat kód'}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
