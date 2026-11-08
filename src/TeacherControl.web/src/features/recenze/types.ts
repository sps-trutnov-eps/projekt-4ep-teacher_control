/** Local response shapes until the backend endpoints are present in OpenAPI. */
export interface ReviewTeacher {
  id: number
  name: string
  photoUrl: string | null
  description: string
  averageRating: number | null
  reviewCount: number
  likes: number
  dislikes: number
  myReaction: number | null
}

export interface ReviewTeacherDetail extends ReviewTeacher {
  nickname: string | null
  mood: number
  reviews: Review[]
}

export interface Review {
  id: number
  teacherId: number
  content: string
  createdAt: string
  updatedAt: string | null
  isMine: boolean
}

export interface TeacherReaction {
  likes: number
  dislikes: number
  myReaction: number | null
}

export type TeacherSort = 'reviews' | 'rating' | 'name'
