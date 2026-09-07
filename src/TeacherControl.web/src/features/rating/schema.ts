import { z } from 'zod'

/** Validace formuláře. Veškerá validační logika patří sem, ne do komponenty. */
export const ratingFormSchema = z.object({
  subject: z.string().min(2, 'Zadej předmět (aspoň 2 znaky).'),
  score: z.number().int().min(1, 'Hodnocení je 1 až 5.').max(5, 'Hodnocení je 1 až 5.'),
  comment: z.string().max(500, 'Maximálně 500 znaků.').optional(),
})

export type RatingFormValues = z.infer<typeof ratingFormSchema>
