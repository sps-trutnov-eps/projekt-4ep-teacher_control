import { Alert, Button, Select, Stack, Textarea, Text } from '@mantine/core'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useState } from 'react'
import { useCreateTeacherQuote } from './api'
import { teacherQuoteFormSchema, type TeacherQuoteFormValues } from './schema'

interface TeacherOption {
  id: string
  name: string
}

export function TeacherQuoteForm({ teachers }: { teachers: TeacherOption[] }) {
  const createQuote = useCreateTeacherQuote()
  const [submitted, setSubmitted] = useState(false)
  const {
    control,
    handleSubmit,
    register,
    reset,
    setError,
    formState: { errors },
  } = useForm<TeacherQuoteFormValues>({
    resolver: zodResolver(teacherQuoteFormSchema),
    defaultValues: { teacherId: '', quote: '' },
  })

  const onSubmit = handleSubmit((values) => {
    const teacher = teachers.find((item) => item.id === values.teacherId)
    if (!teacher) {
      setError('teacherId', { type: 'validate', message: 'Vybraný učitel není dostupný.' })
      return
    }

    setSubmitted(false)
    createQuote.mutate(
      { teacherId: teacher.id, teacherName: teacher.name, quote: values.quote },
      {
        onSuccess: () => {
          reset()
          setSubmitted(true)
        },
      },
    )
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack gap="sm">
        <Text fw={600}>Přidat hlášku učitele</Text>
        <Controller
          control={control}
          name="teacherId"
          render={({ field }) => (
            <Select
              label="Učitel"
              placeholder="Vyberte učitele"
              data={teachers.map((teacher) => ({ value: teacher.id, label: teacher.name }))}
              value={field.value || null}
              onChange={(value) => field.onChange(value ?? '')}
              onBlur={field.onBlur}
              error={errors.teacherId?.message}
              searchable
              nothingFoundMessage="Žádný učitel nenalezen."
              disabled={teachers.length === 0}
            />
          )}
        />
        <Textarea
          label="Hláška"
          placeholder="Co učitel řekl?"
          maxLength={300}
          minRows={2}
          error={errors.quote?.message}
          {...register('quote')}
        />
        {createQuote.isError ? (
          <Alert color="red" title="Hlášku se nepodařilo odeslat">
            Zkuste to prosím znovu.
          </Alert>
        ) : null}
        {submitted ? (
          <Text size="sm" c="teal" role="status">
            Hláška byla odeslána.
          </Text>
        ) : null}
        <Button
          type="submit"
          loading={createQuote.isPending}
          disabled={teachers.length === 0}
          w="fit-content"
        >
          Odeslat hlášku
        </Button>
      </Stack>
    </form>
  )
}
