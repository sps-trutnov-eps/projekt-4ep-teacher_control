import { HttpResponse, http } from 'msw'
import type { TeacherListItem, TeacherProfile } from './types'

const teachers: TeacherListItem[] = [
  {
    id: 1,
    name: 'Jan Novák',
    photoUrl: null,
    rating: 4.5,
  },
  {
    id: 2,
    name: 'Petr Svoboda',
    photoUrl: null,
    rating: 5,
  },
  {
    id: 3,
    name: 'Marie Dvořáková',
    photoUrl: null,
    rating: null,
  },
]

const profiles: Record<number, TeacherProfile> = {
  1: {
    id: 1,
    name: 'Jan Novák',
    photoUrl: null,
    description:
      'Informace o učitelovi. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    averageRating: 4.5,
    review: 4.5,
    reviewCount: 12,
    abstention: 5,
    binginess: 3,
    award: 'Pololetí jenž učitel vyhrál.',
    year: '2026',
  },
  2: {
    id: 2,
    name: 'Petr Svoboda',
    photoUrl: null,
    description: 'Informace o dalším učiteli...',
    averageRating: 5,
    review: 5,
    reviewCount: 8,
    abstention: 4,
    binginess: 5,
  },
  3: {
    id: 3,
    name: 'Marie Dvořáková',
    photoUrl: null,
    description: 'Další popis učitelky...',
    averageRating: 0,
    review: 0,
    reviewCount: 0,
    abstention: 3,
    binginess: 2,
    award: 'Nejlepší učitel druhého pololetí.',
    year: '2024',
  },
}

export const ratingHandlers = [
  // Seznam učitelů pro rating (dokud backend nedodá endpoint v OpenAPI)
  http.get('*/api/rating/teachers', () => HttpResponse.json(teachers)),
  http.get('*/api/teachers', () => HttpResponse.json(teachers)),

  // Profil učitele – odpovídá backendovému GET /api/rating/teacher/{teacherId}/profile
  http.get('*/api/rating/teacher/:teacherId/profile', ({ params }) => {
    const id = Number(params.teacherId)
    const profile = profiles[id]
    if (profile) {
      return HttpResponse.json(profile)
    }
    return new HttpResponse(null, { status: 404 })
  }),
]
