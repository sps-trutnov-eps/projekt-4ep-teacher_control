import { Alert, Button, Group, NumberInput, Stack, Textarea } from '@mantine/core'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { notifications } from '@mantine/notifications'
import { useCreateDelay } from '../api'
import { DELAY_PRESETS, delayFormSchema, type DelayFormValues } from '../schema'

interface DelayFormProps {
  teacherId: string
}

/**
 * Zadávání zpoždění podle designu: tlačítka +1 až +20 se uloží hned po kliknutí,
 * přes "Custom" lze zadat vlastní počet minut.
 */
export function DelayForm({ teacherId }: DelayFormProps) {
  const createDelay = useCreateDelay(teacherId)

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DelayFormValues>({
    resolver: zodResolver(delayFormSchema),
    defaultValues: { minutes: 5, note: '' },
  })

  const saveDelay = async (minutes: number, note?: string) => {
    await createDelay.mutateAsync({ minutes, note })
    notifications.show({ message: 'Zpoždění uloženo.' })
    reset({ minutes: 5, note: '' })
  }

  const onSubmit = handleSubmit(async (values) => {
    await saveDelay(values.minutes, values.note)
  })

  return (
    <Stack gap="sm">
      <Group gap="xs">
        {DELAY_PRESETS.map((preset) => (
          <Button
            key={preset}
            variant="default"
            disabled={createDelay.isPending}
            onClick={() => {
              setValue('minutes', preset, { shouldValidate: true })
              void saveDelay(preset)
            }}
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
                max={240}
                value={field.value}
                onChange={(value) => field.onChange(Number(value))}
                onBlur={field.onBlur}
                error={errors.minutes?.message}
              />
            )}
          />          <Textarea
          label="Poznámka"
          placeholder="Nepovinné"
          minRows={2}
          error={errors.note?.message}
          {...register('note')}
        />

          {createDelay.isError ? (
            <Alert color="red" title="Chyba">
              Zpoždění se nepodařilo uložit.
            </Alert>
          ) : null}

          <Button type="submit" loading={createDelay.isPending}>
            Uložit zpoždění
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}
