import { HttpResponse, http } from 'msw'
import type { TeacherListItem, TeacherDetails } from './types'

const teachers: TeacherListItem[] = [
  {
    id: 1,
    full_name: 'Jan Novák',
    image_url: null,
    review: 4.5,
  },
  {
    id: 2,
    full_name: 'Petr Svoboda',
    image_url: null,
    review: 5,
  },
  {
    id: 3,
    full_name: 'Marie Dvořáková',
    image_url: null,
    review: null,
  },
]

const teacherDetails: Record<number, TeacherDetails> = {
  1: {
    bio: 'Informace o učitelovi. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    abstention: 5,
    binginess: 3,
    awards: [
      {
        award: 'Pololetí jenž učitel vyhrál.',
        year: 0, // 0 odpovídá roku 2026
      },
    ],
  },
  2: {
    bio: 'Informace o dalším učiteli...',
    abstention: 4,
    binginess: 5,
    awards: [],
  },
  3: {
    bio: 'Další popis učitelky...',
    abstention: 3,
    binginess: 2,
    awards: [
      {
        award: 'Nejlepší učitel druhého pololetí.',
        year: 0,
      },
    ],
  },
}

export const ratingHandlers = [
  // Seznam učitelů pro rating podle GET /api/rating/teachers
  http.get('*/api/rating/teachers', () => HttpResponse.json(teachers)),

  // Detail učitele podle GET /api/rating/teacher/{teacherId}
  // Vrací pouze doplňující údaje (bio, abstention, binginess, awards) bez duplikace dat, která jsou už v paměti
  http.get('*/api/rating/teacher/:teacherId', ({ params }) => {
    const id = Number(params.teacherId)
    const details = teacherDetails[id]
    if (details) {
      return HttpResponse.json(details)
    }
    return new HttpResponse(null, { status: 404 })
  }),

  // Zpětná kompatibilita pro profil endpoint pokud by byl volán
  http.get('*/api/rating/teacher/:teacherId/profile', ({ params }) => {
    const id = Number(params.teacherId)
    const details = teacherDetails[id]
    const teacher = teachers.find((t) => t.id === id)
    if (details && teacher) {
      return HttpResponse.json({ ...teacher, ...details })
    }
    return new HttpResponse(null, { status: 404 })
  }),
]
