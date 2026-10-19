import { z } from 'zod'

export const REVIEW_TEXT_MAX = 500
export const REVIEW_TITLE_MAX = 80

export const reviewFormSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'Vyber hodnocení 1–5 hvězdiček.')
    .max(5, 'Hodnocení je maximálně 5 hvězdiček.'),
  title: z.string().trim().max(REVIEW_TITLE_MAX, `Nadpis má maximálně ${REVIEW_TITLE_MAX} znaků.`),
  text: z
    .string()
    .trim()
    .min(10, 'Napiš aspoň 10 znaků.')
    .max(REVIEW_TEXT_MAX, `Recenze má maximálně ${REVIEW_TEXT_MAX} znaků.`),
  anonymous: z.boolean(),
  showClass: z.boolean(),
})

export type ReviewFormValues = z.infer<typeof reviewFormSchema>

export const reviewFormDefaults: ReviewFormValues = {
  rating: 0,
  title: '',
  text: '',
  anonymous: true,
  showClass: false,
}
