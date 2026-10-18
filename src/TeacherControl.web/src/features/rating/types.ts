export interface TeacherAward {
  award: string
  year?: string | null
}

/** Učitel v seznamu výběru pro hodnocení (/rating) */
export interface TeacherListItem {
  id: number
  full_name: string
  image_url: string | null
  review: number | null
}

/**
 * Detail/profil učitele pro hodnocení (/rating?teacher=id).
 * Přesně odpovídá struktuře TeacherProfileResponse:
 * full_name, image_url, bio, review, abstention, binginess, awards.
 */
export interface TeacherProfile {
  id: number
  full_name: string
  image_url: string | null
  bio: string
  review: number
  abstention: number
  binginess: number
  awards: TeacherAward[]
}
