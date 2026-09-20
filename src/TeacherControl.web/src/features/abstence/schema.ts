import { z } from 'zod'

/** Předdefinované hodnoty tlačítek pro rychlé zadání zpoždění. */
export const DELAY_PRESETS = [1, 2, 5, 10, 15, 20] as const

/** Validace formuláře pro zadání zpoždění. Veškerá validační logika patří sem. */
export const delayFormSchema = z.object({
  minutes: z
    .number({ message: 'Zadej zpoždění v minutách.' })
    .int('Zpoždění zadávej v celých minutách.')
    .min(1, 'Zpoždění musí být alespoň 1 minuta.')
    .max(240, 'Zpoždění nemůže být větší než 4 hodiny.'),
  note: z.string().max(200, 'Maximálně 200 znaků.').optional(),
})

export type DelayFormValues = z.infer<typeof delayFormSchema>
