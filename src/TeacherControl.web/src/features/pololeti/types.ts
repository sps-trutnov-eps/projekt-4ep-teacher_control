import type { components } from '@/shared/api'

/**
 * Tvary z API se neopisují ručně — mapují se ze schématu generovaného `pnpm gen:api`
 * (zdroj: docs/api/TeacherControl.Api.json, featura Pololeti).
 */

type PololetiTeacherDto = components['schemas']['PololetiTeacherDto']
type TeacherCardDto = components['schemas']['TeacherCardDto']
type TitleVotesDto = components['schemas']['TitleVotesDto']

/** Backend serializuje čísla jako JSON number; ve schématu mají kvůli strict OpenAPI i string tvar. */
type AsNumber<T> = T extends string | number ? number : T

/** Položka seznamu učitelů (z backend DTO PololetiTeacherDto). */
export interface PololetiTeacher {
  teacherId: AsNumber<PololetiTeacherDto['teacherId']>
  name: PololetiTeacherDto['name']
  photoUrl: PololetiTeacherDto['photoUrl']
}

/** Titul s počtem hlasů pro daného učitele (z backend DTO TitleVotesDto). */
export interface TitleVotes {
  teacherTitleId: AsNumber<TitleVotesDto['teacherTitleId']>
  title: TitleVotesDto['title']
  votes: AsNumber<TitleVotesDto['votes']>
  /** Učitel, kterému přihlášený uživatel o tento titul hlasuje. Null = ještě nehlasoval. */
  myVoteTeacherId: AsNumber<TitleVotesDto['myVoteTeacherId']>
}

/** Karta učitele včetně stavu hlasování v aktuálním pololetí (z backend DTO TeacherCardDto). */
export interface TeacherCard {
  teacherId: AsNumber<TeacherCardDto['teacherId']>
  name: TeacherCardDto['name']
  photoUrl: TeacherCardDto['photoUrl']
  description: TeacherCardDto['description']
  pololeti: AsNumber<TeacherCardDto['pololeti']>
  pololetiText: TeacherCardDto['pololetiText']
  titles: TitleVotes[]
}
