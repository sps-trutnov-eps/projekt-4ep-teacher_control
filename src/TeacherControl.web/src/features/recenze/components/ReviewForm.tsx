import { Alert, Button, Stack, Text, Textarea } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { RecenzeApiError, useCreateReview, useReviewTeacher, useUpdateReview } from '../api'
import classes from '../Recenze.module.css'
import {
  REVIEW_TEXT_MAX,
  reviewFormDefaults,
  reviewFormSchema,
  type ReviewFormValues,
} from '../schema'
import { BRAND } from '../theme'
import type { Review } from '../types'
import { BackButton } from './TeacherDetail'

interface ReviewFormProps {
  teacherId: number
  /** Když je vyplněná, formulář recenzi upravuje, jinak vytváří novou. */
  review?: Review
  onBack: () => void
  onSubmitted: () => void
}

function errorMessage(error: Error | null) {
  if (!(error instanceof RecenzeApiError))
    return 'Recenzi se nepodařilo odeslat. Zkus to prosím znovu.'
  if (error.status === 409) return 'Tomuhle učiteli už jsi recenzi napsal(a). Uprav ji v profilu.'
  if (error.status === 403) return 'Cizí recenzi upravovat nemůžeš.'
  if (error.status === 401) return 'Pro psaní recenzí se musíš přihlásit.'
  return 'Recenzi se nepodařilo odeslat. Zkus to prosím znovu.'
}

export function ReviewForm({ teacherId, review, onBack, onSubmitted }: ReviewFormProps) {
  const { data: teacher } = useReviewTeacher(teacherId)
  const createReview = useCreateReview(teacherId)
  const updateReview = useUpdateReview()
  const mutation = review ? updateReview : createReview

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: review ? { content: review.content } : reviewFormDefaults,
  })

  const textLength = useWatch({ control, name: 'content' }).length

  const onSubmit = handleSubmit(async (values) => {
    if (review) {
      await updateReview.mutateAsync({ reviewId: review.id, values })
    } else {
      await createReview.mutateAsync(values)
    }
    notifications.show({
      color: BRAND.success,
      message: review ? 'Recenze byla upravena.' : 'Recenze byla odeslána. Díky!',
    })
    onSubmitted()
  })

  return (
    <Stack gap="md">
      <BackButton onClick={onBack} label="Zpět na profil učitele" />

      <div>
        <h2 className={classes.title}>{review ? 'Upravit recenzi' : 'Napsat recenzi'}</h2>
        {teacher ? <p className={classes.subtitle}>{teacher.name}</p> : null}
      </div>

      <form onSubmit={onSubmit} noValidate className={classes.panel}>
        <Stack gap="lg">
          <Stack gap={6}>
            <Textarea
              label="Vaše recenze"
              description="Recenze je anonymní, ostatní studenti tvoje jméno neuvidí."
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

          {mutation.isError ? (
            <Alert color="red" title="Chyba">
              {errorMessage(mutation.error)}
            </Alert>
          ) : null}

          <Button
            type="submit"
            color={BRAND.primary}
            size="lg"
            radius="md"
            fullWidth
            loading={mutation.isPending}
          >
            {review ? 'Uložit změny' : 'Odeslat recenzi'}
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}
