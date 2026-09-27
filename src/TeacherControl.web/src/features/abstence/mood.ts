import type { MoodLevel } from './types'

/**
 * Nálada učitele se počítá z průměrného zpoždění:
 * - do 2 minut → good (zelená)
 * - do 10 minut → neutral (žlutá)
 * - nad 10 minut → bad (červená)
 */
export const MOOD_THRESHOLDS = {
  goodMaxMinutes: 2,
  neutralMaxMinutes: 10,
} as const

export function getMoodLevel(averageDelayMinutes: number): MoodLevel {
  if (averageDelayMinutes <= MOOD_THRESHOLDS.goodMaxMinutes) {
    return 'good'
  }

  if (averageDelayMinutes <= MOOD_THRESHOLDS.neutralMaxMinutes) {
    return 'neutral'
  }

  return 'bad'
}

/** Barva nálady pro Mantine komponenty. */
export const MOOD_COLORS: Record<MoodLevel, string> = {
  good: 'green',
  neutral: 'yellow',
  bad: 'red',
}

/** Popis nálady pro uživatele (česky, do aria-labelů i tooltipů). */
export const MOOD_LABELS: Record<MoodLevel, string> = {
  good: 'Dobrá nálada',
  neutral: 'Průměrná nálada',
  bad: 'Špatná nálada',
}
