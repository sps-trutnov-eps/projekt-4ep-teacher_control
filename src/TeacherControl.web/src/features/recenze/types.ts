import type { components } from '@/shared/api'

/**
 * Tvary z API se neopisují ručně — mapují se ze schématu generovaného `pnpm gen:api`
 * (zdroj: docs/api/TeacherControl.Api.json, featura Recenze, backend `/api/reviews`).
 */

type TeacherResponse = components['schemas']['ReviewsTeacherResponse']
type TeacherProfileResponse = components['schemas']['ReviewsTeacherProfileResponse']
type ReviewResponse = components['schemas']['ReviewsReviewResponse']

/** Backend serializuje čísla jako JSON number; ve schématu mají kvůli strict OpenAPI i string tvar. */
type AsNumber<T> = T extends string | number ? number : T

/** Textová recenze. Autor se do odpovědi neposílá, `isMine` značí vlastní recenzi. */
export interface Review {
  id: AsNumber<ReviewResponse['id']>
  teacherId: AsNumber<ReviewResponse['teacherId']>
  content: ReviewResponse['content']
  createdAt: ReviewResponse['createdAt']
  updatedAt: ReviewResponse['updatedAt']
  isMine: ReviewResponse['isMine']
}

/** Hlas pro učitele: 1 = like, -1 = dislike. */
export type ReactionValue = 1 | -1

/** Učitel v seznamu (GET /api/reviews/teachers). `averageRating` je null bez hodnocení. */
export interface ReviewTeacher {
  id: AsNumber<TeacherResponse['id']>
  name: TeacherResponse['name']
  photoUrl: TeacherResponse['photoUrl']
  description: TeacherResponse['description']
  averageRating: AsNumber<TeacherResponse['averageRating']>
  reviewCount: AsNumber<TeacherResponse['reviewCount']>
  likes: AsNumber<TeacherResponse['likes']>
  dislikes: AsNumber<TeacherResponse['dislikes']>
  /** Jak hlasoval přihlášený uživatel, null = nehlasoval. */
  myReaction: AsNumber<TeacherResponse['myReaction']>
}

/** Profil učitele včetně recenzí (GET /api/reviews/teachers/{teacherId}). */
export interface ReviewTeacherDetail extends ReviewTeacher {
  nickname: TeacherProfileResponse['nickname']
  reviews: Review[]
}

export type TeacherSort = 'reviews' | 'rating' | 'name'

/** Recenze řadí frontend, backend je vrací od nejnovější. */
export type ReviewSort = 'newest' | 'oldest'
