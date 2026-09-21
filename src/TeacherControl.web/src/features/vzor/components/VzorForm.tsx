import { Alert, Button, Stack, TextInput, Textarea } from '@mantine/core'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { notifications } from '@mantine/notifications'
import { useCreateVzorItem } from '../api'
import { vzorFormSchema, type VzorFormValues } from '../schema'

export function VzorForm() {
  const createItem = useCreateVzorItem()

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<VzorFormValues>({
    resolver: zodResolver(vzorFormSchema),
    defaultValues: { title: '', note: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    await createItem.mutateAsync(values)
    notifications.show({ message: 'Uloženo.' })
    reset()
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack gap="sm" maw={480}>
        <TextInput label="Název" error={errors.title?.message} {...register('title')} />

        <Textarea
          label="Poznámka"
          placeholder="Nepovinné"
          error={errors.note?.message}
          {...register('note')}
        />

        {createItem.isError ? (
          <Alert color="red" title="Chyba">
            Uložení se nepovedlo.
          </Alert>
        ) : null}

        <Button type="submit" loading={createItem.isPending} w="fit-content">
          Uložit
        </Button>
      </Stack>
    </form>
  )
}
