import { z } from 'zod'

export const REVIEW_TEXT_MIN = 10
/** Stejný limit jako na backendu (ReviewRequest.Content). */
export const REVIEW_TEXT_MAX = 5000

export const reviewFormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(REVIEW_TEXT_MIN, `Napiš aspoň ${REVIEW_TEXT_MIN} znaků.`)
    .max(REVIEW_TEXT_MAX, `Recenze má maximálně ${REVIEW_TEXT_MAX} znaků.`),
})

export type ReviewFormValues = z.infer<typeof reviewFormSchema>

export const reviewFormDefaults: ReviewFormValues = {
  content: '',
}
