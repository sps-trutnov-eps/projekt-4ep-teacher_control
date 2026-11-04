import { useState } from 'react'
import { Alert, Button, Group, NumberInput, Stack } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { ApiError, formatRetryAfter, useSubmitLateArrival, useSubmitMood } from '../api'
import { DELAY_PRESETS, delayFormSchema, type DelayFormValues } from '../schema'

interface DelayFormProps {
  teacherId: number
  /** Úroveň nálady, která se má uložit (null = nálada se neměnila). */
  mood: number | null
}

/**
 * Zadávání zpoždění podle designu: tlačítka +1 až +20 jen vyplní pole, vlastní počet minut
 * se zadává přes číslicové pole. Obojí — zpoždění i nálada vybraná v metru — se odesílá až
 * tlačítkem "Uložit", aby se stihla validace Zod a uživatel mohl chybu opravit.
 *
 * Backend má sdílený 30minutový cooldown per učitel (429 + Retry-After) pro zpoždění i náladu,
 * proto se posílá jen to, co se reálně změnilo — jinak by druhé volání vždy skončilo 429.
 */
export function DelayForm({ teacherId, mood }: DelayFormProps) {
  const submitLateArrival = useSubmitLateArrival(teacherId)
  const submitMood = useSubmitMood(teacherId)
  // Zpoždění se posílá, jen když uživatel sáhnul na preset nebo na pole — jinak by "Uložit"
  // poslalo nechtěně výchozích 5 minut a zbytečně spustil cooldown.
  const [delayTouched, setDelayTouched] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DelayFormValues>({
    resolver: zodResolver(delayFormSchema),
    defaultValues: { minutes: 5 },
  })

  const onSubmit = handleSubmit(async (values) => {
    const saveMood = mood !== null

    if (!delayTouched && !saveMood) {
      notifications.show({
        color: 'blue',
        message: 'Nic se nezměnilo — uprav zpoždění nebo náladu.',
      })
      return
    }

    setIsSaving(true)

    try {
      let delaySaved = false
      let moodSaved = false

      if (delayTouched) {
        try {
          await submitLateArrival.mutateAsync({ minutes: values.minutes })
        } catch {
          return // chybu hlásí Alert níže
        }

        setDelayTouched(false)
        delaySaved = true
      }

      if (mood !== null) {
        try {
          await submitMood.mutateAsync({ value: mood })
        } catch {
          // Zpoždění už je uložené — nálada musí počkat, až uběhne cooldown.
          if (delaySaved) {
            notifications.show({
              color: 'yellow',
              message: 'Zpoždění se uložilo, nálada musí počkat, až uběhne cooldown.',
            })
          }
          return // chybu hlásí Alert níže
        }

        moodSaved = true
      }

      notifications.show({
        message:
          delaySaved && moodSaved
            ? 'Zpoždění i nálada uloženy.'
            : moodSaved
              ? 'Nálada uložena.'
              : 'Zpoždění uloženo.',
      })
    } finally {
      setIsSaving(false)
    }
  })

  const quickPick = (minutes: number) => {
    setValue('minutes', minutes, { shouldValidate: true })
    setDelayTouched(true)
  }

  return (
    <Stack gap="sm">
      <Group gap="xs">
        {DELAY_PRESETS.map((preset) => (
          <Button
            key={preset}
            variant="default"
            disabled={isSaving}
            onClick={() => quickPick(preset)}
          >
            +{preset}
          </Button>
        ))}
      </Group>

      <form onSubmit={onSubmit}>
        <Stack gap="sm">
          <Controller
            control={control}
            name="minutes"
            render={({ field }) => (
              <NumberInput
                label="Vlastní zpoždění (minuty)"
                placeholder="Např. 7"
                min={1}
                max={300}
                value={field.value}
                onChange={(value) => {
                  field.onChange(Number(value))
                  setDelayTouched(true)
                }}
                onBlur={field.onBlur}
                error={errors.minutes?.message}
              />
            )}
          />

          <SubmitError
            isError={submitLateArrival.isError}
            error={submitLateArrival.error}
            failed="Zpoždění se nepodařilo uložit."
            cooldown={(retryAfter) =>
              `Zpoždění pro tohohle učitele jsi nedávno nahlašoval, zkus to znovu ${retryAfter}.`
            }
          />

          <SubmitError
            isError={submitMood.isError}
            error={submitMood.error}
            failed="Náladu se nepodařilo uložit."
            cooldown={(retryAfter) =>
              `Náladu tohohle učitele jsi nedávno měnil, zkus to znovu ${retryAfter}.`
            }
          />

          <Button type="submit" loading={isSaving}>
            Uložit
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}

/** Chyba zápisu: žlutá nápověda u cooldownu (429 + Retry-After), červená u ostatních chyb. */
function SubmitError({
  isError,
  error,
  failed,
  cooldown,
}: {
  isError: boolean
  error: unknown
  failed: string
  cooldown: (retryAfter: string) => string
}) {
  if (!isError) {
    return null
  }

  if (error instanceof ApiError && error.status === 429) {
    return (
      <Alert color="yellow" title="Chvíli počkej">
        {cooldown(formatRetryAfter(error.retryAfterSeconds))}
      </Alert>
    )
  }

  return (
    <Alert color="red" title="Chyba">
      {failed}
    </Alert>
  )
}
