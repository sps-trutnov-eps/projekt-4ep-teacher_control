export interface TeacherSummary {
  id: number
  name: string
  photoUrl: string | null
  averageRating: number
}

export interface LegacyTeacher {
  id: string
  firstName: string
  lastName: string
  photoUrl: string | null
  description: string
  ratings: { overall: number; absence: number; bingo: number }
  awards: { id: string; name: string; description: string }[]
}

export interface LegacyTeacherProfile extends LegacyTeacher {
  reviewCount: number
}

export interface TeacherProfile extends TeacherSummary {
  description: string
  mood: number
  reviewCount: number
}

export interface Review {
  id: number
  title: string
  content: string
  rating: number
  teacherId: number
  studentId: string
}
