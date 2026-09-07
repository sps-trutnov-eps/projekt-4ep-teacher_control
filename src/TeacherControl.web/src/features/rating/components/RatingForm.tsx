import { Alert, Button, Group, NumberInput, Stack, TextInput, Textarea } from '@mantine/core'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { notifications } from '@mantine/notifications'
import { useCreateRating } from '../api'
import { ratingFormSchema, type RatingFormValues } from '../schema'

export function RatingForm() {
  const createRating = useCreateRating()

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<RatingFormValues>({
    resolver: zodResolver(ratingFormSchema),
    defaultValues: { subject: '', score: 3, comment: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    await createRating.mutateAsync(values)
    notifications.show({ message: 'Hodnocení uloženo.' })
    reset()
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack gap="sm" maw={480}>
        <TextInput
          label="Předmět"
          placeholder="Matematika"
          error={errors.subject?.message}
          {...register('subject')}
        />

        <Controller
          control={control}
          name="score"
          render={({ field }) => (
            <NumberInput
              label="Hodnocení (1-5)"
              min={1}
              max={5}
              value={field.value}
              onChange={(value) => field.onChange(Number(value))}
              onBlur={field.onBlur}
              error={errors.score?.message}
            />
          )}
        />

        <Textarea
          label="Komentář"
          placeholder="Nepovinné"
          autosize
          minRows={2}
          error={errors.comment?.message}
          {...register('comment')}
        />

        {createRating.isError ? (
          <Alert color="red" title="Chyba">
            Hodnocení se nepodařilo uložit.
          </Alert>
        ) : null}

        <Group>
          <Button type="submit" loading={createRating.isPending}>
            Uložit hodnocení
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
