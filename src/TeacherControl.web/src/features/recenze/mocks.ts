import { HttpResponse, http } from 'msw'
import type { LegacyTeacher, Review } from './types'

const teachers: LegacyTeacher[] = [
  {
    id: 't-1',
    firstName: 'Jan',
    lastName: 'Novák',
    photoUrl: null,
    description: 'Informace o učiteli.',
    ratings: { overall: 4, absence: 5, bingo: 3 },
    awards: [],
  },
  {
    id: 't-2',
    firstName: 'Petr',
    lastName: 'Svoboda',
    photoUrl: null,
    description: 'Informace o učiteli.',
    ratings: { overall: 5, absence: 4, bingo: 5 },
    awards: [],
  },
  {
    id: 't-3',
    firstName: 'Marie',
    lastName: 'Dvořáková',
    photoUrl: null,
    description: 'Informace o učiteli.',
    ratings: { overall: 3, absence: 3, bingo: 2 },
    awards: [],
  },
]
const reviews: Review[] = [
  {
    id: 1,
    title: 'Férový učitel',
    content: 'Dobře vysvětluje látku.',
    rating: 4,
    teacherId: 1,
    studentId: 'student-1',
  },
]

export const recenzeHandlers = [
  http.get('*/api/teachers', () =>
    HttpResponse.json(
      teachers.map((teacher) => ({
        ...teacher,
        ratings: { ...teacher.ratings, overall: currentRating(teacher) },
      })),
    ),
  ),
  http.get('*/api/rating/teacher/:teacherId/profile', ({ params }) => {
    const teacher = teachers.find((item) => item.id === `t-${params.teacherId}`)
    if (!teacher) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      ...teacher,
      ratings: { ...teacher.ratings, overall: currentRating(teacher) },
      reviewCount: reviews.filter((review) => review.teacherId === Number(params.teacherId)).length,
    })
  }),
  http.get('*/api/rating/teacher/:teacherId', ({ params }) =>
    HttpResponse.json(reviews.filter((review) => review.teacherId === Number(params.teacherId))),
  ),
  http.post('*/api/rating', async ({ request }) => {
    const body = (await request.json()) as Omit<Review, 'id' | 'studentId'>
    const review: Review = { ...body, id: reviews.length + 1, studentId: 'student-1' }
    reviews.push(review)
    return HttpResponse.json(review, { status: 201 })
  }),
]

function currentRating(teacher: LegacyTeacher) {
  const teacherReviews = reviews.filter(
    (review) => review.teacherId === Number(teacher.id.replace('t-', '')),
  )
  return teacherReviews.length
    ? teacherReviews.reduce((sum, review) => sum + review.rating, 0) / teacherReviews.length
    : teacher.ratings.overall
}
