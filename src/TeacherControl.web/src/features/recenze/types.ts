/**
 * Dokud endpointy recenzí nejsou v OpenAPI, popisuje si featura tvar odpovědí sama.
 * Až tam budou, tenhle soubor zmizí a typy se vezmou z `components['schemas']['…']`.
 */

/** Řádek v seznamu učitelů (GET /recenze/teachers). */
export interface ReviewTeacher {
  id: string
  /** Titul před jménem, např. „Mgr.“. */
  degree: string | null
  firstName: string
  lastName: string
  subject: string
  photoUrl: string | null
  /** Průměr 1–5, null když učitel ještě nemá žádnou recenzi. */
  averageRating: number | null
  reviewCount: number
}

export interface ReviewCategory {
  key: string
  label: string
  /** Průměr 1–5. */
  value: number
}

/** Detail učitele (GET /recenze/teachers/{id}). */
export interface ReviewTeacherDetail extends ReviewTeacher {
  classes: string[]
  school: string
  categories: ReviewCategory[]
}

export type ReviewVote = 'like' | 'dislike'

/** Recenze (GET /recenze/teachers/{id}/reviews). */
export interface Review {
  id: string
  teacherId: string
  /** null = anonymní recenze. */
  authorName: string | null
  /** null = autor třídu nezveřejnil. */
  className: string | null
  rating: number
  title: string | null
  text: string
  createdAt: string
  likes: number
  dislikes: number
  /** Jak hlasoval přihlášený uživatel, null = nehlasoval. */
  myVote: ReviewVote | null
}

export type TeacherSort = 'reviews' | 'rating' | 'name'

export type ReviewSort = 'newest' | 'oldest' | 'best' | 'helpful'
