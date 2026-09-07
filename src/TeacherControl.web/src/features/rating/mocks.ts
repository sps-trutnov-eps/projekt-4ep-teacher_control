import { HttpResponse, http } from 'msw'
import type { Rating } from './types'

let ratings: Rating[] = [
  {
    id: 'r-1',
    subject: 'Matematika',
    score: 4,
    comment: 'Dobře vysvětlené příklady.',
    authorName: 'Student Novák',
    createdAt: '2026-09-01T10:15:00.000Z',
  },
  {
    id: 'r-2',
    subject: 'Programování',
    score: 5,
    comment: null,
    authorName: 'Student Veselá',
    createdAt: '2026-09-03T08:40:00.000Z',
  },
]

/** MSW handlery featury. Přidávej sem endpointy, které backend ještě nemá hotové. */
export const ratingHandlers = [
  http.get('/api/ratings', ({ request }) => {
    const subject = new URL(request.url).searchParams.get('subject')
    const result = subject
      ? ratings.filter((rating) => rating.subject.toLowerCase().includes(subject.toLowerCase()))
      : ratings

    return HttpResponse.json(result)
  }),

  http.post('/api/ratings', async ({ request }) => {
    const body = (await request.json()) as Omit<Rating, 'id' | 'authorName' | 'createdAt'>

    const created: Rating = {
      id: `r-${ratings.length + 1}`,
      subject: body.subject,
      score: body.score,
      comment: body.comment ?? null,
      authorName: 'Přihlášený uživatel',
      createdAt: new Date().toISOString(),
    }

    ratings = [...ratings, created]

    return HttpResponse.json(created, { status: 201 })
  }),
]
