import type { components } from '@/shared/api'

/**
 * Tvary z API se neopisují ručně — mapují se ze schématu generovaného `pnpm gen:api`
 * (zdroj: docs/api/TeacherControl.Api.json, featura Abstence).
 */

type TeacherAbstenceDto = components['schemas']['TeacherAbstenceDto']

/** Backend serializuje čísla jako JSON number; ve schématu mají kvůli strict OpenAPI i string tvar. */
type AsNumber<T> = T extends string | number ? number : T

/** Učitel v seznamu / profilu (z backend DTO TeacherAbstenceDto). */
export interface Teacher {
  teacherId: AsNumber<TeacherAbstenceDto['teacherId']>
  name: TeacherAbstenceDto['name']
  photoUrl: TeacherAbstenceDto['photoUrl']
  rating: AsNumber<TeacherAbstenceDto['rating']>
  mood: AsNumber<TeacherAbstenceDto['mood']>
  lateArrivalMinutesToday: AsNumber<TeacherAbstenceDto['lateArrivalMinutesToday']>
}

export type MoodLevel = 'good' | 'neutral' | 'bad'

/** Tělo POST /api/abstence/{teacherId}/late-arrival. */
export type LateArrivalBody = components['schemas']['SubmitLateArrivalRequest']

/** Tělo POST /api/abstence/{teacherId}/mood — hodnota nálady 1–5. */
export type MoodBody = components['schemas']['SubmitMoodRequest']
