import { z } from 'zod'

export const teacherQuoteFormSchema = z.object({
  teacherId: z.string().min(1, 'Vyberte učitele.'),
  quote: z.string().trim().min(1, 'Zadejte hlášku.').max(300, 'Hláška může mít nejvýše 300 znaků.'),
})

export type TeacherQuoteFormValues = z.infer<typeof teacherQuoteFormSchema>
