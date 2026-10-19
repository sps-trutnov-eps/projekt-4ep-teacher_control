import { Alert, Button, Checkbox, Rating, Stack, Text, TextInput, Textarea } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
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
  teacherId: string
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

  const textLength = useWatch({ control, name: 'text' }).length

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
        {teacher ? (
          <p className={classes.subtitle}>
            {formatTeacherName(teacher)} – {teacher.subject}
          </p>
        ) : null}
      </div>

      <form onSubmit={onSubmit} noValidate className={classes.panel}>
        <Stack gap="lg">
          <Controller
            control={control}
            name="rating"
            render={({ field }) => (
              <div role="group" aria-labelledby="recenze-rating-label">
                <Text id="recenze-rating-label" className={classes.formLabel}>
                  Vaše hodnocení
                </Text>
                <Rating
                  value={field.value}
                  onChange={field.onChange}
                  size="xl"
                  color={BRAND.star}
                  classNames={{ starSymbol: classes.star }}
                  aria-label="Počet hvězdiček"
                />
                {errors.rating ? (
                  <Text c="red" size="sm" mt={6}>
                    {errors.rating.message}
                  </Text>
                ) : null}
              </div>
            )}
          />

          <TextInput
            label="Nadpis recenze (nepovinné)"
            placeholder="Např. Skvělý výklad, ale…"
            size="md"
            classNames={{ input: classes.formInput, label: classes.formLabel }}
            error={errors.title?.message}
            {...register('title')}
          />

          <Stack gap={6}>
            <Textarea
              label="Vaše recenze"
              placeholder="Napište svůj názor na učitele…"
              size="md"
              autosize
              minRows={5}
              maxRows={12}
              classNames={{ input: classes.formInput, label: classes.formLabel }}
              error={errors.text?.message}
              {...register('text')}
            />
            <Text
              className={classes.counter}
              data-over={textLength > REVIEW_TEXT_MAX || undefined}
              aria-live="polite"
            >
              {textLength}/{REVIEW_TEXT_MAX}
            </Text>
          </Stack>

          <Stack gap="sm">
            <Checkbox
              label="Zůstat v anonymitě"
              color={BRAND.primary}
              size="md"
              {...register('anonymous')}
            />
            <Checkbox
              label="Zobrazit třídu (např. 2.EP)"
              color={BRAND.primary}
              size="md"
              {...register('showClass')}
            />
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
