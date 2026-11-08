import { Alert, Button, Stack, Text, Textarea } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useCreateReview, useReviewTeacher } from '../api'
import classes from '../Recenze.module.css'
import { formatTeacherName } from '../format'
import {
  REVIEW_TEXT_MAX,
  reviewFormDefaults,
  reviewFormSchema,
  type ReviewFormValues,
} from '../schema'
import { BRAND } from '../theme'
import { BackButton } from './TeacherDetail'

interface ReviewFormProps {
  teacherId: number
  onBack: () => void
  onSubmitted: () => void
}

export function ReviewForm({ teacherId, onBack, onSubmitted }: ReviewFormProps) {
  const { data: teacher } = useReviewTeacher(teacherId)
  const createReview = useCreateReview(teacherId)

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: reviewFormDefaults,
  })

  const textLength = useWatch({ control, name: 'content' }).length

  const onSubmit = handleSubmit(async (values) => {
    await createReview.mutateAsync(values)
    notifications.show({ color: BRAND.success, message: 'Recenze byla odeslána. Díky!' })
    onSubmitted()
  })

  return (
    <Stack gap="md">
      <BackButton onClick={onBack} label="Zpět na profil učitele" />

      <div>
        <h2 className={classes.title}>Napsat recenzi</h2>
        {teacher ? <p className={classes.subtitle}>{formatTeacherName(teacher)}</p> : null}
      </div>

      <form onSubmit={onSubmit} noValidate className={classes.panel}>
        <Stack gap="lg">
          <Stack gap={6}>
            <Textarea
              label="Text recenze"
              placeholder="Napište svůj názor na učitele…"
              size="md"
              autosize
              minRows={5}
              maxRows={12}
              classNames={{ input: classes.formInput, label: classes.formLabel }}
              error={errors.content?.message}
              {...register('content')}
            />
            <Text
              className={classes.counter}
              data-over={textLength > REVIEW_TEXT_MAX || undefined}
              aria-live="polite"
            >
              {textLength}/{REVIEW_TEXT_MAX}
            </Text>
          </Stack>

          {createReview.isError ? (
            <Alert color="red" title="Chyba">
              Recenzi se nepodařilo odeslat. Zkus to prosím znovu.
            </Alert>
          ) : null}

          <Button
            type="submit"
            color={BRAND.primary}
            size="lg"
            radius="md"
            fullWidth
            loading={createReview.isPending}
          >
            Odeslat recenzi
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}
