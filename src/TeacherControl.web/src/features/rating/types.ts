export interface TeacherAward {
  id?: string
  name: string
  year?: string | null
  description?: string
}

/** Učitel v seznamu výběru pro hodnocení (/rating) */
export interface TeacherListItem {
  id: number
  name: string
  photoUrl?: string | null
  rating: number | null
}

/**
 * Detail/profil učitele pro hodnocení (/rating?teacher=id)
 *
 * Podporuje jak pole z aktuálního backendu (TeacherProfileResponse: Id, Name, PhotoUrl, Description, AverageRating),
 * tak specifikaci od Davida (full_name, image_url, bio, review, abstention, binginess, award, year).
 */
export interface TeacherProfile {
  id: number
  name: string
  fullName?: string
  full_name?: string
  photoUrl?: string | null
  imageUrl?: string | null
  image_url?: string | null
  description?: string
  bio?: string
  averageRating: number
  review?: number
  reviewCount?: number
  abstention?: number
  binginess?: number
  award?: string | null
  year?: string | null
  awards?: TeacherAward[]
}
