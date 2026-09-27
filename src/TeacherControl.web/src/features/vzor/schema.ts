import { z } from 'zod'

/** Validace formuláře. Veškerá validační logika patří sem, ne do komponenty. */
export const vzorFormSchema = z.object({
  title: z.string().min(2, 'Zadej název (aspoň 2 znaky).'),
  note: z.string().max(200, 'Maximálně 200 znaků.').optional(),
})

export type VzorFormValues = z.infer<typeof vzorFormSchema>
