import type { components } from '@/shared/api'

/**
 * Typy featury. Tvary, které chodí z API, se neopisují ručně, berou se z generovaného schématu.
 * Sem patří jen to, co si featura drží sama (filtry, view modely).
 */
export type Rating = components['schemas']['Rating']

export interface RatingFilters {
  subject?: string
}
