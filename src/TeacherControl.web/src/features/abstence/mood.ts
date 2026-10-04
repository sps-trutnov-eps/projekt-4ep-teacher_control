import type { MoodLevel } from './types'

/**
 * Nálada je číslo 1–5 z backendu. Pro zobrazení se mapuje na tři úrovně:
 * 1–2 → good (zelená), 3 → neutral (žlutá), 4–5 → bad (červená).
 */
export const MOOD_THRESHOLDS = {
  goodMax: 2,
  neutralMax: 3,
} as const

export function getMoodLevel(mood: number): MoodLevel {
  if (mood <= MOOD_THRESHOLDS.goodMax) {
    return 'good'
  }

  if (mood <= MOOD_THRESHOLDS.neutralMax) {
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
