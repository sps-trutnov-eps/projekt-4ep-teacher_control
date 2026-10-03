import { z } from 'zod'

/** Předdefinované hodnoty tlačítek pro rychlé zadání zpoždění. */
export const DELAY_PRESETS = [1, 2, 5, 10, 15, 20] as const

/**
 * Validace formuláře pro zadání zpoždění. Veškerá validační logika patří sem.
 * Pozn.: backend nebere záporné ani nulové minuty (viz SubmitLateArrivalRequest).
 */
export const delayFormSchema = z.object({
  minutes: z
    .number({ message: 'Zadej zpoždění v minutách.' })
    .int('Zpoždění zadávej v celých minutách.')
    .min(1, 'Zpoždění musí být alespoň 1 minuta.')
    .max(300, 'Zpoždění nemůže být větší než 5 hodin.'),
})

export type DelayFormValues = z.infer<typeof delayFormSchema>
