import { Alert, Button, Group, NumberInput, Stack } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { ApiError, formatRetryAfter, useSubmitLateArrival } from '../api'
import { DELAY_PRESETS, delayFormSchema, type DelayFormValues } from '../schema'

interface DelayFormProps {
  teacherId: number
}

/**
 * Zadávání zpoždění podle designu: tlačítka +1 až +20 se uloží hned po kliknutí,
 * přes "Custom" pole lze zadat vlastní počet minut. Poznámka už se neposílá — backend
 * ji neumí. Per učitel platí 30minutový cooldown (429 + Retry-After).
 */
export function DelayForm({ teacherId }: DelayFormProps) {
  const submitLateArrival = useSubmitLateArrival(teacherId)

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
    await submitLateArrival.mutateAsync({ minutes: values.minutes })
    notifications.show({ message: 'Zpoždění uloženo.' })
  })

  const quickSave = (minutes: number) => {
    setValue('minutes', minutes, { shouldValidate: true })
    submitLateArrival.mutate({ minutes })
  }

  const cooldownError =
    submitLateArrival.isError &&
    submitLateArrival.error instanceof ApiError &&
    submitLateArrival.error.status === 429
      ? `Zpoždění pro tohohle učitele jsi nedávno nahlašoval, zkus to znovu ${formatRetryAfter(submitLateArrival.error.retryAfterSeconds)}.`
      : null

  return (
    <Stack gap="sm">
      <Group gap="xs">
        {DELAY_PRESETS.map((preset) => (
          <Button
            key={preset}
            variant="default"
            disabled={submitLateArrival.isPending}
            onClick={() => quickSave(preset)}
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
                onChange={(value) => field.onChange(Number(value))}
                onBlur={field.onBlur}
                error={errors.minutes?.message}
              />
            )}
          />

          {cooldownError !== null ? (
            <Alert color="yellow" title="Chvíli počkej">
              {cooldownError}
            </Alert>
          ) : submitLateArrival.isError ? (
            <Alert color="red" title="Chyba">
              Zpoždění se nepodařilo uložit.
            </Alert>
          ) : null}

          <Button type="submit" loading={submitLateArrival.isPending}>
            Uložit zpoždění
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}
