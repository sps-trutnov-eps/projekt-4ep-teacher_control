export interface TeacherAward {
  id: string
  name: string
  description: string
}

export interface TeacherRating {
  overall: number
  absence: number
  bingo: number
}

export interface Teacher {
  id: string
  firstName: string
  lastName: string
  photoUrl: string | null
  description: string
  ratings: TeacherRating
  awards: TeacherAward[]
}
