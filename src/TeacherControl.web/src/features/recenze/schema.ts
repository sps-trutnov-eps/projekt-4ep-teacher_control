import { z } from 'zod'

export const REVIEW_TEXT_MAX = 500

export const reviewFormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Napiš text recenze.')
    .max(REVIEW_TEXT_MAX, `Recenze má maximálně ${REVIEW_TEXT_MAX} znaků.`),
})

export type ReviewFormValues = z.infer<typeof reviewFormSchema>

export const reviewFormDefaults: ReviewFormValues = {
  content: '',
}
