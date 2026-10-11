export interface TeacherAward {
  id?: string
  name: string
  year?: string | null
  description?: string
}

export interface TeacherRating {
  overall: number
  absence: number
  bingo: number
}

/**
 * Profil učitele podle specifikace v zadání a Davidových dodatcích:
 * Backend dodá:
 * - full_name (TeacherEntity.Name -> full_name)
 * - image_url (TeacherEntity.PhotoUrl -> image_url)
 * - bio (TeacherEntity.Description -> bio)
 * - review (TeacherEntity.Reviews.Rating.Average -> review)
 * - abstention (vypočtená hodnota -> abstention)
 * - binginess (vypočtená hodnota -> binginess)
 * - award & year (TitleVoteEntity -> award, Teacher.Pololeti -> year)
 */
export interface TeacherProfile {
  id: number | string
  fullName: string
  full_name?: string
  imageUrl?: string | null
  image_url?: string | null
  photoUrl?: string | null
  bio: string
  description?: string
  review: number
  averageRating?: number
  abstention: number
  absence?: number
  binginess: number
  bingo?: number
  award?: string | null
  year?: string | null
  awards?: TeacherAward[]
  ratings?: TeacherRating
}

export type Teacher = TeacherProfile

export interface TeacherListItem {
  id: number | string
  fullName: string
  photoUrl?: string | null
  rating: number
}
