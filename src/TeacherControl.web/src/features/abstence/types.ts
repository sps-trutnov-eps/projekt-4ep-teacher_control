/**
 * Lokální typy featury. Tvary z API se neopisují ručně — pokud backend dodá OpenAPI schéma,
 * přibudou v `src/shared/api/generated` a tady se jen namapují.
 *
 * Zatím běžíme na MSW mocku, takže si tvary držíme tady a při připojení backendu se jen
 * vymění za `components['schemas'][...]`.
 */

export type MoodLevel = 'good' | 'neutral' | 'bad'

/** Učitel v seznamu / profilu. */
export interface Teacher {
  id: string
  firstName: string
  lastName: string
  /** Průměrné zpoždění v minutách, ze kterého se počítá nálada. */
  averageDelayMinutes: number
  /** Průměrné hodnocení 1–5, případná foto se zatím nenačítá. */
  rating: number
  photoUrl: string | null
}

/** Záznam o zpoždění učitele (jak pozdě po zvonění přišel). */
export interface DelayEntry {
  id: string
  teacherId: string
  teacherName: string
  minutes: number
  authorName: string
  createdAt: string
}

export interface TeacherFilters {
  name?: string
}
