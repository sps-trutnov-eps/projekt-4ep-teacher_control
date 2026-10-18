import { z } from 'zod'

export const reviewSchema = z.object({
  title: z.string().trim().min(1, 'Napište nadpis recenze.').max(100),
  content: z.string().trim().min(3, 'Recenze musí mít alespoň 3 znaky.').max(2000),
  rating: z.number().min(1).max(5),
})

export type ReviewFormValues = z.infer<typeof reviewSchema>
